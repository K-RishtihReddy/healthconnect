import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Users, ShieldAlert, Calendar, Grid, Activity, Award, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const { metrics, appointmentsByStatus, specializationBreakdown, recentUsers } = analytics;

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">System Analytics</h2>
          <p className="text-muted mb-0">Platform overview, registrations log, and activity counters.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchAnalytics}>Refresh Stats</button>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-primary-light text-primary p-3 rounded-circle" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
              <Users size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{metrics.totalPatients}</h4>
              <span className="text-muted small">Total Patients</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-success-light text-success p-3 rounded-circle" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{metrics.verifiedDoctors}</h4>
              <span className="text-muted small">Verified Doctors</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-warning-light text-warning p-3 rounded-circle" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{metrics.pendingDoctors}</h4>
              <span className="text-muted small">Pending Doctors</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-info-light text-info p-3 rounded-circle" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{metrics.totalAppointments}</h4>
              <span className="text-muted small">Total Bookings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Status distribution & Specialities */}
        <div className="col-lg-6">
          <div className="card border p-4 shadow-sm h-100 bg-white" style={{ borderRadius: '20px' }}>
            <h5 className="fw-bold mb-4">Bookings Status distribution</h5>
            
            <div className="d-flex flex-column gap-3">
              {Object.keys(appointmentsByStatus).map((status) => {
                const count = appointmentsByStatus[status];
                const percentage = metrics.totalAppointments > 0 
                  ? ((count / metrics.totalAppointments) * 100).toFixed(0) 
                  : 0;

                let progressClass = 'bg-primary';
                if (status === 'Confirmed') progressClass = 'bg-success';
                if (status === 'Pending') progressClass = 'bg-warning';
                if (status === 'Cancelled') progressClass = 'bg-danger';

                return (
                  <div key={status}>
                    <div className="d-flex justify-content-between mb-1 small">
                      <span className="fw-semibold">{status}</span>
                      <span className="text-muted">{count} appointments ({percentage}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${progressClass}`}
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Registrations log */}
        <div className="col-lg-6">
          <div className="card border p-4 shadow-sm h-100 bg-white" style={{ borderRadius: '20px' }}>
            <h5 className="fw-bold mb-4">Recent User Sign Ups</h5>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="small">
                        <span className="fw-bold text-dark d-block">{u.name}</span>
                        <span className="text-muted d-block">{u.email}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'doctor' ? 'bg-primary' : 'bg-success'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="small text-muted">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Specialities breakdown */}
        <div className="col-12 mt-4">
          <div className="card border p-4 shadow-sm bg-white" style={{ borderRadius: '20px' }}>
            <h5 className="fw-bold mb-4">Doctors Speciality Breakdown</h5>
            
            <div className="row g-3">
              {specializationBreakdown.map((spec) => (
                <div key={spec._id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark">{spec._id}</span>
                    <span className="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                      {spec.count}
                    </span>
                  </div>
                </div>
              ))}
              {specializationBreakdown.length === 0 && (
                <div className="col-12 text-center text-muted small py-3">No verified doctors registered.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
