export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          wallet_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          level: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          level?: number
          created_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: "active" | "completed" | "cancelled"
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status: "active" | "completed" | "cancelled"
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: "active" | "completed" | "cancelled"
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: "deposit" | "withdrawal" | "yield" | "commission"
          amount: number
          status: "pending" | "completed" | "failed"
          description: string | null
          investment_id: string | null
          referral_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "deposit" | "withdrawal" | "yield" | "commission"
          amount: number
          status: "pending" | "completed" | "failed"
          description?: string | null
          investment_id?: string | null
          referral_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "deposit" | "withdrawal" | "yield" | "commission"
          amount?: number
          status?: "pending" | "completed" | "failed"
          description?: string | null
          investment_id?: string | null
          referral_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trading_operations: {
        Row: {
          id: string
          user_id: string
          investment_id: string
          symbol: string
          type: "buy" | "sell"
          amount: number
          price: number
          profit_loss: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          investment_id: string
          symbol: string
          type: "buy" | "sell"
          amount: number
          price: number
          profit_loss?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          investment_id?: string
          symbol?: string
          type?: "buy" | "sell"
          amount?: number
          price?: number
          profit_loss?: number | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          email_notifications: boolean
          theme: string
          language: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          theme?: string
          language?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          theme?: string
          language?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
