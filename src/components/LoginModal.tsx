"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;
        alert("Verifique seu email para confirmar o cadastro!");
      }

      onClose();
      // Redirecionar para o dashboard após login
      if (isLogin) {
        window.location.href = '/dashboard';
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setShowForgotPassword(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email de recuperação');
      }

      setForgotPasswordSent(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isLogin ? "Entrar" : "Cadastrar"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isLogin
              ? "Entre com sua conta para acessar recursos exclusivos"
              : "Crie sua conta para começar a compartilhar grupos"}
          </DialogDescription>
        </DialogHeader>

        {showForgotPassword && !forgotPasswordSent ? (
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm sm:text-base font-medium text-gray-700 mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="h-12 sm:h-11 text-base"
                autoComplete="email"
              />
            </div>

            <Button
              type="button"
              onClick={handleForgotPassword}
              className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px]"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setError("");
                }}
                className="text-sm text-[#038ede] hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        ) : forgotPasswordSent ? (
          <div className="space-y-4 mt-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Email de recuperação enviado! Verifique sua caixa de entrada.
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSent(false);
                  setForgotPasswordEmail("");
                }}
                className="text-sm text-[#038ede] hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!isLogin && (
            <div>
              <label className="text-sm sm:text-base font-medium text-gray-700 mb-2 block">
                Nome
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-12 sm:h-11 text-base"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="text-sm sm:text-base font-medium text-gray-700 mb-2 block">
              Email
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 sm:h-11 text-base"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm sm:text-base font-medium text-gray-700 mb-2 block">
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 sm:h-11 text-base"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#038ede] hover:bg-[#0277c7] active:bg-[#0265a8] text-white text-base font-medium h-12 min-h-[44px]"
            disabled={loading}
          >
            {loading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
          </Button>

          <div className="text-center space-y-3 pt-2">
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="block w-full text-sm sm:text-base text-[#038ede] hover:underline min-h-[44px] flex items-center justify-center"
              >
                Esqueci a senha
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm sm:text-base text-[#038ede] hover:underline min-h-[44px] flex items-center justify-center w-full"
            >
              {isLogin
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Entre aqui"}
            </button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}