import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { Button, LoadingSpinner, EmptyState, TimeAgo } from '../components/Common'
import Modal from '../components/Modal'
import { Database, Trash2, Upload, Plus, AlertTriangle } from 'lucide-react'

export default function Backups() {
  const { backups, server, loading, fetchBackups, createBackup, restoreBackup, deleteBackup } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [action, setAction] = useState(null)
  const [backupName, setBackupName] = useState('')
  const [restoreError, setRestoreError] = useState(null)

  const serverOnline = server?.status === 'online'

  useEffect(() => {
    fetchBackups()
    const interval = setInterval(fetchBackups, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    await createBackup(backupName || null)
    setModalOpen(false)
    setBackupName('')
  }

  const handleRestoreConfirm = async () => {
    if (!selectedBackup) return
    setRestoreError(null)
    try {
      await restoreBackup(selectedBackup.id)
      setModalOpen(false)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al restaurar el backup'
      setRestoreError(msg)
    }
  }

  const handleOpenRestore = (backup) => {
    setSelectedBackup(backup)
    setRestoreError(null)
    setAction('restore')
    setModalOpen(true)
  }

  const handleDelete = async (backup) => {
    if (window.confirm('¿Eliminar este backup? Esta acción no se puede deshacer.')) {
      await deleteBackup(backup.id)
    }
  }

  // Modales — siempre montados, independiente del estado de backups
  const modals = (
    <>
      <Modal
        isOpen={modalOpen && action === 'create'}
        title="Crear Nuevo Backup"
        onClose={() => { setModalOpen(false); setBackupName('') }}
        onConfirm={handleCreate}
        confirmText="Crear"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre (opcional)</label>
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              placeholder="Ej: backup-importante"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalOpen && action === 'restore'}
        title={`Restaurar ${selectedBackup?.name}`}
        onClose={() => { setModalOpen(false); setRestoreError(null) }}
        onConfirm={handleRestoreConfirm}
        confirmText="Restaurar"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Esta acción reemplazará los datos actuales del servidor con este backup.
          </p>
          <p className="text-sm text-orange-400">
            Los datos actuales serán guardados como respaldo de seguridad.
          </p>
          {restoreError && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/40 rounded-lg p-3">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{restoreError}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )

  if (loading) return <LoadingSpinner />

  const header = (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Backups</h1>
        {serverOnline && (
          <p className="text-sm text-amber-400 flex items-center gap-1 mt-1">
            <AlertTriangle size={14} />
            Servidor online — restaurar deshabilitado hasta apagar el servidor
          </p>
        )}
      </div>
      <Button
        id="btn-create-backup"
        onClick={() => {
          setAction('create')
          setModalOpen(true)
        }}
        className="flex items-center gap-2"
      >
        <Plus size={16} />
        Crear Backup
      </Button>
    </div>
  )

  if (backups.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState message="No hay backups disponibles" icon={Database} />
        {modals}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="space-y-3">
        {backups.map(backup => (
          <div key={backup.id} className="card flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{backup.name}</h3>
              <p className="text-sm text-slate-400">
                <TimeAgo date={backup.created_at} /> • {backup.size_mb}MB
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative group">
                <Button
                  id={`btn-restore-${backup.id}`}
                  variant="secondary"
                  disabled={serverOnline}
                  onClick={() => handleOpenRestore(backup)}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Restaurar
                </Button>
                {serverOnline && (
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                    bg-slate-900 text-amber-400 text-xs rounded px-2 py-1 pointer-events-none
                    opacity-0 group-hover:opacity-100 transition-opacity border border-amber-500/30">
                    Apaga el servidor primero
                  </span>
                )}
              </div>
              <Button
                id={`btn-delete-${backup.id}`}
                variant="danger"
                onClick={() => handleDelete(backup)}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {modals}
    </div>
  )
}
