import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Users, Clock, CheckCircle2, ChevronRight, Stethoscope, Star } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to load appointments feed');
    } finally {
      setLoading(false);
    }
  };

  const getTodayAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter(app => {
      if (!app.date) return false;
      const appDateStr = new Date(app.date).toISOString().split('T')[0];
      return appDateStr === todayStr && app.status !== 'Cancelled';
    });
  };

  const getPendingAppointments = () => {
    return appointments.filter(app => app.status === 'Pending');
  };

  const getUniquePatientsCount = () => {
    const patientIds = appointments.map(app => app.patientId?._id);
    return new Set(patientIds.filter(Boolean)).size;
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
          <span className="visually-hidden">Loading dashboard feed...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const todayApps = getTodayAppointments();
  const pendingApps = getPendingAppointments();
  const uniquePatients = getUniquePatientsCount();

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Doctor Console: {user.name}</h2>
          <p className="text-muted mb-0">Manage your clinical slots, review patient histories, and write prescriptions.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-primary-light text-primary p-3 rounded-circle" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{todayApps.length}</h4>
              <span className="text-muted small">Today's Visits</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-warning-light text-warning p-3 rounded-circle" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{pendingApps.length}</h4>
              <span className="text-muted small">Pending Approvals</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-success-light text-success p-3 rounded-circle" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
              <Users size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{uniquePatients}</h4>
              <span className="text-muted small">Active Patients</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Schedule */}
        <div className="col-lg-8">
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
            <h5 className="fw-bold mb-4 d-flex justify-content-between align-items-center">
              <span>Today's Appointment Schedule</span>
              <span className="small text-muted">{formatDate(new Date())}</span>
            </h5>

            {todayApps.length === 0 ? (
              <div className="text-center py-4 border rounded border-dashed bg-light">
                <p className="text-muted small mb-0">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {todayApps.map(app => (
                  <div key={app._id} className="p-3 border rounded d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 bg-light">
                    <div className="d-flex gap-3 align-items-center">
                      {app.patientId?.avatar ? (
                        <img
                          src={`http://localhost:5000${app.patientId.avatar}`}
                          alt={app.patientId.name}
                          style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '45px', height: '45px', borderRadius: '50%' }}>
                          {app.patientId ? app.patientId.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      )}
                      <div>
                        <h6 className="fw-bold mb-0">{app.patientId ? app.patientId.name : 'Patient User'}</h6>
                        <span className="small text-muted">Slot: {app.timeSlot} • Type: {app.type}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to="/doctor/appointments" className="btn btn-sm btn-outline-primary py-1 px-3">
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doctor clinical profile summary */}
        <div className="col-lg-4">
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
            <h5 className="fw-bold mb-3">Clinical Profile</h5>
            
            <div className="d-flex gap-3 align-items-center mb-3">
              <div className="bg-primary-light text-primary p-3 rounded" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
                <Stethoscope size={24} />
              </div>
              <div>
                <h6 className="fw-bold mb-0">{user.doctorProfile?.specialization || 'Cardiology'}</h6>
                <span className="small text-muted">{user.doctorProfile?.qualification || 'MBBS, MD'}</span>
              </div>
            </div>

            <hr className="my-3" />

            <div className="d-flex flex-column gap-2 small text-muted">
              <div className="d-flex justify-content-between">
                <span>Experience:</span>
                <strong className="text-dark">{user.doctorProfile?.experience || 10} years</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Fees:</span>
                <strong className="text-dark">${user.doctorProfile?.fees || 100}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Profile Status:</span>
                <span className="badge bg-success">Verified</span>
              </div>
            </div>

            <Link to="/doctor/availability" className="btn btn-primary text-white w-100 mt-4 py-2" style={{ borderRadius: '8px' }}>
              Set Weekly Slots
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
