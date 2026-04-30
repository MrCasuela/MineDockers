import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// Server endpoints
export const getServerInfo = () => api.get('/server/info').then(r => r.data)
export const getServerStatus = () => api.get('/server/status').then(r => r.data)
export const getServerStats = () => api.get('/server/stats').then(r => r.data)
export const getServerMemory = () => api.get('/server/memory').then(r => r.data)

export const startServer = () => api.post('/server/start').then(r => r.data)
export const stopServer = (force = false) => api.post('/server/stop', { force }).then(r => r.data)
export const restartServer = (delay = 10) => api.post('/server/restart', { delay }).then(r => r.data)
export const executeCommand = (command) => api.post('/server/command', { command }).then(r => r.data)

// Players endpoints
export const getPlayers = () => api.get('/players').then(r => r.data)
export const getPlayer = (uuid) => api.get(`/players/${uuid}`).then(r => r.data)
export const kickPlayer = (uuid, reason = 'Kicked by admin') => 
  api.post(`/players/${uuid}/kick`, { reason }).then(r => r.data)
export const banPlayer = (uuid, reason = 'Banned by admin') => 
  api.post(`/players/${uuid}/ban`, { reason }).then(r => r.data)
export const unbanPlayer = (uuid) => 
  api.post(`/players/${uuid}/unban`).then(r => r.data)

// Logs endpoints
export const getLogs = (limit = 100, type = null) => 
  api.get('/logs', { params: { limit, type } }).then(r => r.data)
export const downloadLogs = () => 
  api.get('/logs/download', { responseType: 'blob' })
    .then(r => {
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'server-logs.txt')
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    })

// Backups endpoints
export const getBackups = () => api.get('/backups').then(r => r.data)
export const createBackup = (name = null) =>
  api.post('/backups/create', { name }, { timeout: 300000 }).then(r => r.data)
export const restoreBackup = (backupId, force = false) =>
  api.post(`/backups/${backupId}/restore`, { force }, { timeout: 300000 }).then(r => r.data)
export const deleteBackup = (backupId) => api.delete(`/backups/${backupId}/delete`).then(r => r.data)

// Bans endpoints
export const getBans = () => api.get('/bans').then(r => r.data)

export default api
