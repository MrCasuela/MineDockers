import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { Button, LoadingSpinner, EmptyState, TimeAgo } from '../components/Common'
import Modal from '../components/Modal'
import { Database, Trash2, Upload, Plus } from 'lucide-react'

export default function Backups() {
  const { backups, loading, fetchBackups, createBackup, restoreBackup, deleteBackup } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)
  const [action, setAction] = useState(null)
  const [backupName, setBackupName] = useState('')

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

  const handleRestore = async () => {
    if (selectedBackup) {
      if (window.confirm('¿Restaurar este backup? Los datos actuales serán reemplazados.')) {
        await restoreBackup(selectedBackup.id)
        setModalOpen(false)
      }
    }
  }

  const handleDelete = async (backup) => {
    if (window.confirm('¿Eliminar este backup? Esta acción no se puede deshacer.')) {
      await deleteBackup(backup.id)
    }
  }

  if (loading) return <LoadingSpinner />

  if (backups.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Backups</h1>
          <Button
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
        <EmptyState message="No hay backups disponibles" icon={Database} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Backups</h1>
        <Button
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

      {/* Backups List */}
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
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedBackup(backup)
                  setAction('restore')
                  setModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Restaurar
              </Button>
              <Button
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

      {/* Modals */}
      <Modal
        isOpen={modalOpen && action === 'create'}
        title="Crear Nuevo Backup"
        onClose={() => setModalOpen(false)}
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
        onClose={() => setModalOpen(false)}
        onConfirm={handleRestore}
        confirmText="Restaurar"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Esta acción reemplazará los datos actuales del servidor con este backup.
          </p>
          <p className="text-sm text-orange-400">
            Los datos actuales serán guardados como respaldo de seguridad.
          </p>
        </div>
      </Modal>
    </div>
  )
}
