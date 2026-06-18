import React, { useContext } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" to="/">
          <Activity size={28} className="text-primary animate-pulse" />
          <span>HealthConnect</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-span"></span>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/doctors">Find Doctors</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/about">About Us</NavLink>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 border dropdown-toggle bg-light py-2 px-3"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ borderRadius: '30px' }}
                >
                  {user.avatar ? (
                    <img
                      src={`http://localhost:5000${user.avatar}`}
                      alt={user.name}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  ) : (
                    <div className="bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="fw-medium text-dark d-none d-sm-inline">{user.name.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end border shadow-sm p-2 mt-2" aria-labelledby="profileDropdown" style={{ borderRadius: '12px', minWidth: '200px' }}>
                  <li>
                    <div className="px-3 py-2 border-bottom">
                      <p className="mb-0 fw-semibold text-truncate">{user.name}</p>
                      <p className="mb-0 small text-muted text-truncate">{user.email}</p>
                      <span className="badge bg-secondary-custom text-white small mt-1" style={{ fontSize: '10px' }}>{user.role.toUpperCase()}</span>
                    </div>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2 mt-1" to={getDashboardLink()} style={{ borderRadius: '8px' }}>
                      <Activity size={16} />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                      onClick={handleLogout}
                      style={{ borderRadius: '8px' }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-primary px-4" to="/login" style={{ borderRadius: '8px' }}>Login</Link>
                <Link className="btn btn-primary px-4 text-white" to="/register" style={{ borderRadius: '8px' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
