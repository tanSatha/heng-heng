export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number
          created_at: string
          name: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
