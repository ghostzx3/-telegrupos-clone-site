import { PrismaClient } from '@prisma/client';
import { TelegramService } from '../services/telegramService.js';
import { validateLink } from '../utils/linkValidator.js';

const prisma = new PrismaClient();
const telegramService = new TelegramService(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Controller para buscar informações de um grupo do Telegram
 * POST /buscar-grupo
 */
export async function buscarGrupo(req, res, next) {
  try {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({
        success: false,
        error: 'invalid_link_format',
        message: 'Link é obrigatório',
      });
    }

    // Validar link
    const validation = validateLink(link);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        message: 'Formato de link inválido',
      });
    }

    const { username } = validation;

    // Buscar informações do chat no Telegram
    let chat;
    try {
      chat = await telegramService.getChat(`@${username}`);
    } catch (error) {
      // Tratar erros específicos do Telegram
      if (error.code === 'bot_not_member') {
        return res.status(403).json({
          success: false,
          error: 'bot_not_member',
          message: 'O bot precisa ser membro do grupo para acessar as informações',
        });
      }

      if (error.code === 'username_not_found') {
        return res.status(404).json({
          success: false,
          error: 'username_not_found',
          message: 'Grupo ou canal não encontrado',
        });
      }

      throw error;
    }

    // Processar foto (se existir)
    let photoPath = null;
    let photoUrl = null;
    
    try {
      photoPath = await telegramService.processChatPhoto(chat, chat.id);
      
      if (photoPath) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        photoUrl = `${baseUrl}/uploads/${photoPath}`;
      }
    } catch (error) {
      console.error('Erro ao processar foto:', error);
      // Continuar mesmo se não conseguir baixar a foto
    }

    // Preparar dados para salvar
    const groupData = {
      telegramId: BigInt(chat.id),
      username: chat.username || username,
      title: chat.title || null,
      description: chat.description || null,
      type: chat.type || null,
      photoPath: photoPath,
    };

    // Salvar ou atualizar no banco
    const savedGroup = await prisma.telegramGroup.upsert({
      where: { telegramId: BigInt(chat.id) },
      update: {
        ...groupData,
        fetchedAt: new Date(),
      },
      create: groupData,
    });

    // Retornar resposta de sucesso
    return res.json({
      success: true,
      data: {
        id: savedGroup.id,
        username: savedGroup.username,
        title: savedGroup.title,
        description: savedGroup.description,
        type: savedGroup.type,
        photoUrl: photoUrl,
      },
    });
  } catch (error) {
    // Passar erro para o middleware de tratamento
    next(error);
  }
}

/**
 * Controller para buscar um grupo por ID
 * GET /grupos/:id
 */
export async function getGrupoById(req, res, next) {
  try {
    const { id } = req.params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_id',
        message: 'ID inválido',
      });
    }

    const group = await prisma.telegramGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'group_not_found',
        message: 'Grupo não encontrado',
      });
    }

    // Construir URL da foto se existir
    let photoUrl = null;
    if (group.photoPath) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      photoUrl = `${baseUrl}/uploads/${group.photoPath}`;
    }

    return res.json({
      success: true,
      data: {
        id: group.id,
        username: group.username,
        title: group.title,
        description: group.description,
        type: group.type,
        photoUrl: photoUrl,
        fetchedAt: group.fetchedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller para listar todos os grupos
 * GET /grupos
 */
export async function listarGrupos(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [groups, total] = await Promise.all([
      prisma.telegramGroup.findMany({
        skip: skip,
        take: limitNum,
        orderBy: { fetchedAt: 'desc' },
      }),
      prisma.telegramGroup.count(),
    ]);

    // Construir URLs das fotos
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const groupsWithPhotos = groups.map(group => ({
      id: group.id,
      username: group.username,
      title: group.title,
      description: group.description,
      type: group.type,
      photoUrl: group.photoPath ? `${baseUrl}/uploads/${group.photoPath}` : null,
      fetchedAt: group.fetchedAt,
    }));

    return res.json({
      success: true,
      data: groupsWithPhotos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}











