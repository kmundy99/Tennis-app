import { useNavigate } from 'react-router-dom';

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const start = new Date(match.start_time);
  const end = new Date(match.end_time);

  const timeStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    + ' - ' + end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const dateStr = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const spots = match.max_players - parseInt(match.registered_count || 0, 10);
  const isFull = spots <= 0;

  return (
    <div
      className={`match-card ${isFull ? 'match-full' : ''}`}
      onClick={() => navigate(`/matches/${match.id}`)}
    >
      <div className="match-card-date">{dateStr}</div>
      <div className="match-card-time">{timeStr}</div>
      <div className="match-card-location">{match.court_address}</div>
      <div className="match-card-meta">
        <span className="match-card-organizer">By {match.organizer_name}</span>
        {match.min_ntrp_level && (
          <span className="match-card-ntrp">NTRP {match.min_ntrp_level}+</span>
        )}
      </div>
      <div className="match-card-spots">
        {isFull ? (
          <span className="badge badge-full">Full</span>
        ) : (
          <span className="badge badge-open">{spots} spot{spots !== 1 ? 's' : ''} left</span>
        )}
        <span className="match-card-count">
          {match.registered_count}/{match.max_players} players
        </span>
      </div>
      {match.registration_type && (
        <div className="match-card-status">
          {match.registration_type === 'registered' ? 'Joined' :
            `Waitlist #${match.position_on_waitlist}`}
        </div>
      )}
    </div>
  );
}
