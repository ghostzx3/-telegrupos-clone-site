"use client";

/**
 * Componente para exibir pagamento PIX
 * 
 * Exibe:
 * - QR Code para escanear
 * - Código PIX copia e cola
 * - Timer de expiração
 * - Status do pagamento
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Clock, Loader2 } from "lucide-react";
import Image from "next/image";

interface PixPaymentDisplayProps {
  paymentId: string;
  pixCode: string;
  qrCodeImage: string;
  amount: number;
  expiresAt: string;
  onPaymentConfirmed?: () => void;
}

export function PixPaymentDisplay({
  paymentId,
  pixCode,
  qrCodeImage,
  amount,
  expiresAt,
  onPaymentConfirmed,
}: PixPaymentDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [expired, setExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending');

  // Atualizar timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setExpired(true);
        setPaymentStatus('expired');
        setTimeLeft("Expirado");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Consultar status do pagamento
  useEffect(() => {
    if (paymentStatus !== 'pending' || expired) return;

    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payments/status/${paymentId}`);
        const data = await response.json();

        if (data.status === 'paid') {
          setPaymentStatus('paid');
          if (onPaymentConfirmed) {
            setTimeout(() => {
              onPaymentConfirmed();
            }, 2000);
          }
        } else if (data.status === 'expired') {
          setPaymentStatus('expired');
          setExpired(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    // Verificar imediatamente e depois a cada 5 segundos
    checkPayment();
    const interval = setInterval(checkPayment, 5000);

    return () => clearInterval(interval);
  }, [paymentId, paymentStatus, expired, onPaymentConfirmed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('Erro ao copiar código PIX');
    }
  };

  if (paymentStatus === 'paid') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ✅ Pagamento Confirmado!
          </h2>
          <p className="text-green-700">
            Seu pagamento foi processado com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (expired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-red-700 font-medium">
            PIX expirado. Gere um novo pagamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Tempo restante: <strong className="text-lg">{timeLeft}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Escaneie o QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">
              1. Abra o app do seu banco e escaneie o QR Code
            </p>
                      <div className="flex justify-center">
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-white p-3 sm:p-4 rounded-lg">
                          <Image
                            src={qrCodeImage}
                            alt="QR Code PIX"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
          </div>
        </CardContent>
      </Card>

      {/* Código PIX Copia e Cola */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Ou copie o código PIX</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              2. Copie o código abaixo e cole no app do seu banco
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 break-all font-mono mb-4 text-center">
                {pixCode}
              </p>
              <Button
                onClick={handleCopy}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Como pagar com PIX:</h3>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção <strong>PIX</strong> → <strong>Pagar</strong></li>
            <li>Escaneie o QR Code acima ou cole o código copiado</li>
            <li>Confirme o valor e finalize o pagamento</li>
            <li>Aguarde a confirmação automática (até 10 segundos)</li>
          </ol>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="inline-flex items-center gap-3 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin text-[#038ede]" />
            <span className="font-medium">Aguardando confirmação do pagamento...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Esta página será atualizada automaticamente quando o pagamento for confirmado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

