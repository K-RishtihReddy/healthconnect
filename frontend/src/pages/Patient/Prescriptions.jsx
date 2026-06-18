import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Pill, Calendar, User, Eye, X, Printer } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [selectedPres, setSelectedPres] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch prescription history');
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

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">My Prescriptions</h2>
          <p className="text-muted mb-0">Review digital prescriptions prescribed by consulting doctors.</p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading prescriptions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <Pill size={48} className="text-muted mx-auto mb-3" />
          <h5>No Prescriptions Found</h5>
          <p className="text-muted small">You don't have any prescription records listed yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {prescriptions.map((pres) => (
            <div key={pres._id} className="col-lg-6 col-12">
              <div className="glass-card p-4 border h-100 d-flex flex-column" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary-light text-primary p-2 rounded" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
                      <Pill size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Prescription Sheet</h6>
                      <span className="small text-muted" style={{ fontSize: '11px' }}>ID: #{pres._id.substring(18)}</span>
                    </div>
                  </div>
                  <span className="small fw-semibold text-muted bg-light border px-2 py-1 rounded" style={{ fontSize: '11px' }}>
                    {formatDate(pres.date)}
                  </span>
                </div>

                <div className="mb-4 flex-grow-1">
                  <p className="small text-muted mb-2 d-flex align-items-center gap-1">
                    <User size={14} className="text-primary" />
                    <span>Prescribed by: <strong>Dr. {pres.doctorId ? pres.doctorId.name : 'Practitioner'}</strong></span>
                  </p>
                  <hr className="my-2" />
                  <div className="mt-2">
                    <p className="small fw-semibold text-dark mb-2">Medicines ({pres.medicines.length}):</p>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-1 small text-muted">
                      {pres.medicines.slice(0, 3).map((m, idx) => (
                        <li key={idx} className="d-flex justify-content-between">
                          <span>• {m.name}</span>
                          <span>{m.dosage} ({m.duration})</span>
                        </li>
                      ))}
                      {pres.medicines.length > 3 && (
                        <li className="text-primary small">+ {pres.medicines.length - 3} more medicines</li>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-auto"
                  onClick={() => setSelectedPres(pres)}
                  style={{ borderRadius: '8px', fontSize: '14px' }}
                >
                  <Eye size={16} /> View Full Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Detail Modal Overlay */}
      {selectedPres && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Pill className="text-primary" />
                  <span>Clinical Prescription Receipt</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPres(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4 bg-light" id="printable-prescription">
                <div className="card p-4 border border-dashed shadow-sm bg-white" style={{ borderRadius: '12px' }}>
                  {/* Mock Clinic Header */}
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                    <div>
                      <h4 className="fw-bold text-primary mb-0">HealthConnect Clinic</h4>
                      <p className="small text-muted mb-0">Digital Care Management Platform</p>
                    </div>
                    <div className="text-end">
                      <p className="small text-dark fw-bold mb-0">Dr. {selectedPres.doctorId ? selectedPres.doctorId.name : 'Unknown'}</p>
                      <p className="small text-muted mb-0">Email: {selectedPres.doctorId?.email}</p>
                      <p className="small text-muted mb-0">Date: {formatDate(selectedPres.date)}</p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-light p-3 rounded mb-4 row g-2 mx-0">
                    <div className="col-sm-6 small">
                      <span className="text-muted">PATIENT NAME:</span>
                      <p className="fw-bold mb-0 text-dark">{selectedPres.patientId?.name || 'John Doe'}</p>
                    </div>
                    <div className="col-sm-6 small">
                      <span className="text-muted">PRESCRIPTION SHEET ID:</span>
                      <p className="fw-bold mb-0 text-dark">#{selectedPres._id}</p>
                    </div>
                  </div>

                  {/* Rx Symbol */}
                  <div className="fs-1 fw-bold text-primary mb-3">Rₓ</div>

                  {/* Medicines Table */}
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPres.medicines.map((m, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{m.name}</td>
                          <td>{m.dosage}</td>
                          <td>{m.duration}</td>
                          <td className="small text-muted">{m.instructions || 'As directed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {selectedPres.notes && (
                    <div className="mt-4 border-top pt-3">
                      <h6>Doctor Consultation Notes:</h6>
                      <p className="small text-muted bg-light p-2 rounded">{selectedPres.notes}</p>
                    </div>
                  )}

                  {/* Footer signature */}
                  <div className="mt-5 text-end pt-4">
                    <div className="d-inline-block border-top text-center pt-2" style={{ minWidth: '200px' }}>
                      <p className="small fw-semibold mb-0">Dr. {selectedPres.doctorId?.name}</p>
                      <span className="small text-muted" style={{ fontSize: '10px' }}>Authorized Signature</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top p-3 bg-white d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setSelectedPres(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary text-white d-flex align-items-center gap-2 px-4"
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Print Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
