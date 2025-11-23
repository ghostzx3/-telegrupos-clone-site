/**
 * API Route para criar pagamento PIX via PushInPay
 * 
 * Endpoint: POST /api/payments/create-pix
 * 
 * Body esperado:
 * {
 *   "groupId": "uuid-do-grupo",
 *   "planType": "premium" | "featured" | "boost",
 *   "duration": 7 | 30 | 90 (dias)
 * }
 * 
 * Resposta:
 * {
 *   "paymentId": "uuid",
 *   "transactionId": "id-da-transacao",
 *   "pixCode": "código-pix-copia-e-cola",
 *   "qrCodeImage": "data:image/png;base64,...",
 *   "amount": 19.99,
 *   "expiresAt": "2025-01-01T12:00:00Z"
 * }
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPushInPayClient } from '@/lib/pushinpay/client'
import QRCode from 'qrcode'

// Preços em centavos
const PRICING = {
  premium: {
    7: 1999,   // R$ 19.99
    30: 4999,  // R$ 49.99
    90: 11999, // R$ 119.99
  },
  featured: {
    7: 2999,   // R$ 29.99
    30: 7999,  // R$ 79.99
  },
  boost: {
    1: 999,    // R$ 9.99
    3: 2499,   // R$ 24.99
    7: 1990,   // R$ 19.90
  },
}

// Método GET para debug
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API de pagamento PIX está funcionando',
    method: 'GET',
    availableMethods: ['POST'],
    endpoint: '/api/payments/create-pix',
    documentation: 'Use POST para criar um pagamento PIX'
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado', details: 'Você precisa estar logado para criar um pagamento' },
        { status: 401 }
      )
    }

    // 2. Parse do body
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'JSON inválido', details: 'O corpo da requisição deve ser um JSON válido' },
        { status: 400 }
      )
    }

    const { groupId, planType, duration } = body

    // 3. Validação dos dados
    if (!groupId || !planType || !duration) {
      return NextResponse.json(
        { 
          error: 'Dados incompletos', 
          details: 'groupId, planType e duration são obrigatórios',
          received: { groupId: !!groupId, planType: !!planType, duration: !!duration }
        },
        { status: 400 }
      )
    }

    // 4. Validar plano e obter valor
    const planPricing = PRICING[planType as keyof typeof PRICING] as Record<number, number>
    if (!planPricing) {
      return NextResponse.json(
        { error: 'Plano inválido', details: `Plano deve ser: premium, featured ou boost` },
        { status: 400 }
      )
    }

    const amount = planPricing[duration]
    if (!amount) {
      return NextResponse.json(
        { error: 'Duração inválida', details: `Duração ${duration} não disponível para o plano ${planType}` },
        { status: 400 }
      )
    }

    // 5. Buscar dados do usuário e grupo
    const [profileResult, groupResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single(),
      supabase
        .from('groups')
        .select('title')
        .eq('id', groupId)
        .single()
    ])

    const profile = profileResult.data
    const group = groupResult.data

    if (!group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado', details: `Grupo com ID ${groupId} não existe` },
        { status: 404 }
      )
    }

    // 6. Criar pagamento via PushInPay
    let pushInPay;
    try {
      pushInPay = getPushInPayClient();
      console.log('[API] Cliente PushInPay inicializado com sucesso');
    } catch (clientError: any) {
      console.error('[API] Erro ao inicializar cliente PushInPay:', clientError);
      return NextResponse.json(
        {
          error: 'Erro de configuração',
          details: clientError.message || 'Não foi possível inicializar o cliente PushInPay',
          hint: 'Verifique as variáveis de ambiente PUSHINPAY_API_KEY e NEXT_PUBLIC_PUSHINPAY_API_URL',
        },
        { status: 500 }
      );
    }
    
    const paymentData = {
      amount: amount / 100, // Converter centavos para reais
      description: `${planType.toUpperCase()} - ${group.title} - ${duration} dias`,
      externalReference: `${user.id}-${groupId}-${Date.now()}`,
      payer: {
        email: profile?.email || user.email || '',
        name: profile?.full_name || 'Cliente',
      },
      expiresIn: 3600, // 1 hora
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pushinpay`,
    }

    console.log('[API] Criando pagamento PushInPay:', {
      amount: paymentData.amount,
      description: paymentData.description,
      externalReference: paymentData.externalReference,
    })

    const pixResponse = await pushInPay.createPixPayment(paymentData)

    // 7. Gerar QR Code se não vier na resposta
    let qrCodeImage: string;
    if (pixResponse.qrCodeBase64 || pixResponse.qrCodeImage) {
      // Se já vem em base64, usar diretamente
      const base64 = pixResponse.qrCodeBase64 || pixResponse.qrCodeImage || '';
      if (base64.startsWith('data:image')) {
        qrCodeImage = base64;
      } else {
        qrCodeImage = `data:image/png;base64,${base64}`;
      }
    } else {
      // Gerar QR Code a partir do código PIX
      try {
        qrCodeImage = await QRCode.toDataURL(pixResponse.pixCode, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (qrError: any) {
        console.error('[API] Erro ao gerar QR Code:', qrError)
        return NextResponse.json(
          { error: 'Erro ao gerar QR Code', details: qrError.message },
          { status: 500 }
        )
      }
    }

    // 8. Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + (paymentData.expiresIn || 3600))

    // 9. Salvar no banco de dados
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        group_id: groupId,
        payment_provider: 'pushinpay',
        external_id: pixResponse.id || pixResponse.transactionId || '',
        pix_code: pixResponse.pixCode,
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
      console.error('[API] Erro ao salvar pagamento no banco:', paymentError)
      return NextResponse.json(
        { error: 'Erro ao salvar pagamento', details: paymentError.message },
        { status: 500 }
      )
    }

    const durationMs = Date.now() - startTime;
    console.log(`[API] Pagamento criado com sucesso em ${durationMs}ms:`, {
      paymentId: payment.id,
      transactionId: pixResponse.id,
      amount: amount / 100,
    })

    // 10. Retornar resposta
    return NextResponse.json({
      paymentId: payment.id,
      transactionId: pixResponse.id || pixResponse.transactionId || payment.external_id,
      pixCode: pixResponse.pixCode,
      pix_copia_e_cola: pixResponse.pixCode, // Alias para compatibilidade
      qrCodeImage,
      amount: amount / 100,
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
    }, { status: 201 })

  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error(`[API] Erro após ${durationMs}ms:`, {
      error: error.message,
      stack: error.stack,
      status: error.status,
      data: error.data,
    })

    // Retornar erro formatado
    const status = error.status || 500;
    const errorMessage = error.message || 'Erro desconhecido ao criar pagamento';
    const errorDetails = error.data || error.details || errorMessage;

    return NextResponse.json(
      {
        error: 'Erro ao criar pagamento PIX',
        details: errorDetails,
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            message: error.message,
            status: error.status,
            stack: error.stack,
          }
        })
      },
      { status }
    )
  }
}
