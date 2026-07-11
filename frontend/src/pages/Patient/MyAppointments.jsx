import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Calendar, Clock, Star, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment slot?')) {
      try {
        await api.put(`/appointments/${id}/status`, { status: 'Cancelled' });
        // Refresh
        fetchAppointments();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="badge bg-warning text-dark">Awaiting Approval</span>;
      case 'Confirmed': return <span className="badge bg-success">Confirmed Visit</span>;
      case 'Completed': return <span className="badge bg-primary">Completed Checkup</span>;
      case 'Cancelled': return <span className="badge bg-danger">Cancelled</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredAppointments = filter === 'All' 
    ? appointments 
    : appointments.filter(app => app.status === filter);

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">My Appointments</h2>
          <p className="text-muted mb-0">Track and manage your scheduled clinical checkups.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2" style={{ paddingBottom: '8px' }}>
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            className={`btn btn-sm px-4 py-2 ${filter === status ? 'btn-primary text-white' : 'btn-light'}`}
            onClick={() => setFilter(status)}
            style={{ borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading appointments...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <HelpCircle size={48} className="text-muted mx-auto mb-3" />
          <h5>No Appointments Found</h5>
          <p className="text-muted small">You don't have any appointments in this category.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredAppointments.map((app) => (
            <div key={app._id} className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
              <div className="row g-3 justify-content-between align-items-center">
                <div className="col-md-5">
                  <div className="d-flex gap-3 align-items-center">
                    {app.doctorId?.avatar ? (
                      <img
                        src={`http://localhost:5000${app.doctorId.avatar}`}
                        alt={app.doctorId.name}
                        style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '55px', height: '55px', borderRadius: '50%' }}>
                        {app.doctorId ? app.doctorId.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                    )}
                    <div>
                      <h5 className="fw-bold mb-1">{app.doctorId ? app.doctorId.name : 'Dr. Practitioner'}</h5>
                      <span className="badge bg-primary-light text-primary" style={{ background: 'rgba(79, 70, 229, 0.08)' }}>
                        {app.type} Consultation
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="d-flex flex-column gap-1">
                    <span className="small text-dark fw-medium d-flex align-items-center gap-1">
                      <Calendar size={14} className="text-muted" /> {formatDate(app.date)}
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <Clock size={14} className="text-muted" /> Time slot: {app.timeSlot}
                    </span>
                  </div>
                </div>

                <div className="col-md-3 text-md-end d-flex flex-column align-items-md-end gap-2">
                  {getStatusBadge(app.status)}
                  
                  {/* Join Consultation Button (Online & Confirmed) */}
                  {app.type === 'Online' && app.status === 'Confirmed' && (
                    <Link
                      to={`/patient/consultation/${app._id}`}
                      className="btn btn-sm btn-success text-white d-flex align-items-center gap-1 mt-1 justify-content-center"
                      style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}
                    >
                      Join Consultation
                    </Link>
                  )}

                  {/* Cancel Button */}
                  {(app.status === 'Pending' || app.status === 'Confirmed') && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-1"
                      onClick={() => handleCancel(app._id)}
                      style={{ fontSize: '12px' }}
                    >
                      Cancel Slot
                    </button>
                  )}
                </div>
              </div>

              {app.notes && (
                <div className="mt-3 p-3 bg-light border rounded small">
                  <strong>Doctor Consultation Notes:</strong>
                  <p className="mb-0 text-muted mt-1" style={{ whiteSpace: 'pre-line' }}>{app.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
