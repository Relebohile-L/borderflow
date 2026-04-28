// src/components/Unauthorized.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };
  
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        
        {user && (
          <div className="user-info">
            <p><strong>Logged in as:</strong> {user.name}</p>
            <p><strong>Role:</strong> {user.roleName}</p>
            <p><strong>Country:</strong> {user.countryName}</p>
          </div>
        )}
        
        <div className="action-buttons">
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;