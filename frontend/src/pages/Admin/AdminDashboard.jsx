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
            <h5 className="fw-bold mb-3">Bookings Status distribution</h5>
            
            <div className="row align-items-center">
              <div className="col-sm-6 text-center">
                {(() => {
                  let accumulatedPercent = 0;
                  const statusColors = {
                    Pending: '#f59e0b', // Warning Amber
                    Confirmed: '#10b981', // Success Emerald
                    Completed: '#3b82f6', // Primary Blue
                    Cancelled: '#ef4444' // Danger Red
                  };
                  const segments = Object.keys(appointmentsByStatus).map((status) => {
                    const count = appointmentsByStatus[status];
                    const percentage = metrics.totalAppointments > 0 ? (count / metrics.totalAppointments) * 100 : 0;
                    const strokeLength = (percentage / 100) * 314.16;
                    const strokeOffset = 314.16 - ((accumulatedPercent / 100) * 314.16);
                    accumulatedPercent += percentage;
                    return {
                      status,
                      count,
                      percentage: percentage.toFixed(0),
                      strokeLength,
                      strokeOffset,
                      color: statusColors[status] || '#cbd5e1'
                    };
                  });

                  return (
                    <svg width="180" height="180" viewBox="0 0 200 200" className="mx-auto">
                      {segments.map((seg, idx) => (
                        seg.strokeLength > 0 && (
                          <circle
                            key={idx}
                            cx="100"
                            cy="100"
                            r="50"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="20"
                            strokeDasharray={`${seg.strokeLength} 314.16`}
                            strokeDashoffset={seg.strokeOffset}
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.target.setAttribute('stroke-width', '24')}
                            onMouseLeave={(e) => e.target.setAttribute('stroke-width', '20')}
                          />
                        )
                      ))}
                      <circle cx="100" cy="100" r="40" fill="#ffffff" />
                      <text x="100" y="95" textAnchor="middle" dominantBaseline="middle" className="fw-bold" style={{ fontSize: '18px', fill: '#1e293b' }}>
                        {metrics.totalAppointments}
                      </text>
                      <text x="100" y="115" textAnchor="middle" dominantBaseline="middle" className="text-muted font-medium" style={{ fontSize: '9px', fill: '#64748b' }}>
                        TOTAL VISITS
                      </text>
                    </svg>
                  );
                })()}
              </div>

              <div className="col-sm-6">
                <div className="d-flex flex-column gap-2 mt-3 mt-sm-0">
                  {Object.keys(appointmentsByStatus).map((status) => {
                    const count = appointmentsByStatus[status];
                    const percentage = metrics.totalAppointments > 0 
                      ? ((count / metrics.totalAppointments) * 100).toFixed(0) 
                      : 0;

                    let color = '#3b82f6';
                    if (status === 'Confirmed') color = '#10b981';
                    if (status === 'Pending') color = '#f59e0b';
                    if (status === 'Cancelled') color = '#ef4444';

                    return (
                      <div key={status} className="d-flex align-items-center gap-2 small">
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: color }} className="flex-shrink-0"></div>
                        <div className="flex-grow-1 d-flex justify-content-between">
                          <span className="fw-semibold text-dark">{status}</span>
                          <span className="text-muted">{count} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
            
            {specializationBreakdown.length === 0 ? (
              <div className="text-center text-muted small py-4">No verified doctors registered.</div>
            ) : (
              <div className="table-responsive">
                {(() => {
                  const maxCount = Math.max(...specializationBreakdown.map(s => s.count), 1);
                  return (
                    <svg width="100%" height={specializationBreakdown.length * 45 + 10} viewBox={`0 0 500 ${specializationBreakdown.length * 45 + 10}`} style={{ minWidth: '450px' }}>
                      {specializationBreakdown.map((spec, idx) => {
                        const percentage = (spec.count / maxCount) * 100;
                        const yPos = idx * 45 + 10;
                        return (
                          <g key={spec.specialization || spec._id}>
                            {/* Label */}
                            <text x="10" y={yPos + 20} style={{ fontSize: '13px', fill: '#475569', fontWeight: '600', fontFamily: 'system-ui' }}>
                              {spec.specialization || spec._id}
                            </text>
                            
                            {/* Gray Background Bar */}
                            <rect x="180" y={yPos + 8} width="240" height="14" rx="7" fill="#f1f5f9" />
                            
                            {/* Blue Fill Bar */}
                            <rect
                              x="180"
                              y={yPos + 8}
                              width={(percentage / 100) * 240}
                              height="14"
                              rx="7"
                              fill="url(#barGradient)"
                            />

                            {/* Count text */}
                            <text x="440" y={yPos + 20} style={{ fontSize: '13px', fill: '#1e293b', fontWeight: '700', fontFamily: 'system-ui' }}>
                              {spec.count} {spec.count === 1 ? 'doctor' : 'doctors'}
                            </text>
                          </g>
                        );
                      })}
                      <defs>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
