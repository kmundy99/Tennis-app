import { useAuth } from '../services/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { player, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMatchesActive = location.pathname === '/' || location.pathname.startsWith('/matches');
  const isPlayersActive = location.pathname === '/players';

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        Tennis Scheduler
      </div>
      <div className="nav-tabs">
        <button
          className={`nav-tab${isMatchesActive ? ' active' : ''}`}
          onClick={() => navigate('/')}
        >
          Matches
        </button>
        <button
          className={`nav-tab${isPlayersActive ? ' active' : ''}`}
          onClick={() => navigate('/players')}
        >
          Players
        </button>
      </div>
      <div className="navbar-info">
        <span className="navbar-player">
          {player.name} (NTRP {player.ntrp_level})
        </span>
        <button className="btn btn-sm btn-outline" onClick={logout}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
