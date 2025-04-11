import crypto from "crypto"
import axios from "axios"

interface CoinPaymentsConfig {
  apiKey: string
  apiSecret: string
  merchantId: string
  ipnSecret: string
}

interface CreateTransactionOptions {
  amount: number
  currencyFrom: string // Moeda que o cliente está pagando (ex: BRL)
  currencyTo: string // Moeda que você quer receber (ex: USDT)
  buyerEmail: string
  depositId: string // ID do depósito no seu sistema
  userId: string // ID do usuário no seu sistema
}

interface TransactionResponse {
  txnId: string
  statusUrl: string
  qrCodeUrl: string
  address: string
  amountToPay: number
  confirms_needed: number
  timeout: number
  expiresAt: Date
}

export class CoinPaymentsClient {
  private config: CoinPaymentsConfig
  private baseUrl = "https://www.coinpayments.net/api/v1/"

  constructor(config: CoinPaymentsConfig) {
    this.config = config
  }

  /**
   * Cria uma requisição HMAC assinada para a API da CoinPayments
   */
  private async makeRequest(command: string, params: Record<string, any> = {}): Promise<any> {
    const request = {
      cmd: command,
      key: this.config.apiKey,
      version: "1",
      format: "json",
      ...params,
    }

    const formData = new URLSearchParams()
    Object.entries(request).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    const formDataString = formData.toString()
    const hmac = crypto.createHmac("sha512", this.config.apiSecret)
    const signature = hmac.update(formDataString).digest("hex")

    try {
      const response = await axios.post(this.baseUrl, formDataString, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          HMAC: signature,
        },
      })

      if (response.data.error !== "ok") {
        throw new Error(`CoinPayments API Error: ${response.data.error}`)
      }

      return response.data.result
    } catch (error: any) {
      console.error("CoinPayments API Error:", error.message)
      throw error
    }
  }

  /**
   * Cria uma nova transação de pagamento
   */
  async createTransaction(options: CreateTransactionOptions): Promise<TransactionResponse> {
    const result = await this.makeRequest("create_transaction", {
      amount: options.amount,
      currency1: options.currencyFrom,
      currency2: options.currencyTo,
      buyer_email: options.buyerEmail,
      custom: JSON.stringify({
        depositId: options.depositId,
        userId: options.userId,
      }),
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/coinpayments-webhook`,
    })

    return {
      txnId: result.txn_id,
      statusUrl: result.status_url,
      qrCodeUrl: result.qrcode_url,
      address: result.address,
      amountToPay: Number.parseFloat(result.amount),
      confirms_needed: result.confirms_needed,
      timeout: result.timeout,
      expiresAt: new Date(Date.now() + result.timeout * 1000),
    }
  }

  /**
   * Obtém informações sobre uma transação
   */
  async getTransactionInfo(txnId: string): Promise<any> {
    return this.makeRequest("get_tx_info", {
      txid: txnId,
    })
  }

  /**
   * Obtém as taxas de câmbio atuais
   */
  async getRates(): Promise<any> {
    return this.makeRequest("rates")
  }

  /**
   * Verifica a assinatura de um webhook IPN
   */
  verifyIpnSignature(payload: any, hmacSignature: string): boolean {
    const hmac = crypto.createHmac("sha512", this.config.ipnSecret)
    const calculatedSignature = hmac.update(JSON.stringify(payload)).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature, "hex"), Buffer.from(hmacSignature, "hex"))
  }
}

// Função para inicializar o cliente CoinPayments
export const initCoinPayments = (): CoinPaymentsClient => {
  return new CoinPaymentsClient({
    apiKey: process.env.COINPAYMENTS_API_KEY || "",
    apiSecret: process.env.COINPAYMENTS_API_SECRET || "",
    merchantId: process.env.COINPAYMENTS_MERCHANT_ID || "",
    ipnSecret: process.env.COINPAYMENTS_IPN_SECRET || "",
  })
}
