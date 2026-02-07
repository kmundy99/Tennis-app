import { useState, useEffect } from 'react';
import { getPlayerMatches, sendCustomEmail } from '../services/api';

export default function EmailModal({ selectedPlayers, currentPlayer, onClose, onSent }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState(new Set());
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sending | sent | error
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    getPlayerMatches(currentPlayer.id)
      .then(res => {
        setMatches(res.data.matches);
        setStatus('idle');
      })
      .catch(() => {
        setMatches([]);
        setStatus('idle');
      });
  }, [currentPlayer.id]);

  function toggleMatch(id) {
    setSelectedMatches(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await sendCustomEmail({
        player_ids: selectedPlayers.map(p => p.id),
        match_ids: Array.from(selectedMatches),
        message: message.trim(),
        sender_id: currentPlayer.id,
      });
      setStatus('sent');
      setTimeout(onSent, 1500);
    } catch (err) {
      console.error('Send email error:', err);
      setError('Failed to send email. Please try again.');
      setStatus('idle');
    }
  }

  function formatMatchDateTime(m) {
    const d = new Date(m.start_time);
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal email-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Send Email</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {status === 'sent' ? (
          <div className="email-success">
            <p>Email sent successfully!</p>
          </div>
        ) : (
          <>
            <div className="email-section">
              <label className="email-label">To:</label>
              <div className="email-chips">
                {selectedPlayers.map(p => (
                  <span key={p.id} className="email-chip">{p.name}</span>
                ))}
              </div>
            </div>

            {status === 'loading' ? (
              <p className="email-loading">Loading your matches...</p>
            ) : matches.length > 0 ? (
              <div className="email-section">
                <label className="email-label">Include match details (optional):</label>
                <div className="email-match-list">
                  {matches.map(m => (
                    <label key={m.id} className="email-match-item">
                      <input
                        type="checkbox"
                        checked={selectedMatches.has(m.id)}
                        onChange={() => toggleMatch(m.id)}
                      />
                      <span>{formatMatchDateTime(m)} &mdash; {m.court_address}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="email-section">
              <label className="email-label">Message:</label>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
