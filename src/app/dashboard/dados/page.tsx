"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function MeusDadosPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

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
    fetchProfile();
  }

  async function fetchProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setEmail(user.email || '');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
      }
    }
    
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSuccess("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess("Dados atualizados com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <DashboardSidebar activeItem="dados" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Meus Dados</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="h-12 sm:h-11 text-base"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-gray-100 h-12 sm:h-11 text-base"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                O email não pode ser alterado
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



