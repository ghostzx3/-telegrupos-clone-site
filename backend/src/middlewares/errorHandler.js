/**
 * Middleware global para tratamento de erros
 */
export function errorHandler(err, req, res, next) {
  console.error('Erro capturado:', err);

  // Se já foi enviada uma resposta, passar para o próximo handler
  if (res.headersSent) {
    return next(err);
  }

  // Erros conhecidos do Telegram Service
  if (err.code) {
    return res.status(500).json({
      success: false,
      error: err.code,
      message: err.message || 'Erro ao processar requisição',
    });
  }

  // Erros do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'duplicate_entry',
      message: 'Registro duplicado',
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: 'internal_server_error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno do servidor',
  });
}

/**
 * Middleware para capturar erros 404
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'not_found',
    message: 'Rota não encontrada',
  });
}








