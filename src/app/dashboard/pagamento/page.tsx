"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { PixPaymentDisplay } from "@/components/PixPaymentDisplay";

type PaymentData = {
  paymentId: string;
  transactionId: string;
  pixCode: string;
  qrCodeImage: string;
  amount: number;
  expiresAt: string;
};

const PLAN_NAMES: Record<string, string> = {
  premium: 'Premium',
  featured: 'Destaque',
  boost: 'Impulsionar'
};

// Valores em reais para exibição (a API usa centavos)
const PLAN_DURATIONS: Record<string, Record<number, number>> = {
  premium: { 7: 19.99, 30: 49.99, 90: 119.99 },
  featured: { 7: 29.99, 30: 79.99 },
  boost: { 1: 9.99, 3: 24.99, 7: 19.90 }
};

export default function PagamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan') || '';
  const groupId = searchParams.get('group') || '';
  const duration = parseInt(searchParams.get('duration') || '30');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);


  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);

    // Validar parâmetros
    if (!planType || !groupId) {
      setError("Parâmetros inválidos. Redirecionando...");
      setTimeout(() => router.push('/dashboard/planos'), 2000);
      return;
    }

    // Criar pagamento automaticamente
    createPayment();
  }

  async function createPayment() {
    setCreating(true);
    setError("");

    try {
      // Validar dados antes de enviar
      if (!groupId || !planType || !duration) {
        throw new Error('Dados incompletos: groupId, planType e duration são obrigatórios');
      }

      console.log('Criando pagamento:', { groupId, planType, duration });

      const response = await fetch('/api/payments/create-pix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          planType,
          duration
        })
      });

      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Verificar se a resposta tem conteúdo antes de fazer parse
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          const text = await response.text();
          throw new Error(`Erro ao processar resposta: ${text || 'Resposta inválida'}`);
        }
      } else {
        const text = await response.text();
        throw new Error(`Resposta inesperada (${response.status}): ${text || 'Sem conteúdo'}`);
      }

      if (!response.ok) {
        // Tratamento especial para erro 405
        if (response.status === 405) {
          const errorMessage = 'Método não permitido. A rota pode não estar configurada corretamente. Verifique se o servidor foi reiniciado após as alterações.';
          console.error('Erro 405 - Method Not Allowed:', {
            status: response.status,
            statusText: response.statusText,
            method: 'POST',
            url: '/api/payments/create-pix',
            data: data
          });
          throw new Error(errorMessage);
        }

        // Mostrar erro mais detalhado
        const errorMessage = data?.details 
          ? `${data.error || 'Erro'}: ${data.details}`
          : data?.error || `Erro HTTP ${response.status}: ${response.statusText}`;
        
        console.error('Payment creation error:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: '/api/payments/create-pix'
        });
        throw new Error(errorMessage);
      }

      setPaymentData({
        paymentId: data.paymentId,
        transactionId: data.transactionId,
        pixCode: data.pixCode,
        qrCodeImage: data.qrCodeImage,
        amount: data.amount,
        expiresAt: data.expiresAt
      });
    } catch (err: any) {
      console.error('Error creating payment:', err);
      const errorMessage = err.message || "Erro ao criar pagamento. Tente novamente.";
      setError(errorMessage);
      
      // Se for erro de configuração, mostrar mensagem mais clara
      if (errorMessage.includes('not configured') || errorMessage.includes('API Key')) {
        setError("Erro de configuração: Verifique as variáveis de ambiente do PushInPay");
      }
    } finally {
      setCreating(false);
    }
  }

  const handlePaymentConfirmed = () => {
    router.push('/dashboard');
  };

  const amount = PLAN_DURATIONS[planType]?.[duration] || 0;
  const planName = PLAN_NAMES[planType] || planType;

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#038ede]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <DashboardSidebar activeItem="planos" />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard/planos')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pagamento PIX</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Plano: <strong>{planName}</strong> - {duration} dias
          </p>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <X className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {creating && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#038ede] mx-auto mb-4" />
                <p className="text-gray-600">Gerando código PIX...</p>
              </CardContent>
            </Card>
          )}

          {paymentData && (
            <>
              {/* Resumo do Pagamento */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Resumo do Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plano:</span>
                      <span className="font-medium">{planName} - {duration} dias</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-[#038ede]">R$ {amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Componente de Exibição do PIX */}
              <PixPaymentDisplay
                paymentId={paymentData.paymentId}
                pixCode={paymentData.pixCode}
                qrCodeImage={paymentData.qrCodeImage}
                amount={paymentData.amount}
                expiresAt={paymentData.expiresAt}
                onPaymentConfirmed={handlePaymentConfirmed}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

