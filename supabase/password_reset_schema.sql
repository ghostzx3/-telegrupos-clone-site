-- Tabela para armazenar tokens de reset de senha
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  token_hash TEXT NOT NULL, -- Hash do token para segurança
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Tabela para rate limiting (controle de requisições)
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para rate limiting
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_ip ON public.password_reset_attempts(email, ip_address);
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_last_attempt ON public.password_reset_attempts(last_attempt_at);

-- RLS Policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas o próprio usuário pode ver seus tokens (via service role)
-- Tokens são gerenciados apenas pelo backend
CREATE POLICY "Password reset tokens are managed by service role only"
  ON public.password_reset_tokens
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Policy: Tentativas são gerenciadas apenas pelo backend
CREATE POLICY "Password reset attempts are managed by service role only"
  ON public.password_reset_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Função para limpar tokens expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
  
  DELETE FROM public.password_reset_attempts
  WHERE last_attempt_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
















