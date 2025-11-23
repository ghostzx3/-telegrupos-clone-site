"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Ler token da URL apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        verifyToken(tokenParam);
      } else {
        setTokenValid(false);
        setError("Token não encontrado na URL.");
        setLoading(false);
      }
    }
  }, []);

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

  async function handleResetPassword() {
    setError("");
    setSuccess("");

    // Validações
    if (!newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setResetting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao resetar senha');
      }

      setSuccess("Senha alterada com sucesso! Redirecionando...");
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/?login=true');
      }, 2000);
    } catch (err: any) {
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
              <p className="text-sm text-gray-600">
                Digite sua nova senha abaixo. Ela deve ter pelo menos 6 caracteres.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                  disabled={resetting}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !resetting) {
                      handleResetPassword();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={resetting || !newPassword || !confirmPassword}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
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

