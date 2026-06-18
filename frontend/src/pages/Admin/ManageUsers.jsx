import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Trash2, ShieldAlert } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user profiles database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Failed to delete user.');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge bg-danger">ADMIN</span>;
      case 'doctor': return <span className="badge bg-primary">DOCTOR</span>;
      case 'patient': return <span className="badge bg-success">PATIENT</span>;
      default: return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">User Management</h2>
          <p className="text-muted mb-0">View all registered accounts and perform administrative actions.</p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading users database...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Profile Name</th>
                  <th>Email Address</th>
                  <th>Contact phone</th>
                  <th>Role</th>
                  <th>Gender</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={`http://localhost:5000${u.avatar}`}
                            alt={u.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                        ) : (
                          <div className="bg-light text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{u.gender || 'N/A'}</td>
                    <td className="text-end">
                      {u.role !== 'admin' ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                          onClick={() => handleDelete(u._id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      ) : (
                        <span className="text-muted small">Access Blocked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
