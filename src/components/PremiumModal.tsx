"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PixPaymentModal } from "./PixPaymentModal";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
}

const PLANS = [
  {
    type: 'premium',
    name: 'Premium',
    description: 'Destaque seu grupo com badge Premium',
    features: ['Badge "Plus" verde', 'Aparece nas primeiras posições', 'Mais visibilidade'],
    pricing: [
      { duration: 7, price: 19.99, label: '7 dias' },
      { duration: 30, price: 49.99, label: '30 dias', popular: true },
      { duration: 90, price: 119.99, label: '90 dias' },
    ],
  },
  {
    type: 'featured',
    name: 'Destaque',
    description: 'Máxima visibilidade para seu grupo',
    features: ['Badge "Plus" verde', 'Aparece em destaque no topo', 'Prioridade máxima', 'Mais conversões'],
    pricing: [
      { duration: 7, price: 29.99, label: '7 dias' },
      { duration: 30, price: 79.99, label: '30 dias', popular: true },
    ],
  },
  {
    type: 'boost',
    name: 'Impulso Rápido',
    description: 'Boost rápido de visibilidade',
    features: ['Impulsiona visualizações', 'Efeito imediato', 'Ideal para promoções'],
    pricing: [
      { duration: 1, price: 9.99, label: '1 dia' },
      { duration: 3, price: 24.99, label: '3 dias' },
    ],
  },
];

export function PremiumModal({ isOpen, onClose, groupId }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  async function handlePurchase() {
    if (!groupId || !selectedPlan || !selectedDuration) {
      alert('Selecione um plano e duração');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Você precisa estar logado para fazer upgrade');
      setLoading(false);
      return;
    }

    try {
      // Create PIX payment
      const response = await fetch('/api/payments/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          planType: selectedPlan,
          duration: selectedDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar PIX');
      }

      const data = await response.json();

      // Show PIX modal
      setPixData(data);
      setShowPixModal(true);
      onClose(); // Close the plan selection modal

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Impulsionar Grupo</DialogTitle>
            <DialogDescription>
              Escolha um plano para dar mais visibilidade ao seu grupo
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {PLANS.map((plan) => (
              <div
                key={plan.type}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.type
                    ? 'border-[#038ede] bg-[#038ede]/10'
                    : 'border-gray-200 hover:border-[#038ede]/50'
                }`}
                onClick={() => setSelectedPlan(plan.type)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing Options */}
                <div className="space-y-2">
                  {plan.pricing.map((option) => (
                    <button
                      key={option.duration}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.type);
                        setSelectedDuration(option.duration);
                      }}
                      className={`w-full p-2 rounded text-sm font-medium transition-all ${
                        selectedPlan === plan.type && selectedDuration === option.duration
                          ? 'bg-[#038ede] text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">R$ {option.price.toFixed(2)}</span>
                          {option.popular && (
                            <Badge className="bg-[#d97706] text-white text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handlePurchase}
              disabled={!selectedPlan || !selectedDuration || loading}
              className="flex-1 bg-[#038ede] hover:bg-[#0277c7] text-white"
            >
              {loading ? 'Gerando PIX...' : 'Gerar PIX'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Pagamento seguro via PIX. Aprovação instantânea após confirmação.
          </p>
        </DialogContent>
      </Dialog>

      {/* PIX Payment Modal */}
      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        paymentData={pixData}
      />
    </>
  );
}