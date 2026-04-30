import { useState, useEffect } from 'react'
import { useStore } from '../store/store'
import { Button } from '../components/Common'
import { Settings as SettingsIcon, Command } from 'lucide-react'
import Modal from '../components/Modal'
import { getServerInfo } from '../services/api'

export default function Settings() {
  const { executeCommand } = useStore()
  const [command, setCommand] = useState('')
  const [commandOutput, setCommandOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [serverInfo, setServerInfo] = useState(null)

  useEffect(() => {
    getServerInfo()
      .then(setServerInfo)
      .catch(() => setServerInfo(null))
  }, [])

  const handleExecuteCommand = async () => {
    if (!command.trim()) return

    try {
      const result = await executeCommand(command)
      const output = result?.result ?? result
      setCommandOutput(
        typeof output === 'string' && output.trim()
          ? output
          : 'Comando ejecutado'
      )
      setShowOutput(true)
    } catch (error) {
      setCommandOutput(`Error: ${error.message}`)
      setShowOutput(true)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <SettingsIcon size={32} />
        Configuración
      </h1>

      {/* Server Configuration */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Información del Servidor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Version</p>
            <p className="text-lg font-semibold">
              {serverInfo
                ? `Minecraft ${serverInfo.mc_version} • Forge ${serverInfo.forge_version}`
                : 'Cargando...'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Puertos</p>
            <p className="text-lg font-semibold">
              {serverInfo
                ? `${serverInfo.server_port} (Juego) • ${serverInfo.rcon_port} (RCON)`
                : '25565 (Juego) • 25575 (RCON)'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Panel API</p>
            <p className="text-lg font-semibold">v2.1.0</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Base de Datos</p>
            <p className="text-lg font-semibold">MySQL 8.0</p>
          </div>
        </div>
      </div>

      {/* Command Executor */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Command size={20} />
          Ejecutor de Comandos RCON
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Ejecuta comandos directamente en el servidor. Usa con cuidado.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Comando</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                placeholder="Ej: say Hola Mundo"
              />
              <Button onClick={handleExecuteCommand}>Ejecutar</Button>
            </div>
          </div>

          {showOutput && (
            <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 max-h-40 overflow-y-auto">
              {commandOutput}
            </div>
          )}
        </div>
      </div>

      {/* Common Commands */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Comandos Comunes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Anuncio', cmd: 'say [ANUNCIO]' },
            { label: 'Resetear Clima', cmd: 'weather clear' },
            { label: 'Día Permanente', cmd: 'gamerule doDaylightCycle false' },
            { label: 'Hora Día', cmd: 'time set day' },
            { label: 'Guardar Todo', cmd: 'save-all' },
            { label: 'Listar Jugadores', cmd: 'list' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCommand(item.cmd)
                setShowOutput(false)
              }}
              className="text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <p className="font-medium text-blue-400">{item.label}</p>
              <p className="text-sm text-slate-400 font-mono">{item.cmd}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Info */}
      <div className="card border border-yellow-600/30 bg-yellow-600/5">
        <p className="text-yellow-400 text-sm">
          ⚠️ El acceso al ejecutor de comandos es poderoso y peligroso. Úsalo solo si sabes lo que haces.
          Los comandos incorridos pueden dañar el servidor.
        </p>
      </div>
    </div>
  )
}
