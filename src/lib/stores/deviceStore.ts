import { create } from 'zustand'
import type { Device } from '@/types'

interface DeviceStore {
  device: Device | null
  studentNames: string[]
  setDevice: (device: Device | null) => void
  setStudentNames: (names: string[]) => void
  addStudentName: (name: string) => void
  removeStudentName: (index: number) => void
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  device: null,
  studentNames: [],
  
  setDevice: (device) => set({ device }),
  
  setStudentNames: (names) => set({ studentNames: names }),
  
  addStudentName: (name) =>
    set((state) => ({
      studentNames: [...state.studentNames, name],
    })),
  
  removeStudentName: (index) =>
    set((state) => ({
      studentNames: state.studentNames.filter((_, i) => i !== index),
    })),
}))

