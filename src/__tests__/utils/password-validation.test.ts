import { validatePassword } from '@/lib/utils/password-validation'

describe('validatePassword', () => {
  it('deve aceitar senha válida com 10+ caracteres, maiúscula, minúscula, número e símbolo', () => {
    const result = validatePassword('MinhaSenha123!')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('deve rejeitar senha com menos de 10 caracteres', () => {
    const result = validatePassword('Senha123!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha deve ter pelo menos 10 caracteres')
  })

  it('deve rejeitar senha sem letra minúscula', () => {
    const result = validatePassword('MINHASENHA123!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha deve conter pelo menos uma letra minúscula')
  })

  it('deve rejeitar senha sem letra maiúscula', () => {
    const result = validatePassword('minhasenha123!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha deve conter pelo menos uma letra maiúscula')
  })

  it('deve rejeitar senha sem número', () => {
    const result = validatePassword('MinhaSenha!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha deve conter pelo menos um número')
  })

  it('deve rejeitar senha sem caractere especial', () => {
    const result = validatePassword('MinhaSenha123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha deve conter pelo menos um caractere especial')
  })

  it('deve rejeitar senha com mais de 128 caracteres', () => {
    const longPassword = 'A'.repeat(129) + '1!'
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A senha não pode ter mais de 128 caracteres')
  })

  it('deve retornar múltiplos erros quando senha falha em vários critérios', () => {
    const result = validatePassword('short')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

