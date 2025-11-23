"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Rocket, Star } from "lucide-react";

export default function PlanosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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
  }

  function handleSelectPlan(planType: string, duration: number) {
    setSelectedPlan(planType);
    // Redirecionar para página de pagamento
    router.push(`/dashboard/pagamento?plan=${planType}&group=${groupId || ''}&duration=${duration}`);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      durations: [
        { days: 7, price: 19.99 },
        { days: 30, price: 49.99 },
        { days: 90, price: 119.99 }
      ],
      features: [
        'Grupo destacado no topo',
        'Badge Premium visível',
        'Prioridade nas buscas',
        'Estatísticas detalhadas',
        'Suporte prioritário'
      ],
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'featured',
      name: 'Destaque',
      icon: Star,
      durations: [
        { days: 7, price: 29.99 },
        { days: 30, price: 79.99 }
      ],
      features: [
        'Destaque na página inicial',
        'Badge Destaque',
        'Máxima visibilidade',
        'Estatísticas avançadas',
        'Suporte VIP'
      ],
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'boost',
      name: 'Impulsionar',
      icon: Rocket,
      durations: [
        { days: 1, price: 9.99 },
        { days: 3, price: 24.99 },
        { days: 7, price: 19.90 }
      ],
      features: [
        'Impulsionamento temporário',
        'Aparece no topo',
        'Aumento de visualizações',
        'Relatório de performance'
      ],
      color: 'from-green-400 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <DashboardSidebar activeItem="planos" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Planos de Impulsionamento</h1>

        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Escolha um plano para impulsionar seu grupo e aumentar sua visibilidade no site.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-8 h-8 text-gray-700`} />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Opções de duração */}
                  <div className="space-y-2 mb-4">
                    {plan.durations.map((duration) => (
                      <Button
                        key={duration.days}
                        onClick={() => handleSelectPlan(plan.id, duration.days)}
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
                        variant="outline"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{duration.days} {duration.days === 1 ? 'dia' : 'dias'}</span>
                          <span className="font-bold">R$ {duration.price.toFixed(2)}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Como funciona?</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
            <li>• Selecione o plano desejado</li>
            <li>• Complete o pagamento via PIX</li>
            <li>• Seu grupo será destacado automaticamente</li>
            <li>• Receba mais visualizações e membros</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

