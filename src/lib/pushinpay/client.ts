/**
 * Cliente PushInPay - Integração completa com API de pagamentos PIX
 * 
 * Documentação: https://docs.pushinpay.com.br
 * Base URL: https://app.pushinpay.com.br/app
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface PushInPayConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface CreatePixPaymentRequest {
  amount: number; // Valor em reais (ex: 19.99)
  description: string;
  externalReference?: string;
  payer: {
    email: string;
    name: string;
    document?: string; // CPF/CNPJ
    phone?: string;
  };
  expiresIn?: number; // Tempo de expiração em segundos (padrão: 3600 = 1 hora)
  callbackUrl?: string; // URL do webhook
}

export interface PushInPayPixResponse {
  id: string; // ID da transação
  transactionId?: string;
  pixCode: string; // Código PIX copia e cola
  pix_copia_e_cola?: string; // Alternativo
  qrCode?: string; // QR Code em base64
  qrCodeImage?: string; // URL ou base64 da imagem
  qrCodeBase64?: string; // Base64 do QR Code
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: string; // ISO 8601
  createdAt: string;
  paidAt?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  amount: number;
  paidAt?: string;
  expiresAt: string;
}

export class PushInPayClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: PushInPayConfig) {
    // Validar API Key
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('API Key da PushInPay não fornecida');
    }

    // Log parcial da API Key para debug (primeiros e últimos caracteres)
    const apiKeyPreview = config.apiKey.length > 8 
      ? `${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`
      : '***';
    console.log('[PushInPay] Inicializando cliente com API Key:', apiKeyPreview);

    this.apiKey = config.apiKey;
    
    // URLs possíveis da PushInPay (em ordem de prioridade)
    const possibleUrls = [
      config.baseUrl,
      process.env.NEXT_PUBLIC_PUSHINPAY_API_URL,
      'https://app.pushinpay.com.br/app',
      'https://app.pushinpay.com.br',
      'https://api.pushinpay.com.br',
      'https://pushinpay.com.br/api',
    ].filter(Boolean) as string[];

    const baseURL = possibleUrls[0] || 'https://app.pushinpay.com.br/app';
    
    // Validar e normalizar URL
    const normalizedURL = baseURL.replace(/\/$/, ''); // Remove barra final
    console.log('[PushInPay] Base URL configurada:', normalizedURL);
    console.log('[PushInPay] URLs possíveis testadas:', possibleUrls);
    
    if (!normalizedURL.startsWith('http://') && !normalizedURL.startsWith('https://')) {
      throw new Error(`URL inválida da PushInPay: ${normalizedURL}. Deve começar com http:// ou https://`);
    }
    
    this.client = axios.create({
      baseURL: normalizedURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 30000, // 30 segundos
    });

    // Interceptor para logging de requisições
    this.client.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[PushInPay] ${config.method?.toUpperCase()} ${fullUrl}`);
        console.log(`[PushInPay] Headers:`, {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': config.headers['Authorization'] ? 'Bearer ***' : 'Não configurado'
        });
        return config;
      },
      (error) => {
        console.error('[PushInPay] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de respostas
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[PushInPay] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('[PushInPay] Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Cria uma cobrança PIX
   * 
   * @param paymentData Dados do pagamento
   * @returns Dados do pagamento criado incluindo código PIX e QR Code
   */
  async createPixPayment(paymentData: CreatePixPaymentRequest): Promise<PushInPayPixResponse> {
    try {
      // Validar dados
      this.validatePaymentData(paymentData);

      // Preparar body da requisição
      const body = {
        amount: paymentData.amount,
        description: paymentData.description,
        externalReference: paymentData.externalReference || `payment-${Date.now()}`,
        payer: {
          email: paymentData.payer.email,
          name: paymentData.payer.name,
          ...(paymentData.payer.document && { document: paymentData.payer.document }),
          ...(paymentData.payer.phone && { phone: paymentData.payer.phone }),
        },
        expiresIn: paymentData.expiresIn || 3600, // 1 hora padrão
        ...(paymentData.callbackUrl && { callbackUrl: paymentData.callbackUrl }),
      };

      // Tentar diferentes endpoints possíveis
      // Baseado na documentação: https://doc.pushinpay.com.br
      // Removidos endpoints /qrcode que não existem na API
      const endpoints = [
        '/v1/pix/create',
        '/api/v1/pix/create',
        '/pix/create',
        '/api/pix/create',
      ];

      let lastError: AxiosError | null = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`[PushInPay] Tentando endpoint: ${endpoint}`);
          
          const response = await this.client.post(endpoint, body);

          // Verificar se a resposta tem os dados esperados
          if (!response.data) {
            throw new Error('Resposta vazia da API PushInPay');
          }

          // Normalizar resposta (diferentes formatos possíveis)
          const normalizedResponse = this.normalizeResponse(response.data);

          console.log(`[PushInPay] Pagamento criado com sucesso via ${endpoint}`);
          return normalizedResponse;

        } catch (error: any) {
          lastError = error;
          const status = error.response?.status;

          // Se for 404 ou 405, tentar próximo endpoint
          if (status === 404 || status === 405) {
            console.log(`[PushInPay] Endpoint ${endpoint} retornou ${status}, tentando próximo...`);
            continue;
          }

          // Se for erro de autenticação, não tentar outros endpoints
          if (status === 401 || status === 403) {
            const errorDetails = error.response?.data || {};
            console.error('[PushInPay] Erro de autenticação:', {
              status,
              endpoint,
              message: errorDetails.message || errorDetails.error || 'Erro de autenticação'
            });
            throw this.handleError(error, 'Erro de autenticação. Verifique sua API Key.');
          }

          // Se for erro 400 (Bad Request), pode ser problema no body, não tentar outros
          if (status === 400) {
            const errorDetails = error.response?.data || {};
            console.error('[PushInPay] Erro 400 - Bad Request:', {
              endpoint,
              message: errorDetails.message || errorDetails.error || 'Requisição inválida',
              body: errorDetails
            });
            throw this.handleError(error, `Erro na requisição: ${errorDetails.message || errorDetails.error || 'Dados inválidos'}`);
          }

          // Outros erros 4xx, tentar próximo endpoint
          if (status && status >= 400 && status < 500) {
            console.log(`[PushInPay] Endpoint ${endpoint} retornou ${status}, tentando próximo...`);
            continue;
          }

          // Erros de servidor ou rede, tentar próximo
          continue;
        }
      }

      // Se nenhum endpoint funcionou
      if (lastError) {
        throw this.handleError(lastError, 'Nenhum endpoint da API PushInPay funcionou. Verifique a documentação.');
      }

      throw new Error('Erro desconhecido ao criar pagamento PIX');

    } catch (error: any) {
      console.error('[PushInPay] Erro ao criar pagamento:', error);
      throw this.handleError(error, 'Erro ao criar pagamento PIX');
    }
  }

  /**
   * Consulta o status de um pagamento
   * 
   * @param transactionId ID da transação
   * @returns Status do pagamento
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const endpoints = [
        `/v1/pix/${transactionId}`,
        `/api/v1/pix/${transactionId}`,
        `/pix/${transactionId}`,
        `/api/pix/${transactionId}`,
        `/transactions/${transactionId}`,
        `/api/transactions/${transactionId}`,
      ];

      let lastError: AxiosError | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await this.client.get(endpoint);
          
          if (!response.data) {
            throw new Error('Resposta vazia da API PushInPay');
          }

          return this.normalizeStatusResponse(response.data);

        } catch (error: any) {
          lastError = error;
          const status = error.response?.status;

          if (status === 404 || status === 405) {
            continue;
          }

          if (status === 401 || status === 403) {
            throw this.handleError(error, 'Erro de autenticação ao consultar pagamento.');
          }

          continue;
        }
      }

      if (lastError) {
        throw this.handleError(lastError, 'Não foi possível consultar o status do pagamento.');
      }

      throw new Error('Erro desconhecido ao consultar pagamento');

    } catch (error: any) {
      console.error('[PushInPay] Erro ao consultar pagamento:', error);
      throw this.handleError(error, 'Erro ao consultar status do pagamento');
    }
  }

  /**
   * Normaliza a resposta da API (diferentes formatos possíveis)
   */
  private normalizeResponse(data: any): PushInPayPixResponse {
    return {
      id: data.id || data.transactionId || data.transaction_id || data.paymentId || '',
      transactionId: data.transactionId || data.id || data.transaction_id,
      pixCode: data.pixCode || 
               data.pix_code || 
               data.pix_copia_e_cola || 
               data.code || 
               data.qr_code || 
               data.pix || 
               '',
      pix_copia_e_cola: data.pix_copia_e_cola || 
                        data.pixCode || 
                        data.pix_code || 
                        data.code,
      qrCode: data.qrCode || data.qr_code || data.qrCodeBase64 || data.qr_code_base64,
      qrCodeImage: data.qrCodeImage || data.qr_code_image || data.qrCode || data.qr_code,
      qrCodeBase64: data.qrCodeBase64 || data.qr_code_base64 || data.qrCode || data.qr_code,
      amount: data.amount || 0,
      status: data.status || 'pending',
      expiresAt: data.expiresAt || data.expires_at || data.expirationDate || new Date(Date.now() + 3600000).toISOString(),
      createdAt: data.createdAt || data.created_at || data.createdDate || new Date().toISOString(),
      paidAt: data.paidAt || data.paid_at || data.paidDate,
    };
  }

  /**
   * Normaliza resposta de status
   */
  private normalizeStatusResponse(data: any): PaymentStatusResponse {
    return {
      id: data.id || data.transactionId || data.transaction_id || '',
      status: data.status || 'pending',
      amount: data.amount || 0,
      paidAt: data.paidAt || data.paid_at || data.paidDate,
      expiresAt: data.expiresAt || data.expires_at || data.expirationDate || '',
    };
  }

  /**
   * Valida dados do pagamento
   */
  private validatePaymentData(data: CreatePixPaymentRequest): void {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero');
    }

    if (!data.description || data.description.trim() === '') {
      throw new Error('Descrição do pagamento é obrigatória');
    }

    if (!data.payer?.email || !data.payer?.name) {
      throw new Error('Email e nome do pagador são obrigatórios');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.payer.email)) {
      throw new Error('Email inválido');
    }
  }

  /**
   * Trata erros da API
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      // Erro da API
      const status = error.response.status;
      const data = error.response.data;

      const message = data?.message || 
                     data?.error || 
                     data?.details || 
                     `Erro HTTP ${status}: ${error.response.statusText}`;

      const enhancedError = new Error(message);
      (enhancedError as any).status = status;
      (enhancedError as any).data = data;
      return enhancedError;
    }

    if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão com a API PushInPay. Verifique sua internet.');
    }

    // Outro erro
    return new Error(error.message || defaultMessage);
  }
}

/**
 * Instância singleton do cliente PushInPay
 */
let pushInPayClient: PushInPayClient | null = null;

export function getPushInPayClient(): PushInPayClient {
  if (!pushInPayClient) {
    const apiKey = process.env.PUSHINPAY_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_PUSHINPAY_API_URL;
    
    // Validação detalhada
    if (!apiKey) {
      console.error('[PushInPay] ERRO: PUSHINPAY_API_KEY não encontrada nas variáveis de ambiente');
      console.error('[PushInPay] Verifique se a variável está definida no arquivo .env.local');
      throw new Error('PUSHINPAY_API_KEY não configurada nas variáveis de ambiente');
    }

    if (!baseUrl) {
      console.warn('[PushInPay] AVISO: NEXT_PUBLIC_PUSHINPAY_API_URL não configurada, usando URL padrão');
    }

    console.log('[PushInPay] Configuração:', {
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey.length,
      baseUrl: baseUrl || 'https://app.pushinpay.com.br/app (padrão)',
    });

    pushInPayClient = new PushInPayClient({
      apiKey,
      baseUrl,
    });
  }

  return pushInPayClient;
}

