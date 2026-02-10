import { Database } from '@/lib/supabase/types'

export type Device = Database['public']['Tables']['devices']['Row']
export type DeviceInsert = Database['public']['Tables']['devices']['Insert']
export type DeviceUpdate = Database['public']['Tables']['devices']['Update']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']
export type SessionStatus = 'pending' | 'active' | 'paused' | 'completed'

export type SessionType = Database['public']['Tables']['session_types']['Row']
export type SessionTypeInsert = Database['public']['Tables']['session_types']['Insert']
export type SessionTypeUpdate = Database['public']['Tables']['session_types']['Update']

export type DeviceStudent = Database['public']['Tables']['device_students']['Row']
export type DeviceStudentInsert = Database['public']['Tables']['device_students']['Insert']
export type DeviceStudentUpdate = Database['public']['Tables']['device_students']['Update']

export type DeviceActivity = Database['public']['Tables']['device_activity']['Row']
export type DeviceActivityInsert = Database['public']['Tables']['device_activity']['Insert']
export type DeviceActivityUpdate = Database['public']['Tables']['device_activity']['Update']

export type Settings = Database['public']['Tables']['settings']['Row']

export interface DeviceWithStudents extends Device {
  current_students?: DeviceStudent
  latest_activity?: DeviceActivity
}

export interface SessionWithType extends Session {
  session_type?: SessionType
  device_count?: number
}

