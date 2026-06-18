import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell, Calendar, User, CheckCircle, Clock } from 'lucide-react';

const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/followups');
      setFollowups(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch follow-ups list.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled': return <span className="badge bg-warning text-dark">Scheduled Checkup</span>;
      case 'Completed': return <span className="badge bg-success">Completed</span>;
      case 'Missed': return <span className="badge bg-danger">Missed</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Follow-Up Reminders</h2>
          <p className="text-muted mb-0">Track future re-evaluations scheduled by consulting doctors.</p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading reminders...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : followups.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <Bell size={48} className="text-muted mx-auto mb-3" />
          <h5>No Follow-Ups Found</h5>
          <p className="text-muted small">You don't have any follow-ups scheduled at the moment.</p>
        </div>
      ) : (
        <div className="row g-3">
          {followups.map((fol) => (
            <div key={fol._id} className="col-lg-6 col-12">
              <div className="glass-card p-4 border h-100 d-flex flex-column" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-warning-light text-warning p-2 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Follow-Up Appointment</h6>
                      <span className="small text-muted" style={{ fontSize: '11px' }}>Checkup Date</span>
                    </div>
                  </div>
                  {getStatusBadge(fol.status)}
                </div>

                <div className="mb-3">
                  <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span>With Doctor: <strong>Dr. {fol.doctorId ? fol.doctorId.name : 'Practitioner'}</strong></span>
                  </p>
                  <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span>Date: <strong>{formatDate(fol.followUpDate)}</strong></span>
                  </p>
                  <hr className="my-2" />
                  <p className="small text-dark mb-0">
                    <strong>Checkup Reason:</strong>
                    <span className="d-block mt-1 text-muted bg-light p-2 rounded">{fol.reason || 'General clinical review.'}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
