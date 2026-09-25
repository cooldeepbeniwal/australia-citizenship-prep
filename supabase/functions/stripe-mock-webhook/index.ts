import { createClient } from 'npm:@supabase/supabase-js@2.117.1'
import Stripe from 'npm:stripe@22.0.0'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)
const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const signature = req.headers.get('stripe-signature')
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!secret || !stripeKey) return new Response('Webhook unavailable', { status: 503 })
  if (!signature) return new Response('Missing signature', { status: 400 })
  const stripe = new Stripe(stripeKey)

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(), signature, secret, undefined, cryptoProvider,
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
      if (session.mode !== 'payment' || session.payment_status !== 'paid'
        || session.amount_total !== 499 || session.currency !== 'aud'
        || session.metadata?.product !== 'full_mock_lifetime'
        || !session.client_reference_id || session.client_reference_id !== session.metadata.user_id
        || !intentId) return new Response('Ignored', { status: 200 })

      // A delayed or replayed checkout event must not reinstate an already refunded charge.
      const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ['latest_charge'] })
      const charge = intent.latest_charge
      if (typeof charge === 'object' && charge && charge.amount_refunded >= charge.amount) {
        return new Response('Already refunded', { status: 200 })
      }
      const { error } = await admin.from('mock_access').upsert({
        user_id: session.client_reference_id,
        checkout_session_id: session.id,
        payment_intent_id: intentId,
        status: 'paid',
      }, { onConflict: 'user_id' })
      if (error) throw error
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (intentId && charge.amount_refunded >= charge.amount) {
        const { error } = await admin.from('mock_access').update({ status: 'refunded' })
          .eq('payment_intent_id', intentId)
        if (error) throw error
      }
    }
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Mock purchase webhook failed', error)
    return new Response('Retry later', { status: 500 })
  }
})
