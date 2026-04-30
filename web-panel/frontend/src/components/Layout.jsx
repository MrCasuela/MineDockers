import { useLocation, Link } from 'react-router-dom'
import { Menu, X, Server, Users, Database, FileText, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Server },
    { href: '/players', label: 'Jugadores', icon: Users },
    { href: '/backups', label: 'Backups', icon: Database },
    { href: '/logs', label: 'Logs', icon: FileText },
    { href: '/settings', label: 'Configuración', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-green-400">MC Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          {sidebarOpen && (
            <div className="text-xs text-slate-400 text-center">
              <p>v2.1.0</p>
              <p>Minecraft Panel</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
