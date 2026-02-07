import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('player');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (player) {
      localStorage.setItem('player', JSON.stringify(player));
    } else {
      localStorage.removeItem('player');
    }
  }, [player]);

  const logout = () => setPlayer(null);

  return (
    <AuthContext.Provider value={{ player, setPlayer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
