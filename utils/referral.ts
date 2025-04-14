import { createHash } from "crypto"

/**
 * Generates a unique referral code based on user ID and timestamp
 */
export function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString()
  const hash = createHash("md5").update(`${userId}-${timestamp}`).digest("hex").substring(0, 8)

  return hash.toUpperCase()
}

/**
 * Generates a full referral link for sharing
 */
export function generateReferralLink(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://windicabr.com"
  return `${baseUrl}?ref=${referralCode}`
}
