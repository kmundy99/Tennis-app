import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getMatch, joinMatch, leaveMatch, cancelMatch } from '../services/api';

export default function MatchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { player } = useAuth();
  const [match, setMatch] = useState(null);
  const [registered, setRegistered] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMatch = useCallback(async () => {
    try {
      const res = await getMatch(id);
      setMatch(res.data.match);
      setRegistered(res.data.registered);
      setWaitlist(res.data.waitlist);
    } catch (err) {
      setError('Match not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  if (loading) return <div className="loading">Loading match...</div>;
  if (error) return <div className="error-page"><p>{error}</p><button className="btn btn-outline" onClick={() => navigate('/')}>Back</button></div>;

  const isOrganizer = match.organizer_id === player.id;
  const myRegistration = registered.find((r) => r.player_id === player.id);
  const myWaitlist = waitlist.find((r) => r.player_id === player.id);
  const isJoined = !!myRegistration || !!myWaitlist;
  const isFull = registered.length >= match.max_players;
  const isCancelled = match.status === 'cancelled';

  const start = new Date(match.start_time);
  const end = new Date(match.end_time);

  const handleJoin = async () => {
    setActionLoading(true);
    setError('');
    try {
      await joinMatch(id, player.id);
      await loadMatch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this match?')) return;
    setActionLoading(true);
    setError('');
    try {
      await leaveMatch(id, player.id);
      await loadMatch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this match? All players will be notified.')) return;
    setActionLoading(true);
    try {
      await cancelMatch(id, player.id);
      await loadMatch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="match-details">
      <button className="btn btn-link back-link" onClick={() => navigate('/')}>
        &larr; Back to Dashboard
      </button>

      <div className="match-details-header">
        <h2>{match.court_address}</h2>
        {isCancelled && <span className="badge badge-cancelled">Cancelled</span>}
      </div>

      <div className="match-info-grid">
        <div className="match-info-item">
          <span className="label">Date</span>
          <span className="value">
            {start.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="match-info-item">
          <span className="label">Time</span>
          <span className="value">
            {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {' - '}
            {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div className="match-info-item">
          <span className="label">Organizer</span>
          <span className="value">{match.organizer_name}</span>
        </div>
        <div className="match-info-item">
          <span className="label">Min NTRP</span>
          <span className="value">{match.min_ntrp_level || 'Any'}</span>
        </div>
        <div className="match-info-item">
          <span className="label">Players</span>
          <span className="value">{registered.length} / {match.max_players}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!isCancelled && (
        <div className="match-actions">
          {!isJoined && !isFull && (
            <button className="btn btn-primary" onClick={handleJoin} disabled={actionLoading}>
              Join Match
            </button>
          )}
          {!isJoined && isFull && (
            <button className="btn btn-secondary" onClick={handleJoin} disabled={actionLoading}>
              Join Waitlist
            </button>
          )}
          {isJoined && (
            <button className="btn btn-danger" onClick={handleLeave} disabled={actionLoading}>
              {myWaitlist ? 'Leave Waitlist' : 'Leave Match'}
            </button>
          )}
          {isOrganizer && (
            <button className="btn btn-danger-outline" onClick={handleCancel} disabled={actionLoading}>
              Cancel Match
            </button>
          )}
        </div>
      )}

      <div className="players-section">
        <h3>Registered Players ({registered.length}/{match.max_players})</h3>
        {registered.length === 0 ? (
          <p className="empty-text">No players registered yet.</p>
        ) : (
          <div className="player-list">
            {registered.map((r) => (
              <div key={r.id} className="player-row">
                <div className="player-name">
                  {r.name}
                  {r.player_id === match.organizer_id && <span className="badge badge-organizer">Organizer</span>}
                  {r.player_id === player.id && <span className="badge badge-you">You</span>}
                </div>
                <div className="player-info">
                  <span>NTRP {r.ntrp_level}</span>
                  <span>{r.gender}</span>
                  {r.email && <span>{r.email}</span>}
                  {r.phone && <span>{r.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {waitlist.length > 0 && (
        <div className="players-section">
          <h3>Waitlist ({waitlist.length})</h3>
          <div className="player-list">
            {waitlist.map((w) => (
              <div key={w.id} className="player-row waitlist-row">
                <div className="player-name">
                  #{w.position_on_waitlist} {w.name}
                  {w.player_id === player.id && <span className="badge badge-you">You</span>}
                </div>
                <div className="player-info">
                  <span>NTRP {w.ntrp_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
