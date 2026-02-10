import { create } from 'zustand'
import type { Session, SessionType } from '@/types'

interface SessionStore {
  activeSession: Session | null
  sessionType: SessionType | null
  setActiveSession: (session: Session | null) => void
  setSessionType: (type: SessionType | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSession: null,
  sessionType: null,
  
  setActiveSession: (session) => set({ activeSession: session }),
  
  setSessionType: (type) => set({ sessionType: type }),
}))

