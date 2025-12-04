/**
 * Endpoint de teste para verificar configuração da PushInPay
 * 
 * GET /api/payments/test-config
 * 
 * Retorna informações sobre a configuração (sem expor dados sensíveis)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.PUSHINPAY_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_PUSHINPAY_API_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Informações de configuração (sem expor dados sensíveis)
    const config = {
      apiKey: {
        present: !!apiKey,
        length: apiKey?.length || 0,
        preview: apiKey && apiKey.length > 8 
          ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
          : null,
        valid: apiKey && apiKey.trim().length > 0,
      },
      baseUrl: {
        present: !!baseUrl,
        value: baseUrl || 'https://app.pushinpay.com.br/app (padrão)',
        valid: baseUrl ? (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) : true,
      },
      appUrl: {
        present: !!appUrl,
        value: appUrl || 'Não configurado',
      },
      status: {
        configured: !!(apiKey && apiKey.trim().length > 0),
        ready: !!(apiKey && apiKey.trim().length > 0 && (baseUrl || true)),
      },
    };

    // Verificar URLs conhecidas da PushInPay
    const knownUrls = [
      'https://app.pushinpay.com.br/app',
      'https://app.pushinpay.com.br',
      'https://api.pushinpay.com.br',
      'https://pushinpay.com.br/api',
    ];

    const recommendations = [];
    
    if (!apiKey) {
      recommendations.push({
        type: 'error',
        message: 'PUSHINPAY_API_KEY não configurada',
        action: 'Adicione PUSHINPAY_API_KEY no arquivo .env.local',
      });
    }

    if (!baseUrl) {
      recommendations.push({
        type: 'warning',
        message: 'NEXT_PUBLIC_PUSHINPAY_API_URL não configurada',
        action: 'Adicione NEXT_PUBLIC_PUSHINPAY_API_URL no arquivo .env.local (opcional, usa padrão)',
      });
    }

    if (baseUrl && !knownUrls.some(url => baseUrl.includes(url.replace('https://', '').split('/')[0]))) {
      recommendations.push({
        type: 'info',
        message: 'URL não está nas URLs conhecidas da PushInPay',
        action: 'Verifique se a URL está correta na documentação oficial',
        knownUrls,
      });
    }

    return NextResponse.json({
      config,
      recommendations,
      documentation: {
        official: 'https://doc.pushinpay.com.br',
        website: 'https://pushinpay.com.br',
      },
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Erro ao verificar configuração',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

















