import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './services/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MatchDetailsPage from './pages/MatchDetailsPage'
import PlayersPage from './pages/PlayersPage'
import './App.css'

function App() {
  const { player } = useAuth();

  if (!player) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/matches/:id" element={<MatchDetailsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App
