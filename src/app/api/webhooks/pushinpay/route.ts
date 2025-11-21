import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verify webhook signature (if PushInPay provides one)
    const signature = request.headers.get('x-pushinpay-signature')
    if (process.env.PUSHINPAY_WEBHOOK_SECRET && signature) {
      // Add signature verification logic here based on PushInPay docs
      // For now, we'll proceed without verification (add this in production)
    }

    const { transactionId, status, amount, externalReference } = body

    console.log('PushInPay webhook received:', { transactionId, status, amount })

    // Only process paid transactions
    if (status !== 'paid' && status !== 'approved') {
      return NextResponse.json({ received: true, processed: false })
    }

    // Find payment in database
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, groups(*)')
      .eq('external_id', transactionId)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', transactionId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if already processed
    if (payment.status === 'paid') {
      console.log('Payment already processed:', transactionId)
      return NextResponse.json({ received: true, processed: false })
    }

    // Update payment status
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    // Calculate premium expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + payment.duration_days)

    // Update group based on plan type
    const updates: Record<string, any> = {
      premium_expires_at: expiresAt.toISOString(),
    }

    if (payment.plan_type === 'premium' || payment.plan_type === 'featured') {
      updates.is_premium = true
    }

    if (payment.plan_type === 'featured') {
      updates.is_featured = true
    }

    await supabaseAdmin
      .from('groups')
      .update(updates)
      .eq('id', payment.group_id)

    console.log('Group updated successfully:', payment.group_id, updates)

    return NextResponse.json({
      received: true,
      processed: true,
      groupId: payment.group_id,
      planType: payment.plan_type,
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
