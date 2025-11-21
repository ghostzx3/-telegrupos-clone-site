import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'
import QRCode from 'qrcode'

const PRICING = {
  premium: {
    7: 1999, // R$ 19.99 for 7 days
    30: 4999, // R$ 49.99 for 30 days
    90: 11999, // R$ 119.99 for 90 days
  },
  featured: {
    7: 2999, // R$ 29.99 for 7 days
    30: 7999, // R$ 79.99 for 30 days
  },
  boost: {
    1: 999, // R$ 9.99 for 1 day
    3: 2499, // R$ 24.99 for 3 days
  },
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId, planType, duration } = await request.json()

  // Validate inputs
  if (!groupId || !planType || !duration) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Get pricing
  const planPricing = PRICING[planType as keyof typeof PRICING] as Record<number, number>
  const amount = planPricing?.[duration]

  if (!amount) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    // Get group info
    const { data: group } = await supabase
      .from('groups')
      .select('title')
      .eq('id', groupId)
      .single()

    // Create PIX payment with PushInPay
    const pushinpayResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_PUSHINPAY_API_URL}/v1/pix/create`,
      {
        amount: amount / 100, // Convert cents to reais
        description: `${planType.toUpperCase()} - ${group?.title || 'Grupo'} - ${duration} dias`,
        externalReference: `${user.id}-${groupId}-${Date.now()}`,
        payer: {
          email: profile?.email || user.email,
          name: profile?.full_name || 'Cliente',
        },
        expiresIn: 3600, // 1 hour
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pushinpay`,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PUSHINPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const { transactionId, pixCode, pixQrCode } = pushinpayResponse.data

    // Generate QR Code image
    const qrCodeImage = await QRCode.toDataURL(pixCode)

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour

    // Store payment in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        group_id: groupId,
        payment_provider: 'pushinpay',
        external_id: transactionId,
        pix_code: pixCode,
        pix_qrcode: qrCodeImage,
        amount,
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        duration_days: duration,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      return NextResponse.json({ error: 'Failed to save payment' }, { status: 500 })
    }

    return NextResponse.json({
      paymentId: payment.id,
      transactionId,
      pixCode,
      qrCodeImage,
      amount: amount / 100,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error: any) {
    console.error('Payment error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: 'Payment failed', details: error.response?.data || error.message },
      { status: 500 }
    )
  }
}
