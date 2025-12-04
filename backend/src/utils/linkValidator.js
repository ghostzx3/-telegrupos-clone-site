/**
 * Utilitários para validar e extrair informações de links do Telegram
 */

/**
 * Extrai o username de um link do Telegram
 * @param {string} link - Link do Telegram (ex: https://t.me/username ou t.me/username)
 * @returns {string|null} - Username extraído ou null se inválido
 */
export function extractUsername(link) {
  if (!link || typeof link !== 'string') {
    return null;
  }

  // Remove espaços e converte para minúsculas
  const cleanLink = link.trim().toLowerCase();

  // Padrões aceitos:
  // - https://t.me/username
  // - http://t.me/username
  // - t.me/username
  // - @username
  const patterns = [
    /(?:https?:\/\/)?(?:t\.me\/|@)([a-zA-Z0-9_]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanLink.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Valida se o link é um link de convite (joinchat)
 * @param {string} link - Link do Telegram
 * @returns {boolean} - true se for link de convite
 */
export function isInviteLink(link) {
  if (!link || typeof link !== 'string') {
    return false;
  }

  const cleanLink = link.trim().toLowerCase();
  return cleanLink.includes('t.me/joinchat/') || 
         cleanLink.includes('t.me/+') ||
         cleanLink.includes('t.me/join/');
}

/**
 * Valida se o link do Telegram é válido
 * @param {string} link - Link do Telegram
 * @returns {object} - { valid: boolean, error?: string }
 */
export function validateLink(link) {
  if (!link || typeof link !== 'string' || link.trim().length === 0) {
    return { valid: false, error: 'invalid_link_format' };
  }

  // Rejeitar links de convite
  if (isInviteLink(link)) {
    return { valid: false, error: 'invalid_link_format' };
  }

  // Tentar extrair username
  const username = extractUsername(link);
  if (!username) {
    return { valid: false, error: 'invalid_link_format' };
  }

  return { valid: true, username };
}










