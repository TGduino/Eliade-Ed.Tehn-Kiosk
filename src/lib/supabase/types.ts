export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string
          device_name: string
          device_fingerprint: string
          last_seen: string
          is_active: boolean
          battery_level: number | null
          battery_charging: boolean | null
          uptime_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device_name?: string
          device_fingerprint: string
          last_seen?: string
          is_active?: boolean
          battery_level?: number | null
          battery_charging?: boolean | null
          uptime_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_name?: string
          device_fingerprint?: string
          last_seen?: string
          is_active?: boolean
          battery_level?: number | null
          battery_charging?: boolean | null
          uptime_seconds?: number
          created_at?: string
          updated_at?: string
        }
      }
      device_students: {
        Row: {
          id: string
          device_id: string
          session_id: string | null
          student_names: string[]
          joined_at: string
        }
        Insert: {
          id?: string
          device_id: string
          session_id?: string | null
          student_names: string[]
          joined_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          session_id?: string | null
          student_names?: string[]
          joined_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          name: string
          session_type_id: string
          status: 'pending' | 'active' | 'paused' | 'completed'
          created_by: string
          started_at: string | null
          ended_at: string | null
          settings: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          session_type_id: string
          status?: 'pending' | 'active' | 'paused' | 'completed'
          created_by: string
          started_at?: string | null
          ended_at?: string | null
          settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          session_type_id?: string
          status?: 'pending' | 'active' | 'paused' | 'completed'
          created_by?: string
          started_at?: string | null
          ended_at?: string | null
          settings?: Json | null
          created_at?: string
        }
      }
      session_types: {
        Row: {
          id: string
          name: string
          url_template: string
          icon_url: string | null
          allow_url_preview: boolean
          iframe_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url_template: string
          icon_url?: string | null
          allow_url_preview?: boolean
          iframe_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          url_template?: string
          icon_url?: string | null
          allow_url_preview?: boolean
          iframe_enabled?: boolean
          created_at?: string
        }
      }
      device_activity: {
        Row: {
          id: string
          device_id: string
          session_id: string | null
          screenshot_url: string | null
          student_work_url: string | null
          mouse_activity_count: number
          keyboard_activity_count: number
          recorded_at: string
        }
        Insert: {
          id?: string
          device_id: string
          session_id?: string | null
          screenshot_url?: string | null
          student_work_url?: string | null
          mouse_activity_count?: number
          keyboard_activity_count?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          session_id?: string | null
          screenshot_url?: string | null
          student_work_url?: string | null
          mouse_activity_count?: number
          keyboard_activity_count?: number
          recorded_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
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

