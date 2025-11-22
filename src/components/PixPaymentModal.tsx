"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Check, Copy, Clock, X } from "lucide-react";
import Image from "next/image";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    paymentId: string;
    pixCode: string;
    qrCodeImage: string;
    amount: number;
    expiresAt: string;
  } | null;
}

export function PixPaymentModal({ isOpen, onClose, paymentData }: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [expired, setExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');

  useEffect(() => {
    if (!paymentData) return;

    // Update countdown timer
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(paymentData.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setExpired(true);
        setTimeLeft("Expirado");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData]);

  // Poll for payment status
  useEffect(() => {
    if (!paymentData || paymentStatus === 'paid') return;

    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payments/status/${paymentData.paymentId}`);
        const data = await response.json();

        if (data.status === 'paid') {
          setPaymentStatus('paid');
          setTimeout(() => {
            alert('Pagamento confirmado! Seu grupo foi atualizado.');
            onClose();
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    };

    const interval = setInterval(checkPayment, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [paymentData, paymentStatus, onClose]);

  const handleCopy = async () => {
    if (!paymentData) return;

    try {
      await navigator.clipboard.writeText(paymentData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('Erro ao copiar código PIX');
    }
  };

  if (!paymentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {paymentStatus === 'paid' ? '✅ Pagamento Confirmado!' : '💳 Pagar com PIX'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {paymentStatus === 'paid'
              ? 'Seu grupo foi atualizado com sucesso!'
              : `Total: R$ ${paymentData.amount.toFixed(2)}`
            }
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'pending' && (
          <div className="space-y-4">
            {/* Timer */}
            {!expired && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                <Clock className="w-4 h-4" />
                <span>Expira em: <strong>{timeLeft}</strong></span>
              </div>
            )}

            {expired && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <X className="w-4 h-4" />
                <span><strong>PIX expirado</strong> - Gere um novo</span>
              </div>
            )}

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <p className="text-center text-sm font-medium text-gray-700 mb-3">
                1. Escaneie o QR Code com seu banco
              </p>
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  <Image
                    src={paymentData.qrCodeImage}
                    alt="QR Code PIX"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-gray-500">ou</span>
              </div>
            </div>

            {/* PIX Code */}
            <div>
              <p className="text-center text-sm font-medium text-gray-700 mb-2">
                2. Copie o código PIX
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-600 break-all font-mono mb-2">
                  {paymentData.pixCode}
                </p>
                <Button
                  onClick={handleCopy}
                  className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
                  disabled={expired}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-medium mb-1">
                ℹ️ Como funciona:
              </p>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha PIX → Pagar</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
                <li>Aguarde a confirmação automática (até 10 segundos)</li>
              </ol>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#038ede]"></div>
                <span>Aguardando pagamento...</span>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'paid' && (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Pagamento processado com sucesso!
            </p>
            <Button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="bg-[#038ede] hover:bg-[#0277c7] text-white"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}