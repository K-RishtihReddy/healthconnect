import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Upload, Plus, Trash2, Download, CloudLightning } from 'lucide-react';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState('Report');
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/records');
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch medical documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setUploadError('Please specify record title and attach a document file.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('recordType', recordType);
    formData.append('file', file);

    try {
      await api.post('/records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Clear form
      setTitle('');
      setDescription('');
      setRecordType('Report');
      setFile(null);
      setShowForm(false);
      // Refresh list
      fetchRecords();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Upload failed. File size might be too large or invalid file format.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords();
      } catch (err) {
        console.error(err);
        alert('Failed to delete medical report.');
      }
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
          <h2 className="fw-bold">Medical Records</h2>
          <p className="text-muted mb-0">Secure storage for lab reports, radiology scans, and prescriptions.</p>
        </div>
        <button
          className="btn btn-primary text-white d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}
          style={{ borderRadius: '8px' }}
        >
          {showForm ? 'Cancel Upload' : <><Plus size={18} /> Upload Document</>}
        </button>
      </div>

      {showForm && (
        <div className="card border p-4 shadow-sm mb-4 animate-fade-in-up" style={{ borderRadius: '16px', background: '#fff' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Upload size={18} className="text-primary" />
            <span>Upload New Report</span>
          </h5>
          
          <form onSubmit={handleUploadSubmit} className="row g-3">
            {uploadError && (
              <div className="col-12">
                <div className="alert alert-danger small p-2 mb-0">{uploadError}</div>
              </div>
            )}
            
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Document Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Blood Test Report, Chest X-Ray"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Record Type</label>
              <select className="form-select" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
                <option value="Report">Diagnostic Report</option>
                <option value="Lab Result">Lab Result</option>
                <option value="Prescription">Prescription File</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-muted">Description / Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Brief summary notes about this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-muted">Select File * (PDF, Word, PNG, JPG, Max 10MB)</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="col-12 mt-4 text-end">
              <button type="submit" className="btn btn-primary text-white px-4 py-2" disabled={uploadLoading}>
                {uploadLoading ? 'Uploading File...' : 'Start Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading documents...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : records.length === 0 ? (
        <div className="text-center py-5 border rounded bg-white">
          <FileText size={48} className="text-muted mx-auto mb-3" />
          <h5>No Documents Found</h5>
          <p className="text-muted small">Your medical folders are currently empty.</p>
        </div>
      ) : (
        <div className="row g-3">
          {records.map((rec) => (
            <div key={rec._id} className="col-lg-6 col-12">
              <div className="glass-card p-4 border h-100 d-flex flex-column" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light p-2 rounded text-primary">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{rec.title}</h6>
                      <span className="badge bg-light text-dark border small mt-1" style={{ fontSize: '10px' }}>
                        {rec.recordType}
                      </span>
                    </div>
                  </div>
                  <span className="small text-muted" style={{ fontSize: '11px' }}>{formatDate(rec.date)}</span>
                </div>

                <p className="small text-muted mb-4 flex-grow-1 mt-2">
                  {rec.description || 'No document description provided.'}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                  <span className="small text-muted">
                    Uploaded by: <strong>{rec.uploadedBy ? rec.uploadedBy.name : 'Unknown'}</strong>
                  </span>
                  <div className="d-flex gap-2">
                    <a
                      href={`http://localhost:5000${rec.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    >
                      <Download size={14} /> Open
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                      onClick={() => handleDelete(rec._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
