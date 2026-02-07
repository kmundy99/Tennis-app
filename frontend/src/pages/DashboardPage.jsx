import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../services/AuthContext';
import { getMatches, getPlayerMatches } from '../services/api';
import MatchCard from '../components/MatchCard';
import CreateMatchModal from '../components/CreateMatchModal';

export default function DashboardPage() {
  const { player } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (filter === 'mine') {
        res = await getPlayerMatches(player.id);
      } else {
        res = await getMatches();
      }
      setMatches(res.data.matches);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, player.id]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Group matches by date
  const grouped = {};
  matches.forEach((m) => {
    const dateKey = new Date(m.start_time).toLocaleDateString([], {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Upcoming Matches</h2>
        <div className="dashboard-actions">
          <div className="filter-group">
            <button
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All Matches
            </button>
            <button
              className={`btn btn-sm ${filter === 'mine' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('mine')}
            >
              My Matches
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Match
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <p>No matches found.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Create the first match!
          </button>
        </div>
      ) : (
        <div className="match-list">
          {Object.entries(grouped).map(([date, dateMatches]) => (
            <div key={date} className="match-day">
              <h3 className="match-day-title">{date}</h3>
              <div className="match-day-cards">
                {dateMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateMatchModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadMatches();
          }}
        />
      )}
    </div>
  );
}
