import { createClient } from 'npm:@supabase/supabase-js@2.117.1'
import Stripe from 'npm:stripe@22.0.0'

const siteUrl = Deno.env.get('SITE_URL')?.replace(/\/$/, '')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const publishableKey = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}').default
  || Deno.env.get('SUPABASE_ANON_KEY')!
const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function respond(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': siteUrl || '',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return respond({ ok: true })
  if (req.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405)
  if (!siteUrl || req.headers.get('origin') !== siteUrl) return respond({ error: 'Origin not allowed.' }, 403)

  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return respond({ error: 'Sign in before purchasing.' }, 401)
  const auth = createClient(supabaseUrl, publishableKey)
  const { data: { user }, error: authError } = await auth.auth.getUser(token)
  if (authError || !user?.email) return respond({ error: 'Sign in before purchasing.' }, 401)

  const { data: purchase, error: readError } = await admin.from('mock_access')
    .select('status').eq('user_id', user.id).maybeSingle()
  if (readError) return respond({ error: 'Could not check access. Try again.' }, 500)
  if (purchase?.status === 'paid') return respond({ error: 'Your account already has mock access.' }, 409)

  const secret = Deno.env.get('STRIPE_SECRET_KEY')
  if (!secret) return respond({ error: 'Checkout is not available yet.' }, 503)

  try {
    const stripe = new Stripe(secret)
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'aud',
          unit_amount: 499,
          product_data: { name: 'Common Bond — Full Mock Test access' },
        },
        quantity: 1,
      }],
      metadata: { product: 'full_mock_lifetime', user_id: user.id },
      success_url: `${siteUrl}/?checkout=success`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
    })
    if (!checkout.url) throw new Error('Checkout URL is missing')
    return respond({ url: checkout.url })
  } catch (error) {
    console.error('Could not create mock checkout', error)
    return respond({ error: 'Checkout could not start. Try again shortly.' }, 503)
  }
})
