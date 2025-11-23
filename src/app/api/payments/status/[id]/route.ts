/**
 * API Route para consultar status de pagamento
 * 
 * Endpoint: GET /api/payments/status/[id]
 * 
 * Resposta:
 * {
 *   "status": "pending" | "paid" | "expired" | "cancelled",
 *   "paidAt": "2025-01-01T12:00:00Z" | null,
 *   "expiresAt": "2025-01-01T12:00:00Z"
 * }
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPushInPayClient } from '@/lib/pushinpay/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar pagamento no banco
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('status, paid_at, expires_at, external_id, user_id')
      .eq('id', id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Verificar se o pagamento pertence ao usuário (ou se é admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (payment.user_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Se o pagamento ainda está pendente e tem external_id, consultar na PushInPay
    if (payment.status === 'pending' && payment.external_id) {
      try {
        const pushInPay = getPushInPayClient()
        const statusResponse = await pushInPay.getPaymentStatus(payment.external_id)

        // Atualizar status no banco se mudou
        if (statusResponse.status !== payment.status) {
          await supabase
            .from('payments')
            .update({
              status: statusResponse.status,
              paid_at: statusResponse.paidAt || null,
            })
            .eq('id', id)

          // Se foi pago, atualizar o grupo
          if (statusResponse.status === 'paid') {
            await updateGroupAfterPayment(supabase, payment)
          }
        }

        return NextResponse.json({
          status: statusResponse.status,
          paidAt: statusResponse.paidAt || payment.paid_at,
          expiresAt: statusResponse.expiresAt || payment.expires_at,
        })
      } catch (statusError: any) {
        // Se der erro ao consultar, retornar status do banco
        console.error('[API] Erro ao consultar status na PushInPay:', statusError)
      }
    }

    // Retornar status do banco
    return NextResponse.json({
      status: payment.status,
      paidAt: payment.paid_at,
      expiresAt: payment.expires_at,
    })

  } catch (error: any) {
    console.error('[API] Erro ao consultar status:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar status do pagamento', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Atualiza o grupo após pagamento confirmado
 */
async function updateGroupAfterPayment(supabase: any, payment: any) {
  try {
    // Buscar dados do pagamento
    const { data: paymentData } = await supabase
      .from('payments')
      .select('group_id, plan_type, duration_days')
      .eq('id', payment.id)
      .single()

    if (!paymentData) return

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + paymentData.duration_days)

    // Atualizar grupo baseado no tipo de plano
    const updates: any = {
      premium_expires_at: expiresAt.toISOString(),
    }

    if (paymentData.plan_type === 'premium') {
      updates.is_premium = true
    } else if (paymentData.plan_type === 'featured') {
      updates.is_featured = true
    }

    await supabase
      .from('groups')
      .update(updates)
      .eq('id', paymentData.group_id)

    console.log('[API] Grupo atualizado após pagamento:', paymentData.group_id)
  } catch (error: any) {
    console.error('[API] Erro ao atualizar grupo:', error)
  }
}
