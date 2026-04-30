import { create } from 'zustand'
import * as api from '../services/api'

export const useStore = create((set, get) => ({
  // Estado
  server: {
    status: 'offline',
    players: 0,
    maxPlayers: 20,
    memory: null,
    maxMemory: null,
    tps: null,
  },
  players: [],
  backups: [],
  logs: [],
  bans: [],
  loading: false,
  error: null,

  // Acciones
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  // Inicialización
  initializeStore: async () => {
    set({ loading: true })
    try {
      await get().fetchServerStatus()
      await get().fetchPlayers()
      await get().fetchBackups()
      await get().fetchBans()
    } catch (error) {
      set({ error: 'Error inicializando panel' })
    } finally {
      set({ loading: false })
    }
  },

  // Server
  fetchServerStatus: async () => {
    try {
      const [statusResult, memoryResult] = await Promise.allSettled([
        api.getServerStatus(),
        api.getServerMemory(),
      ])

      const nextServer = { ...get().server }
      let errorMessage = null

      if (statusResult.status === 'fulfilled') {
        Object.assign(nextServer, statusResult.value)
      } else {
        errorMessage = 'Error obteniendo estado del servidor'
      }

      if (memoryResult.status === 'fulfilled') {
        Object.assign(nextServer, memoryResult.value)
      } else if (!errorMessage) {
        errorMessage = 'Error obteniendo uso de memoria'
      }

      set({ server: nextServer, error: errorMessage })
    } catch (error) {
      console.error('Error fetching server status:', error)
      set({ error: 'Error obteniendo estado del servidor' })
    }
  },

  startServer: async () => {
    try {
      await api.startServer()
      await get().fetchServerStatus()
    } catch (error) {
      set({ error: 'Error iniciando servidor' })
    }
  },

  stopServer: async (force = false) => {
    try {
      await api.stopServer(force)
      await get().fetchServerStatus()
    } catch (error) {
      set({ error: 'Error deteniendo servidor' })
    }
  },

  restartServer: async (delay = 10) => {
    try {
      await api.restartServer(delay)
      await get().fetchServerStatus()
    } catch (error) {
      set({ error: 'Error reiniciando servidor' })
    }
  },

  executeCommand: async (command) => {
    try {
      const result = await api.executeCommand(command)
      return result
    } catch (error) {
      set({ error: 'Error ejecutando comando' })
      throw error
    }
  },

  // Players
  fetchPlayers: async () => {
    try {
      const data = await api.getPlayers()
      set({ players: data })
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  },

  kickPlayer: async (uuid, reason) => {
    try {
      await api.kickPlayer(uuid, reason)
      await get().fetchPlayers()
    } catch (error) {
      set({ error: 'Error expulsando jugador' })
    }
  },

  banPlayer: async (uuid, reason) => {
    try {
      await api.banPlayer(uuid, reason)
      await get().fetchPlayers()
      await get().fetchBans()
    } catch (error) {
      set({ error: 'Error baneando jugador' })
    }
  },

  // Backups
  fetchBackups: async () => {
    try {
      const data = await api.getBackups()
      set({ backups: data })
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  },

  createBackup: async (name) => {
    try {
      await api.createBackup(name)
      await get().fetchBackups()
    } catch (error) {
      set({ error: 'Error creando backup' })
    }
  },

  restoreBackup: async (backupId) => {
    try {
      await api.restoreBackup(backupId)
      await get().fetchBackups()
    } catch (error) {
      set({ error: 'Error restaurando backup' })
    }
  },

  deleteBackup: async (backupId) => {
    try {
      await api.deleteBackup(backupId)
      await get().fetchBackups()
    } catch (error) {
      set({ error: 'Error eliminando backup' })
    }
  },

  // Logs
  fetchLogs: async (limit = 100, type = null) => {
    try {
      const data = await api.getLogs(limit, type)
      set({ logs: data, error: null })
    } catch (error) {
      console.error('Error fetching logs:', error)
      set({ error: 'Error obteniendo logs' })
    }
  },

  downloadLogs: async () => {
    try {
      await api.downloadLogs()
    } catch (error) {
      set({ error: 'Error descargando logs' })
    }
  },

  // Bans
  fetchBans: async () => {
    try {
      const data = await api.getBans()
      set({ bans: data })
    } catch (error) {
      console.error('Error fetching bans:', error)
    }
  },

  unbanPlayer: async (uuid) => {
    try {
      await api.unbanPlayer(uuid)
      await get().fetchBans()
    } catch (error) {
      set({ error: 'Error desban eando jugador' })
    }
  },
}))
