import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Clock, Check, X, ShieldAlert, Pill, Plus, Trash2, BookOpen, User } from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  // Consultation sheet states
  const [activeConsult, setActiveConsult] = useState(null); // Holds the appointment record being consulted
  const [notes, setNotes] = useState('');

  // Prescription states
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);

  // Follow up states
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');

  const [consultLoading, setConsultLoading] = useState(false);

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
      setError('Failed to retrieve appointments feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleStartConsult = (app) => {
    setActiveConsult(app);
    setNotes('');
    setMedicines([{ name: '', dosage: '', duration: '', instructions: '' }]);
    setFollowUpDate('');
    setFollowUpReason('');
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicineRow = (idx) => {
    const list = [...medicines];
    list.splice(idx, 1);
    setMedicines(list);
  };

  const handleMedicineChange = (idx, field, value) => {
    const list = [...medicines];
    list[idx][field] = value;
    setMedicines(list);
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    if (!notes) {
      alert('Please add consultation notes before completing.');
      return;
    }

    setConsultLoading(true);

    try {
      // 1. Save consultation notes
      await api.put(`/appointments/${activeConsult._id}/notes`, { notes });

      // 2. If prescription medicines are added, save prescription
      const validMedicines = medicines.filter(m => m.name && m.dosage && m.duration);
      if (validMedicines.length > 0) {
        await api.post('/prescriptions', {
          appointmentId: activeConsult._id,
          patientId: activeConsult.patientId._id,
          medicines: validMedicines,
          notes: notes
        });
      } else {
        // If no medicines are added, manually mark appointment as Completed
        await api.put(`/appointments/${activeConsult._id}/status`, { status: 'Completed' });
      }

      // 3. If follow-up date is selected, schedule follow-up alert
      if (followUpDate) {
        await api.post('/followups', {
          appointmentId: activeConsult._id,
          patientId: activeConsult.patientId._id,
          followUpDate,
          reason: followUpReason || 'Routine post-consult check'
        });
      }

      setActiveConsult(null); // Reset
      fetchAppointments(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Failed to save consultation details.');
    } finally {
      setConsultLoading(false);
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
      case 'Pending': return <span className="badge bg-warning text-dark">Pending Request</span>;
      case 'Confirmed': return <span className="badge bg-success">Confirmed Slot</span>;
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
          <h2 className="fw-bold">Manage Appointments</h2>
          <p className="text-muted mb-0">Accept/Reject patient bookings and complete consultations.</p>
        </div>
      </div>

      {/* Filter Tabs */}
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
          <Calendar size={48} className="text-muted mx-auto mb-3" />
          <h5>No Appointments Found</h5>
          <p className="text-muted small">No bookings matched this category.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredAppointments.map((app) => (
            <div key={app._id} className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <div className="d-flex gap-3 align-items-center">
                    {app.patientId?.avatar ? (
                      <img
                        src={`http://localhost:5000${app.patientId.avatar}`}
                        alt={app.patientId.name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '50px', height: '50px', borderRadius: '50%' }}>
                        {app.patientId ? app.patientId.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}
                    <div>
                      <h6 className="fw-bold mb-1">{app.patientId ? app.patientId.name : 'Patient User'}</h6>
                      <p className="small text-muted mb-0">Gender: {app.patientId?.gender || 'Other'}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="d-flex flex-column gap-1">
                    <span className="small text-dark fw-medium d-flex align-items-center gap-1">
                      <Calendar size={14} className="text-muted" /> {formatDate(app.date)}
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <Clock size={14} className="text-muted" /> Slot: {app.timeSlot} • Type: {app.type}
                    </span>
                  </div>
                </div>

                <div className="col-md-4 text-md-end d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
                  {getStatusBadge(app.status)}

                  {/* Actions */}
                  {app.status === 'Pending' && (
                    <div className="d-flex gap-2 w-100 justify-content-md-end mt-2">
                      <button
                        className="btn btn-sm btn-success text-white d-flex align-items-center gap-1"
                        onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}

                  {app.status === 'Confirmed' && (
                    <div className="d-flex gap-2 w-100 justify-content-md-end mt-2">
                      <button
                        className="btn btn-sm btn-primary text-white d-flex align-items-center gap-1"
                        onClick={() => handleStartConsult(app)}
                      >
                        <BookOpen size={14} /> Consult & Complete
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {app.reason && (
                <div className="mt-3 p-3 bg-light border rounded small">
                  <strong>Patient Symptoms/Reason:</strong>
                  <p className="mb-0 text-muted mt-1">{app.reason}</p>
                </div>
              )}

              {app.notes && (
                <div className="mt-3 p-3 border rounded small" style={{ background: '#f8fafc' }}>
                  <strong>Consultation Notes:</strong>
                  <p className="mb-0 text-muted mt-1">{app.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Consultation & Prescription Sheet Modal */}
      {activeConsult && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Pill className="text-primary animate-pulse" />
                  <span>Clinical Consultation & Prescription Editor</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setActiveConsult(null)}></button>
              </div>
              <form onSubmit={handleConsultationSubmit} className="modal-body p-4 bg-light">
                <div className="card p-4 border shadow-sm bg-white mb-4" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Patient Details</h6>
                  <div className="row g-2 small text-muted">
                    <div className="col-sm-6">Patient Name: <strong className="text-dark">{activeConsult.patientId?.name}</strong></div>
                    <div className="col-sm-6">Age / DOB: <strong className="text-dark">{activeConsult.patientId?.dateOfBirth ? formatDate(activeConsult.patientId.dateOfBirth) : 'N/A'}</strong></div>
                    <div className="col-sm-6">Gender: <strong className="text-dark">{activeConsult.patientId?.gender}</strong></div>
                    <div className="col-sm-6">Appointment Date: <strong className="text-dark">{formatDate(activeConsult.date)} ({activeConsult.timeSlot})</strong></div>
                  </div>
                </div>

                {/* Consultation Notes */}
                <div className="card p-4 border shadow-sm bg-white mb-4" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Consultation Notes *</h6>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter diagnosis findings, symptoms checked, clinical advise..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* E-Prescriptions Editor */}
                <div className="card p-4 border shadow-sm bg-white mb-4" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2 d-flex justify-content-between align-items-center">
                    <span>E-Prescription Medicines</span>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                      onClick={handleAddMedicineRow}
                      style={{ fontSize: '11px', borderRadius: '4px' }}
                    >
                      <Plus size={12} /> Add Row
                    </button>
                  </h6>

                  <div className="d-flex flex-column gap-3">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="row g-2 align-items-end border-bottom pb-3">
                        <div className="col-md-3">
                          <label className="form-label small text-muted mb-1">Medicine Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Paracetamol"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small text-muted mb-1">Dosage</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 1-0-1 (After Food)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small text-muted mb-1">Duration</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 5 days"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small text-muted mb-1">Instructions</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Avoid cold drinks"
                            value={med.instructions}
                            onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          />
                        </div>
                        <div className="col-md-1 text-center">
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger p-1"
                              onClick={() => handleRemoveMedicineRow(idx)}
                              style={{ borderRadius: '50%' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-Up Scheduler */}
                <div className="card p-4 border shadow-sm bg-white" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Schedule Follow-up Visit (Optional)</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Follow-Up Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Reason for Follow-Up</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Review blood report"
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() => setActiveConsult(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary text-white px-4 py-2"
                    disabled={consultLoading}
                  >
                    {consultLoading ? 'Completing...' : 'Submit Consultation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
