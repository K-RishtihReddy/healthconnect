import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

const VerifyDoctors = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/doctors/pending');
      setPending(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending doctor accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { isVerified });
      fetchPending();
    } catch (err) {
      console.error(err);
      alert('Verification update failed.');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject and delete this doctor registration?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchPending();
      } catch (err) {
        console.error(err);
        alert('Failed to delete rejected registration.');
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Doctor Verification Directory</h2>
          <p className="text-muted mb-0">Approve or reject doctor license registration requests.</p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading pending list...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : pending.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <ShieldCheck size={48} className="text-success mx-auto mb-3 animate-pulse" />
          <h5>All Clean!</h5>
          <p className="text-muted small">No pending doctor registrations awaiting verification.</p>
        </div>
      ) : (
        <div className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Doctor</th>
                  <th>Clinical Practice</th>
                  <th>Qualifications</th>
                  <th>Experience</th>
                  <th>Consult Fees</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <span className="fw-bold text-dark d-block">{doc.userId?.name}</span>
                      <span className="text-muted small d-block">{doc.userId?.email}</span>
                      <span className="text-muted small d-block">Tel: {doc.userId?.phone}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary-light text-primary" style={{ background: 'rgba(79, 70, 229, 0.08)' }}>
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="small">{doc.qualification}</td>
                    <td className="small">{doc.experience} years</td>
                    <td className="fw-bold">${doc.fees}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-success text-white d-flex align-items-center gap-1"
                          onClick={() => handleVerify(doc._id, true)}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleReject(doc.userId?._id)}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
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

export default VerifyDoctors;
