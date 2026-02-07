import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { createMatch } from '../services/api';

export default function CreateMatchModal({ onClose, onCreated }) {
  const { player } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to tomorrow at 10am, 2hr duration
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultStart = tomorrow.toISOString().slice(0, 16);
  tomorrow.setHours(12);
  const defaultEnd = tomorrow.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    court_address: '',
    start_time: defaultStart,
    end_time: defaultEnd,
    min_ntrp_level: '',
    max_players: 4,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createMatch({
        organizer_id: player.id,
        court_address: form.court_address,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        min_ntrp_level: form.min_ntrp_level ? parseFloat(form.min_ntrp_level) : null,
        max_players: parseInt(form.max_players, 10),
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Match</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Court Address *</label>
            <input
              type="text"
              value={form.court_address}
              onChange={(e) => setForm({ ...form, court_address: e.target.value })}
              placeholder="e.g. Central Park Tennis Courts"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min NTRP Level</label>
              <select
                value={form.min_ntrp_level}
                onChange={(e) => setForm({ ...form, min_ntrp_level: e.target.value })}
              >
                <option value="">Any level</option>
                {[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((v) => (
                  <option key={v} value={v}>{v}+</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Max Players</label>
              <select
                value={form.max_players}
                onChange={(e) => setForm({ ...form, max_players: e.target.value })}
              >
                <option value="2">2 (Singles)</option>
                <option value="4">4 (Doubles)</option>
                <option value="6">6</option>
                <option value="8">8</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
