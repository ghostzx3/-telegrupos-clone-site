import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3000;

// Validar variáveis obrigatórias
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ ERRO: TELEGRAM_BOT_TOKEN não configurado!');
  console.error('Configure no arquivo .env');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não configurado!');
  console.error('Configure no arquivo .env');
  process.exit(1);
}

// Conectar ao banco de dados
connectDatabase()
  .then(() => {
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Encerrando servidor...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });











