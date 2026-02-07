import { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { getAllPlayers, updatePlayer, deleteAccount } from '../services/api';
import EmailModal from '../components/EmailModal';

export default function PlayersPage() {
  const { player, setPlayer, logout } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getAllPlayers()
      .then(res => setPlayers(res.data.players))
      .catch(err => console.error('Failed to load players:', err))
      .finally(() => setLoading(false));
  }, []);

  // Checkbox handlers
  function toggleAll() {
    if (selected.size === players.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(players.map(p => p.id)));
    }
  }

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Inline edit handlers
  function startEdit(p) {
    setEditingId(p.id);
    setEditFields({
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      ntrp_level: p.ntrp_level || '',
      gender: p.gender || '',
      address: p.address || '',
      notification_preference: p.notification_preference || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFields({});
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await updatePlayer(editingId, editFields);
      const updated = res.data.player;
      setPlayers(prev => prev.map(p => (p.id === editingId ? updated : p)));
      if (editingId === player.id) {
        setPlayer(updated);
      }
      setEditingId(null);
      setEditFields({});
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSelf() {
    try {
      await deleteAccount(player.id);
      logout();
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account. Please try again.');
    }
  }

  const selectedPlayers = players.filter(p => selected.has(p.id));

  if (loading) return <div className="loading">Loading players...</div>;

  return (
    <div className="players-page">
      <div className="dashboard-header">
        <h2>Registered Players ({players.length})</h2>
        <button
          className="btn btn-primary btn-sm"
          disabled={selected.size === 0}
          onClick={() => setShowEmailModal(true)}
        >
          Email Selected ({selected.size})
        </button>
      </div>

      <div className="players-table-wrapper">
        <table className="players-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={players.length > 0 && selected.size === players.length}
                  onChange={toggleAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>NTRP</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Notif. Pref</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => {
              const isEditing = editingId === p.id;
              const isMe = p.id === player.id;
              return (
                <tr key={p.id} className={isEditing ? 'editing-row' : ''}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                    />
                  </td>
                  {isEditing ? (
                    <>
                      <td>
                        <input
                          value={editFields.name}
                          onChange={e => setEditFields({ ...editFields, name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          value={editFields.email}
                          onChange={e => setEditFields({ ...editFields, email: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          value={editFields.phone}
                          onChange={e => setEditFields({ ...editFields, phone: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="7"
                          value={editFields.ntrp_level}
                          onChange={e => setEditFields({ ...editFields, ntrp_level: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          value={editFields.gender}
                          onChange={e => setEditFields({ ...editFields, gender: e.target.value })}
                        >
                          <option value="">--</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={editFields.address}
                          onChange={e => setEditFields({ ...editFields, address: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          value={editFields.notification_preference}
                          onChange={e => setEditFields({ ...editFields, notification_preference: e.target.value })}
                        >
                          <option value="">--</option>
                          <option value="EmailMe">EmailMe</option>
                          <option value="DontNotifyMe">DontNotifyMe</option>
                        </select>
                      </td>
                      <td className="col-actions">
                        <button className="btn btn-sm btn-primary" onClick={saveEdit} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={cancelEdit} disabled={saving}>
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {p.name}
                        {isMe && <span className="badge badge-you">You</span>}
                      </td>
                      <td>{p.email || '—'}</td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.ntrp_level || '—'}</td>
                      <td>{p.gender || '—'}</td>
                      <td>{p.address || '—'}</td>
                      <td>{p.notification_preference || '—'}</td>
                      <td className="col-actions">
                        {isMe && (
                          <button className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>
                            Edit
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="delete-account-section">
        {!confirmDelete ? (
          <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
            Delete My Account
          </button>
        ) : (
          <div className="delete-confirm">
            <p>Are you sure? This will remove you from all matches and log you out.</p>
            <div className="delete-confirm-actions">
              <button className="btn btn-danger btn-sm" onClick={handleDeleteSelf}>
                Yes, Delete My Account
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {showEmailModal && (
        <EmailModal
          selectedPlayers={selectedPlayers}
          currentPlayer={player}
          onClose={() => setShowEmailModal(false)}
          onSent={() => {
            setShowEmailModal(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}
