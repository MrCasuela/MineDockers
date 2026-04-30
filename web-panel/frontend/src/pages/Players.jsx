import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { Button, LoadingSpinner, EmptyState, TimeAgo } from '../components/Common'
import Modal from '../components/Modal'
import { Users, Trash2, Ban, LogOut } from 'lucide-react'

export default function Players() {
  const { players, loading, fetchPlayers, kickPlayer, banPlayer } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleKick = async () => {
    if (selectedPlayer) {
      await kickPlayer(selectedPlayer.uuid, reason || 'Kicked by admin')
      setModalOpen(false)
      setReason('')
    }
  }

  const handleBan = async () => {
    if (selectedPlayer) {
      await banPlayer(selectedPlayer.uuid, reason || 'Banned by admin')
      setModalOpen(false)
      setReason('')
    }
  }

  if (loading) return <LoadingSpinner />

  if (players.length === 0) {
    return <EmptyState message="Sin jugadores registrados" icon={Users} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        <Button onClick={fetchPlayers}>Actualizar</Button>
      </div>

      {/* Players Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">UUID</th>
              <th className="text-left py-3 px-4">Estado</th>
              <th className="text-left py-3 px-4">Playtime</th>
              <th className="text-left py-3 px-4">Último Acceso</th>
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.uuid} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 font-medium">{player.name}</td>
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                  {player.uuid.substring(0, 8)}...
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    player.status === 'online'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {player.status === 'online' ? 'En Línea' : 'Offline'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {player.playtime ? `${Math.floor(player.playtime / 60)}h` : '-'}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <TimeAgo date={player.last_join} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlayer(player)
                        setAction('kick')
                        setModalOpen(true)
                      }}
                      className="p-2 hover:bg-orange-600/20 text-orange-400 rounded transition-colors"
                      title="Expulsar"
                    >
                      <LogOut size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlayer(player)
                        setAction('ban')
                        setModalOpen(true)
                      }}
                      className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                      title="Banear"
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={modalOpen}
        title={action === 'kick' ? `Expulsar a ${selectedPlayer?.name}` : `Banear a ${selectedPlayer?.name}`}
        onClose={() => setModalOpen(false)}
        onConfirm={action === 'kick' ? handleKick : handleBan}
        confirmText={action === 'kick' ? 'Expulsar' : 'Banear'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Razón</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              placeholder="Ingresa una razón (opcional)"
              rows="3"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
