import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-brand">Auctioneer</Link>
        <Link to="/create-auction">Create Auction</Link>
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <span style={{ marginRight: '1rem', color: 'var(--color-text-muted)' }}>
              Welcome, {user.username}!
            </span>
            <button onClick={handleLogout} className="btn btn-primary">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
