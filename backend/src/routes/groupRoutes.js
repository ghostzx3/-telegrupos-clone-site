import express from 'express';
import {
  buscarGrupo,
  getGrupoById,
  listarGrupos,
} from '../controllers/groupController.js';

const router = express.Router();

/**
 * POST /buscar-grupo
 * Busca informações de um grupo do Telegram e salva no banco
 */
router.post('/buscar-grupo', buscarGrupo);

/**
 * GET /grupos/:id
 * Retorna um grupo específico por ID
 */
router.get('/grupos/:id', getGrupoById);

/**
 * GET /grupos
 * Lista todos os grupos salvos
 */
router.get('/grupos', listarGrupos);

export default router;











