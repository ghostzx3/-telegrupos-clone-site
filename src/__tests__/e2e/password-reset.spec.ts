/**
 * Testes E2E para o fluxo de recuperação de senha
 * 
 * Estes testes verificam o fluxo completo:
 * 1. Usuário acessa /forgot-password
 * 2. Solicita reset de senha
 * 3. Recebe link (mockado)
 * 4. Acessa /reset-password com token
 * 5. Define nova senha
 * 
 * Para executar:
 * - npm run test:e2e
 * - npm run test:e2e:ui (com interface gráfica)
 */

import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock do Supabase para testes
    await page.route('**/api/auth/forgot-password', async (route) => {
      const request = route.request();
      const postData = await request.postDataJSON();
      
      // Simular resposta de sucesso
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Se o email existir, você receberá um link de recuperação.',
        }),
      });
    });
  });

  test('deve exibir página de forgot-password corretamente', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verificar elementos da página
    await expect(page.locator('h1, h2')).toContainText(/esqueci|senha/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve validar email inválido', async ({ page }) => {
    await page.goto('/forgot-password');

    // Tentar enviar email inválido
    await page.fill('input[type="email"]', 'email-invalido');
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(page.locator('text=/email.*inválido/i')).toBeVisible();
  });

  test('deve enviar solicitação de reset com email válido', async ({ page }) => {
    await page.goto('/forgot-password');

    // Preencher email válido
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Verificar mensagem de sucesso
    await expect(page.locator('text=/email.*enviado|link.*recuperação/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('deve exibir página de reset-password com token inválido', async ({ page }) => {
    // Acessar página com token inválido
    await page.goto('/reset-password?token=invalid-token');

    // Verificar mensagem de erro
    await expect(page.locator('text=/token.*inválido|expirado/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('deve validar requisitos de senha na página de reset', async ({ page }) => {
    // Mock de token válido
    await page.route('**/api/auth/verify-reset-token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true }),
      });
    });

    await page.goto('/reset-password?token=valid-token');

    // Aguardar página carregar
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Tentar enviar senha fraca
    await page.fill('input[type="password"]:first-of-type', '123');
    await page.fill('input[type="password"]:last-of-type', '123');
    await page.click('button:has-text("Alterar")');

    // Verificar mensagem de erro sobre requisitos
    await expect(page.locator('text=/10.*caracteres|requisitos/i')).toBeVisible();
  });

  test('deve validar que senhas devem coincidir', async ({ page }) => {
    // Mock de token válido
    await page.route('**/api/auth/verify-reset-token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true }),
      });
    });

    await page.goto('/reset-password?token=valid-token');

    // Aguardar página carregar
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Preencher senhas diferentes
    await page.fill('input[type="password"]:first-of-type', 'NovaSenha123!@#');
    await page.fill('input[type="password"]:last-of-type', 'SenhaDiferente123!@#');
    await page.click('button:has-text("Alterar")');

    // Verificar mensagem de erro
    await expect(page.locator('text=/senhas.*coincidem|não.*coincidem/i')).toBeVisible();
  });

  test('deve desabilitar botão quando campos estão vazios', async ({ page }) => {
    // Mock de token válido
    await page.route('**/api/auth/verify-reset-token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true }),
      });
    });

    await page.goto('/reset-password?token=valid-token');

    // Aguardar página carregar
    await page.waitForSelector('button:has-text("Alterar")', { timeout: 5000 });

    // Verificar que botão está desabilitado
    const button = page.locator('button:has-text("Alterar")');
    await expect(button).toBeDisabled();
  });

  test('deve exibir loading durante envio de solicitação', async ({ page }) => {
    // Mock com delay para testar loading
    await page.route('**/api/auth/forgot-password', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Email enviado',
        }),
      });
    });

    await page.goto('/forgot-password');

    // Preencher e enviar
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Verificar indicador de loading
    await expect(page.locator('text=/enviando|carregando/i')).toBeVisible();
  });
});

test.describe('Password Reset - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('deve ser responsivo em mobile', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verificar que elementos estão visíveis e acessíveis
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verificar que botões têm tamanho mínimo para toque (44x44px)
    const button = page.locator('button[type="submit"]');
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});













