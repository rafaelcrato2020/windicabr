/**
 * Gera um código de referência aleatório
 * @returns string - Código de referência de 8 caracteres
 */
export function generateReferralCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  const charactersLength = characters.length

  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * Gera um link de referência com o código do usuário
 * @param referralCode - Código de referência do usuário
 * @returns string - URL completa com o código de referência
 */
export function generateReferralLink(referralCode: string): string {
  // Usar NEXT_PUBLIC_APP_URL se disponível, caso contrário usar window.location.origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")

  return `${baseUrl}?ref=${referralCode}`
}
