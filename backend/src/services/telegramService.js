import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const UPLOADS_DIR = path.join(__dirname, '../../uploads/telegram-photos');

/**
 * Serviço para interagir com a Telegram Bot API
 */
export class TelegramService {
  constructor(botToken) {
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN é obrigatório');
    }
    this.botToken = botToken;
    this.apiBase = `${TELEGRAM_API_BASE}${botToken}`;
  }

  /**
   * Garante que o diretório de uploads existe
   */
  async ensureUploadsDir() {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Busca informações de um chat/grupo/canal
   * @param {string} chatId - ID do chat (ex: @username ou chat_id numérico)
   * @returns {Promise<object>} - Dados do chat
   */
  async getChat(chatId) {
    try {
      const response = await axios.get(`${this.apiBase}/getChat`, {
        params: { chat_id: chatId },
      });

      if (!response.data.ok) {
        throw new Error(response.data.description || 'Erro ao buscar chat');
      }

      return response.data.result;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        
        // Bot não é membro do grupo
        if (errorData.description?.includes('bot is not a member')) {
          throw { code: 'bot_not_member', message: errorData.description };
        }
        
        // Chat não encontrado
        if (errorData.description?.includes('chat not found')) {
          throw { code: 'username_not_found', message: errorData.description };
        }

        throw { 
          code: 'telegram_api_error', 
          message: errorData.description || 'Erro na API do Telegram' 
        };
      }

      throw { 
        code: 'telegram_api_error', 
        message: error.message || 'Erro ao conectar com Telegram API' 
      };
    }
  }

  /**
   * Busca informações de um arquivo
   * @param {string} fileId - ID do arquivo
   * @returns {Promise<object>} - Dados do arquivo
   */
  async getFile(fileId) {
    try {
      const response = await axios.get(`${this.apiBase}/getFile`, {
        params: { file_id: fileId },
      });

      if (!response.data.ok) {
        throw new Error(response.data.description || 'Erro ao buscar arquivo');
      }

      return response.data.result;
    } catch (error) {
      if (error.response) {
        throw { 
          code: 'telegram_api_error', 
          message: error.response.data.description || 'Erro ao buscar arquivo' 
        };
      }

      throw { 
        code: 'telegram_api_error', 
        message: error.message || 'Erro ao conectar com Telegram API' 
      };
    }
  }

  /**
   * Baixa uma imagem do Telegram e salva localmente
   * @param {string} filePath - Caminho do arquivo no Telegram
   * @param {string} chatId - ID do chat (para nomear o arquivo)
   * @returns {Promise<string>} - Caminho relativo do arquivo salvo
   */
  async downloadPhoto(filePath, chatId) {
    try {
      await this.ensureUploadsDir();

      const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
      
      // Baixar a imagem
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });

      // Determinar extensão do arquivo
      const extension = path.extname(filePath) || '.jpg';
      const filename = `${chatId}_${Date.now()}${extension}`;
      const filePathLocal = path.join(UPLOADS_DIR, filename);

      // Salvar arquivo
      await fs.writeFile(filePathLocal, response.data);

      // Retornar caminho relativo
      return `telegram-photos/${filename}`;
    } catch (error) {
      console.error('Erro ao baixar foto:', error);
      throw { 
        code: 'download_failed', 
        message: error.message || 'Erro ao baixar imagem' 
      };
    }
  }

  /**
   * Processa a foto de um chat (se existir)
   * @param {object} chat - Dados do chat retornados pelo getChat
   * @param {string|number} chatId - ID do chat
   * @returns {Promise<string|null>} - Caminho relativo da foto ou null
   */
  async processChatPhoto(chat, chatId) {
    if (!chat.photo) {
      return null;
    }

    try {
      // Usar a foto maior disponível (big_file_id)
      const photoFileId = chat.photo.big_file_id || chat.photo.small_file_id;
      
      if (!photoFileId) {
        return null;
      }

      // Buscar informações do arquivo
      const fileInfo = await this.getFile(photoFileId);
      
      if (!fileInfo.file_path) {
        return null;
      }

      // Baixar e salvar a foto
      const photoPath = await this.downloadPhoto(fileInfo.file_path, chatId);
      
      return photoPath;
    } catch (error) {
      console.error('Erro ao processar foto do chat:', error);
      // Não falhar se não conseguir baixar a foto
      return null;
    }
  }
}








