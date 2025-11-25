/**
 * Validação robusta de senha
 * 
 * Requisitos:
 * - Mínimo de 10 caracteres
 * - Máximo de 128 caracteres
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 10) {
    errors.push('A senha deve ter pelo menos 10 caracteres')
  }

  if (password.length > 128) {
    errors.push('A senha não pode ter mais de 128 caracteres')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

