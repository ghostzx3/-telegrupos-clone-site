import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * 
 * Para executar os testes:
 * - npm run test:e2e (executa todos os testes)
 * - npm run test:e2e:ui (executa com interface gráfica)
 * - npm run test:e2e:debug (executa em modo debug)
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  
  /* Executar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar o build no CI se você deixar test.only no código */
  forbidOnly: !!process.env.CI,
  
  /* Retry no CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Timeout para workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Configuração de reporter */
  reporter: process.env.CI ? 'html' : 'list',
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegação */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    /* Coletar trace quando retentar o teste falhado */
    trace: 'on-first-retry',
    
    /* Screenshot apenas quando falhar */
    screenshot: 'only-on-failure',
    
    /* Video apenas quando retentar */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes em dispositivos móveis */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Servidor de desenvolvimento local */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});













