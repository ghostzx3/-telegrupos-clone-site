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

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/dashboard/senha`,
      });

      if (error) throw error;

      setForgotPasswordSent(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? "Entrar" : "Cadastrar"}
          </DialogTitle>
          <DialogDescription>
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="button"
              onClick={handleForgotPassword}
              className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#038ede] hover:bg-[#0277c7] text-white"
            disabled={loading}
          >
            {loading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
          </Button>

          <div className="text-center space-y-2">
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="block w-full text-sm text-[#038ede] hover:underline"
              >
                Esqueci a senha
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#038ede] hover:underline"
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