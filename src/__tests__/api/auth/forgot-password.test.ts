/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/forgot-password/route'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Mock Supabase
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

describe('/api/auth/forgot-password', () => {
  let mockAdmin: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock para rate limit check (retorna count)
    const createSelectMock = (count: number = 0) => ({
      eq: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          count,
          data: [],
        }),
      }),
    })

    // Mock Supabase admin client
    mockAdmin = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn((columns?: string, options?: any) => {
        // Se for rate limit check (com count: 'exact')
        if (options?.count === 'exact') {
          return createSelectMock(0)
        }
        // Para recordAttempt (select normal)
        return {
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
          }),
        }
      }),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockReturnThis(),
      auth: {
        admin: {
          resetPasswordForEmail: jest.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        },
      },
    }

    ;(createAdminClient as jest.Mock).mockReturnValue(mockAdmin)
  })

  describe('POST', () => {
    it('deve retornar 200 e ok: true quando email é válido', async () => {
      // Mock já configurado no beforeEach (count: 0)

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
      expect(data.message).toBeDefined()
    })

    it('deve retornar 400 quando email é inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'invalid-email' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('deve retornar 429 quando rate limit é excedido por IP', async () => {
      // Mock rate limit excedido (5 tentativas por IP)
      let callCount = 0
      mockAdmin.select.mockImplementation((columns?: string, options?: any) => {
        if (options?.count === 'exact') {
          callCount++
          // Primeira chamada é para IP (count >= 5), segunda para email (count < 3)
          return {
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                count: callCount === 1 ? 5 : 0,
                data: [],
              }),
            }),
          }
        }
        // Para recordAttempt
        return {
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              }),
            }),
          }),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBeDefined()
    })

    it('deve chamar resetPasswordForEmail do Supabase com redirectTo correto', async () => {
      mockAdmin.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      await POST(request)

      expect(mockAdmin.auth.admin.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/reset-password'),
        }
      )
    })

    it('deve sempre retornar sucesso mesmo se Supabase retornar erro (security best practice)', async () => {
      mockAdmin.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockAdmin.auth.admin.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      // Deve retornar sucesso mesmo se email não existir (security best practice)
      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
    })
  })
})

