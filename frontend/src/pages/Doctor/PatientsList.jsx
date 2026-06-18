import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, FileText, Download, Calendar, Pill, Bell, X, Heart } from 'lucide-react';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timeline modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments');
      // Extract unique patients
      const patientMap = {};
      data.forEach(app => {
        if (app.patientId && !patientMap[app.patientId._id]) {
          patientMap[app.patientId._id] = app.patientId;
        }
      });
      setPatients(Object.values(patientMap));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patients list.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    setTimelineLoading(true);
    try {
      const { data } = await api.get(`/patients/timeline?patientId=${patient._id}`);
      setTimeline(data);
    } catch (err) {
      console.error('Error fetching patient history timeline:', err);
      alert('Failed to load patient history timeline.');
    } finally {
      setTimelineLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">My Patients</h2>
          <p className="text-muted mb-0">Review clinical records and treatment histories of your patients.</p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading patients list...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <Users size={48} className="text-muted mx-auto mb-3" />
          <h5>No Patients Found</h5>
          <p className="text-muted small">Patients will appear here once they book appointments with you.</p>
        </div>
      ) : (
        <div className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {patient.avatar ? (
                          <img
                            src={`http://localhost:5000${patient.avatar}`}
                            alt={patient.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold">{patient.name}</span>
                      </div>
                    </td>
                    <td>{patient.email}</td>
                    <td>{patient.phone || 'N/A'}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={() => handleViewHistory(patient)}
                      >
                        <FileText size={14} /> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Heart size={20} className="text-danger animate-pulse" />
                  <span>Clinical Health History: {selectedPatient.name}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedPatient(null)}></button>
              </div>
              <div className="modal-body p-4 bg-light">
                {timelineLoading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading patient history...</span>
                    </div>
                  </div>
                ) : timeline.length === 0 ? (
                  <p className="text-center text-muted py-4 small">This patient has no clinical history recorded in HealthConnect.</p>
                ) : (
                  <div className="timeline-container">
                    {timeline.map((event) => (
                      <div key={event._id} className="timeline-item">
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

                          {/* Notes / Medicines details */}
                          {event.type === 'appointment' && event.notes && (
                            <div className="p-2 border rounded bg-white small mb-2">
                              <strong>Notes:</strong> {event.notes}
                            </div>
                          )}

                          {event.type === 'prescription' && (
                            <div className="p-2 border rounded bg-white small mb-2">
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
                              <Download size={10} /> View File
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top p-3 bg-white">
                <button
                  type="button"
                  className="btn btn-primary text-white px-4"
                  onClick={() => setSelectedPatient(null)}
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
