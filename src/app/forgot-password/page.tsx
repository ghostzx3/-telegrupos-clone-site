"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validação de email
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validações
    if (!email.trim()) {
      setError("Por favor, informe seu email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, informe um email válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email de recuperação');
      }

      // Sucesso - sempre mostrar mensagem de sucesso (security best practice)
      setSuccess(true);
      setEmail(""); // Limpar campo
    } catch (err: any) {
      // Em caso de erro, ainda mostrar mensagem genérica de sucesso
      // para não revelar se o email existe ou não (security best practice)
      setSuccess(true);
      setEmail("");
      
      // Logar erro apenas no console para debug
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending reset email:', err);
        setError(err.message || 'Erro ao processar solicitação');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#038ede]/10 p-3">
              <Mail className="w-8 h-8 text-[#038ede]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription className="text-base">
            {success 
              ? "Verifique sua caixa de entrada" 
              : "Digite seu email para receber um link de recuperação"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Email enviado com sucesso!
                  </p>
                  <p className="text-sm text-green-700">
                    Se o email informado estiver cadastrado, você receberá um link para redefinir sua senha.
                    Verifique sua caixa de entrada e a pasta de spam.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">Não recebeu o email?</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verifique sua pasta de spam</li>
                  <li>Confirme se o email está correto</li>
                  <li>Aguarde alguns minutos e tente novamente</li>
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Enviar outro email
                </Button>
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o início
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  className="h-12 text-base"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white h-12 text-base font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Link de Recuperação
                  </>
                )}
              </Button>

              <div className="text-center pt-4 border-t">
                <Link href="/?login=true" className="text-sm text-[#038ede] hover:underline">
                  Lembrou sua senha? Fazer login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

