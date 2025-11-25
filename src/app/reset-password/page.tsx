"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [hasToken, setHasToken] = useState(false);

  // Verificar token do Supabase no hash da URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      // Verificar se é um token de recuperação do Supabase
      if (accessToken && type === 'recovery') {
        setHasToken(true);
        verifySupabaseToken(accessToken);
      } else {
        // Tentar token customizado na query string (fallback)
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
          setHasToken(true);
          verifyToken(tokenParam);
        } else {
          setTokenValid(false);
          setError("Token não encontrado na URL.");
          setLoading(false);
        }
      }
    }
  }, []);

  // Verificar token do Supabase
  async function verifySupabaseToken(accessToken: string) {
    setVerifying(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Tentar fazer login com o token de recuperação
      // Isso valida automaticamente o token
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Não necessário para validação
      });

      if (sessionError || !data.session) {
        setTokenValid(false);
        setError("Token inválido ou expirado.");
      } else {
        setTokenValid(true);
        // Limpar a hash da URL após validar
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (err: any) {
      setTokenValid(false);
      setError("Erro ao verificar token. Tente novamente.");
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  }

  // Verificar token customizado (fallback)
  async function verifyToken(tokenToVerify: string) {
    setVerifying(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(tokenToVerify)}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError(data.error || "Token inválido ou expirado.");
      }
    } catch (err: any) {
      setTokenValid(false);
      setError("Erro ao verificar token. Tente novamente.");
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  }

  // Validação robusta de senha
  function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres");
    }

    if (password.length > 128) {
      errors.push("A senha não pode ter mais de 128 caracteres");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }

    // Verificar caracteres especiais (opcional, mas recomendado)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async function handleResetPassword() {
    setError("");
    setSuccess("");

    // Validações básicas
    if (!newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    // Validação robusta de senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setResetting(true);

    try {
      const supabase = createClient();
      
      // Verificar se ainda há uma sessão válida (token ainda válido)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Sessão expirada. Por favor, solicite um novo link de recuperação.");
      }

      // Usar o método do Supabase para atualizar a senha
      // O Supabase já validou o token na sessão
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        // Tratamento específico de erros do Supabase
        if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
          throw new Error("Token expirado ou inválido. Por favor, solicite um novo link de recuperação.");
        }
        throw updateError;
      }

      setSuccess("Senha alterada com sucesso! Redirecionando para login...");
      
      // Fazer logout para forçar novo login
      await supabase.auth.signOut();
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/?login=true');
      }, 2000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || "Erro ao alterar senha. Tente novamente.");
    } finally {
      setResetting(false);
    }
  }

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#038ede] mx-auto mb-4" />
            <p className="text-gray-600">Verificando token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-xl">Token Inválido</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "O token de recuperação é inválido ou expirou."}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Possíveis motivos:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>O link expirou (válido por 15 minutos)</li>
                <li>O link já foi utilizado</li>
                <li>O link está incorreto ou foi alterado</li>
              </ul>
            </div>
            <div className="pt-4">
              <Link href="/?forgot-password=true">
                <Button className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white">
                  Solicitar Novo Link
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Link href="/" className="text-sm text-[#038ede] hover:underline">
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-[#038ede]" />
            <CardTitle className="text-xl">Redefinir Senha</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          )}

          {!success && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Requisitos da senha:
                </p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Mínimo de 8 caracteres</li>
                  <li>Pelo menos uma letra minúscula</li>
                  <li>Pelo menos uma letra maiúscula</li>
                  <li>Pelo menos um número</li>
                  <li>Pelo menos um caractere especial (!@#$%^&*...)</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  disabled={resetting}
                  className="h-12 text-base"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  disabled={resetting}
                  className="h-12 text-base"
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !resetting && newPassword && confirmPassword) {
                      handleResetPassword();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={resetting || !newPassword || !confirmPassword || newPassword.length < 8}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white h-12 text-base font-medium"
              >
                {resetting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Alterando senha...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </>
          )}

          <div className="text-center pt-4 border-t">
            <Link href="/" className="text-sm text-[#038ede] hover:underline">
              Voltar para o início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#038ede]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

