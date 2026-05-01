import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { StatCard, LoadingSpinner, Button } from '../components/Common'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Power, RotateCw, Activity, Users, Database, Clock, Play } from 'lucide-react'

export default function Dashboard() {
  const { server, players, backups, loading, fetchServerStatus, restartServer, stopServer, startServer } = useStore()
  const [refreshInterval, setRefreshInterval] = useState(null)
  const [actionState, setActionState] = useState('idle')

  useEffect(() => {
    fetchServerStatus()
    const interval = setInterval(fetchServerStatus, 3000) // Cada 3 segundos se actualiza el estado del servidor
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (actionState === 'starting' && server.status === 'online') {
      setActionState('idle')
    }
    if (actionState === 'stopping' && server.status !== 'online') {
      setActionState('idle')
    }
  }, [actionState, server.status])

  const handleRestart = async () => {
    if (window.confirm('¿Reiniciar servidor? Los jugadores serán desconectados.')) {
      await restartServer()
    }
  }

  const handleStart = async () => {
    setActionState('starting')
    try {
      await startServer()
    } catch (error) {
      setActionState('idle')
    }
  }

  const handleStop = async () => {
    if (window.confirm('¿Detener servidor?')) {
      setActionState('stopping')
      try {
        await stopServer()
      } catch (error) {
        setActionState('idle')
      }
    }
  }

  const isOnline = server.status === 'online'
  const isStarting = actionState === 'starting'

  if (loading) return <LoadingSpinner />

  const chartData = [
    { name: 'Jugadores', value: players.length || 0 },
    { name: 'Max', value: server.maxPlayers || 20 },
  ]

  const hasMemory = Number.isFinite(server.memory)
    && Number.isFinite(server.maxMemory)
    && server.maxMemory > 0

  const memoryPercent = server.maxMemory
    ? Math.min(100, (server.memory / server.maxMemory) * 100)
    : 0

  const memoryLabel = hasMemory
    ? `${server.memory}MB / ${server.maxMemory}MB`
    : 'N/A'

  const tpsLabel = isOnline && Number.isFinite(server.tps)
    ? server.tps
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleRestart} className="flex items-center gap-2">
            <RotateCw size={16} />
            Reiniciar
          </Button>
          {isOnline ? (
            <Button variant="danger" onClick={handleStop} className="flex items-center gap-2">
              <Power size={16} />
              Detener
            </Button>
          ) : (
            <Button
              variant={isStarting ? 'secondary' : 'success'}
              onClick={handleStart}
              className="flex items-center gap-2"
              disabled={isStarting}
            >
              <Play size={16} />
              {isStarting ? 'Iniciando' : 'Encender'}
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={`card border-2 ${server.status === 'online' ? 'border-green-600' : 'border-red-600'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <div>
            <p className="text-slate-400">Estado del Servidor</p>
            <p className="text-2xl font-bold uppercase">
              {server.status === 'online' ? 'En Línea' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jugadores Conectados"
          value={players.filter(p => p.status === 'online').length}
          subtitle={`de ${server.maxPlayers}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Jugadores Totales"
          value={players.length}
          subtitle="registrados"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Backups"
          value={backups.length}
          subtitle="disponibles"
          icon={Database}
          color="purple"
        />
        <StatCard
          title="TPS"
          value={tpsLabel}
          subtitle="ticks per second"
          icon={Activity}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Players Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Jugadores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Players */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Jugadores Recientes</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {players.slice(0, 10).map(player => (
              <div key={player.uuid} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-slate-400">
                    Último acceso: {new Date(player.last_join).toLocaleDateString()}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${player.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Uso de Memoria
        </h2>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="mb-2 flex justify-between">
            <span>RAM</span>
            <span className="font-mono">{memoryLabel}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
              style={{ width: `${memoryPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
