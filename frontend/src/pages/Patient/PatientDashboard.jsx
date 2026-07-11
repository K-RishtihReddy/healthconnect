import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, FileText, Pill, Bell, Clock, ArrowRight, ShieldCheck, Heart, Download } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timeline filters and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, timelineRes] = await Promise.all([
          api.get('/patients/dashboard'),
          api.get('/patients/timeline')
        ]);
        setDashboardData(dashRes.data);
        setTimeline(timelineRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const { upcomingAppointment, recentPrescriptions, upcomingFollowUps, stats } = dashboardData;

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-muted mb-0">Here is your clinical health summary and upcoming activity feed.</p>
        </div>
      </div>

      {/* Stats Counters Grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-primary-light text-primary p-3 rounded-circle" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{stats.totalAppointments}</h4>
              <span className="text-muted small">Total Bookings</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-success-light text-success p-3 rounded-circle" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{stats.totalRecords}</h4>
              <span className="text-muted small">Medical Reports</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 border d-flex align-items-center gap-3" style={{ borderRadius: '16px' }}>
            <div className="bg-warning-light text-warning p-3 rounded-circle" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Pill size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{stats.totalPrescriptions}</h4>
              <span className="text-muted small">Prescribed Recipes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left widgets */}
        <div className="col-lg-7 d-flex flex-column gap-4">

          {/* Upcoming Appointment Widget */}
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
              <span>Next Appointment</span>
              <Link to="/patient/appointments" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </h5>

            {upcomingAppointment ? (
              <div className="p-3 border rounded bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div className="d-flex gap-3 align-items-center">
                  {upcomingAppointment.doctorId?.avatar ? (
                    <img
                      src={`http://localhost:5000${upcomingAppointment.doctorId.avatar}`}
                      alt={upcomingAppointment.doctorId.name}
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '50px', height: '50px', borderRadius: '50%' }}>
                      {upcomingAppointment.doctorId ? upcomingAppointment.doctorId.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                  )}
                  <div>
                    <h6 className="fw-bold mb-0">{upcomingAppointment.doctorId ? upcomingAppointment.doctorId.name : 'Dr. Practitioner'}</h6>
                    <span className="badge bg-primary-light text-primary mt-1" style={{ fontSize: '10px', background: 'rgba(79, 70, 229, 0.1)' }}>
                      {upcomingAppointment.type} Slot
                    </span>
                  </div>
                </div>
                <div className="d-flex flex-column text-sm-end">
                  <span className="fw-semibold text-dark d-flex align-items-center gap-1 justify-content-sm-end">
                    <Calendar size={14} className="text-primary" /> {formatDate(upcomingAppointment.date)}
                  </span>
                  <span className="small text-muted d-flex align-items-center gap-1 justify-content-sm-end">
                    <Clock size={14} className="text-primary" /> {upcomingAppointment.timeSlot}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border rounded border-dashed bg-light">
                <p className="text-muted small mb-3">No upcoming appointment scheduled.</p>
                <Link to="/doctors" className="btn btn-sm btn-primary text-white">Book Doctor Slot</Link>
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
              <span>Recent Prescriptions</span>
              <Link to="/patient/prescriptions" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </h5>

            {recentPrescriptions.length === 0 ? (
              <p className="text-muted small text-center py-3">No prescription records available.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recentPrescriptions.map((pres) => (
                  <div key={pres._id} className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Prescribed by Dr. {pres.doctorId ? pres.doctorId.name : 'Practitioner'}</h6>
                      <p className="small text-muted mb-0">{pres.medicines.length} Medicines: {pres.medicines.map(m => m.name).join(', ')}</p>
                    </div>
                    <span className="small fw-medium text-primary bg-white border rounded px-2 py-1">
                      {formatDate(pres.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Follow-Ups */}
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
              <span>Follow-Up Checkups</span>
              <Link to="/patient/followups" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </h5>

            {upcomingFollowUps.length === 0 ? (
              <p className="text-muted small text-center py-3">No pending follow-ups scheduled.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {upcomingFollowUps.map((fol) => (
                  <div key={fol._id} className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Checkup with Dr. {fol.doctorId ? fol.doctorId.name : 'Practitioner'}</h6>
                      <p className="small text-muted mb-0"><strong>Reason:</strong> {fol.reason}</p>
                    </div>
                    <span className="badge bg-warning text-dark small fw-semibold">
                      {formatDate(fol.followUpDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Chronological Health Timeline */}
        <div className="col-lg-5">
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff', maxHeight: '650px', overflowY: 'auto' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Heart size={20} className="text-danger animate-pulse" />
              <span>Health History Timeline</span>
            </h5>

            {/* Timeline interactive filter controls */}
            <div className="mb-3 d-flex flex-column gap-2 border-bottom pb-3">
              <div className="d-flex align-items-center border rounded px-2 py-1 bg-light">
                <input
                  type="text"
                  className="form-control border-0 bg-transparent p-1 shadow-none"
                  placeholder="Search timeline (doctor, notes, medicines)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>
              <div className="d-flex gap-2 align-items-center justify-content-between flex-wrap">
                <select
                  className="form-select form-select-sm w-auto border-0 bg-light shadow-none fw-medium text-muted"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{ fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <option value="All">All Events ({timeline.length})</option>
                  <option value="appointment">Appointments</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="record">Medical Records</option>
                  <option value="followup">Follow-Ups</option>
                </select>

                <button
                  type="button"
                  className="btn btn-xs btn-light d-flex align-items-center gap-1 border-0 fw-medium text-muted"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '8px' }}
                >
                  Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              </div>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted small mb-0">Your medical timeline is empty. Book appointments or upload files to start tracking.</p>
              </div>
            ) : (() => {
              const filteredTimeline = timeline
                .filter((event) => {
                  if (typeFilter !== 'All' && event.type !== typeFilter) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const titleMatch = event.title?.toLowerCase().includes(q);
                    const descMatch = event.description?.toLowerCase().includes(q);
                    const docMatch = event.doctorName?.toLowerCase().includes(q);
                    const notesMatch = event.notes?.toLowerCase().includes(q);
                    return titleMatch || descMatch || docMatch || notesMatch;
                  }
                  return true;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                });

              if (filteredTimeline.length === 0) {
                return (
                  <div className="text-center py-5 text-muted small">
                    No matching timeline events found.
                  </div>
                );
              }

              return (
                <div className="timeline-container">
                  {filteredTimeline.map((event) => (
                    <div key={event._id} className="timeline-item animate-fade-in-up">
                      <div className="timeline-item-icon">
                        {event.type === 'appointment' && <Calendar size={12} />}
                        {event.type === 'prescription' && <Pill size={12} />}
                        {event.type === 'record' && <FileText size={12} />}
                        {event.type === 'followup' && <Bell size={12} />}
                      </div>
                      <div className="ps-2">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="fw-bold small text-dark">{event.title}</span>
                          <span className="small text-muted" style={{ fontSize: '11px' }}>{formatDate(event.date)}</span>
                        </div>
                        <p className="small text-muted mb-2">{event.description}</p>

                        {/* Sub-details depending on event type */}
                        {event.type === 'appointment' && event.notes && (
                          <div className="p-2 border rounded bg-light small mb-2">
                            <strong>Consultation Notes:</strong> {event.notes}
                          </div>
                        )}

                        {event.type === 'prescription' && (
                          <div className="p-2 border rounded bg-light small mb-2">
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                              {event.medicines.map((m, idx) => (
                                <li key={idx} className="d-flex justify-content-between">
                                  <span>💊 {m.name}</span>
                                  <span className="text-muted">{m.dosage} ({m.duration})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.type === 'record' && event.filePath && (
                          <a
                            href={`http://localhost:5000${event.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2 mb-2 text-decoration-none"
                            style={{ fontSize: '11px', borderRadius: '4px' }}
                          >
                            <Download size={10} /> View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
