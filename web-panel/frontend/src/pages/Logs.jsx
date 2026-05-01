import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { Button, LoadingSpinner, EmptyState } from '../components/Common'
import { FileText, Download } from 'lucide-react'

export default function Logs() {
  const { logs, loading, fetchLogs, downloadLogs } = useStore()
  const [logType, setLogType] = useState(null)
  const [limit, setLimit] = useState(100)
  const refreshMs = 3000 // Cada 3 segundos se actualizan los logs

  useEffect(() => {
    fetchLogs(limit, logType)
    const interval = setInterval(() => fetchLogs(limit, logType), refreshMs)
    return () => clearInterval(interval)
  }, [limit, logType, fetchLogs])

  if (loading) return <LoadingSpinner />

  const isEmpty = logs.length === 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logs del Servidor</h1>
        <div className="flex gap-2">
          <Button onClick={downloadLogs} className="flex items-center gap-2" variant="secondary">
            <Download size={16} />
            Descargar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Tipo</label>
          <select
            value={logType || ''}
            onChange={(e) => setLogType(e.target.value || null)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="">Todos</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Límite</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>

      {/* Logs Viewer */}
      <div className="card">
        <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
          {isEmpty ? (
            <EmptyState message="No hay logs disponibles" icon={FileText} />
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`py-1 ${log.level === 'ERROR' ? 'text-red-400' :
                    log.level === 'WARN' ? 'text-yellow-400' :
                      'text-slate-300'
                  }`}
              >
                <span className="text-slate-500">[{log.timestamp}]</span>
                {' '}
                <span className="text-slate-400">[{log.level}]</span>
                {' '}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
