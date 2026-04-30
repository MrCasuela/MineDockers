import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Backups from './pages/Backups'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import { useStore } from './store/store'

function App() {
  const { initializeStore, error } = useStore()

  useEffect(() => {
    initializeStore()
  }, [])

  return (
    <Router>
      <Layout>
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/backups" element={<Backups />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
