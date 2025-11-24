"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Save } from "lucide-react";

export default function SenhaPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    
    // Verificar se há token de recuperação na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      // Usuário veio do link de recuperação
      setIsRecovery(true);
      setIsAuthenticated(true);
      setLoading(false);
      // Limpar a hash da URL
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }

  async function handleChangePassword() {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (user && !isRecovery) {
        // Usuário logado - precisa da senha atual
        if (!currentPassword) {
          setError("Digite sua senha atual");
          setSaving(false);
          return;
        }

        // Verificar senha atual
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPassword,
        });

        if (signInError) {
          setError("Senha atual incorreta");
          setSaving(false);
          return;
        }
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestPasswordReset() {
    setError("");
    setSuccess("");

    const supabase = createClient();
    const email = prompt("Digite seu email:");

    if (!email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/senha`,
      });

      if (error) throw error;

      setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
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
      <DashboardSidebar activeItem="senha" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Senha de Acesso</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 flex-shrink-0" />
              <CardTitle className="text-lg sm:text-xl">
                {isRecovery ? "Redefinir Senha" : "Alterar Senha"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {!isRecovery && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="h-12 sm:h-11 text-base"
                  autoComplete="current-password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                className="h-12 sm:h-11 text-base"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="h-12 sm:h-11 text-base"
                autoComplete="new-password"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Alterar Senha'}
            </Button>

            {!isRecovery && (
              <div className="pt-4 border-t">
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Esqueceu sua senha?
                </p>
                <Button
                  onClick={handleRequestPasswordReset}
                  variant="outline"
                  className="w-full h-12 min-h-[44px] text-base font-medium"
                >
                  Enviar Link de Recuperação por Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

