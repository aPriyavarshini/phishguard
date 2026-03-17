import { Outlet, useNavigate } from 'react-router-dom'

import ChatbotWidget from './ChatbotWidget'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-grid">
      <Sidebar />
      <main className="flex-1 p-4">
        <Topbar onQuickScan={(url) => navigate(`/app/scanner?url=${encodeURIComponent(url)}`)} />
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  )
}
