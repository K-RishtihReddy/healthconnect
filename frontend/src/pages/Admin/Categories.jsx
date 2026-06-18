import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Grid, Plus, Trash2, ShieldAlert } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Heart'); // Default icon
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load specialties categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setAddError('Category name is required.');
      return;
    }

    setAddLoading(true);
    setAddError('');

    try {
      await api.post('/admin/categories', { name, description, icon });
      setName('');
      setDescription('');
      setIcon('Heart');
      fetchCategories();
    } catch (err) {
      console.error(err);
      setAddError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialty category? Doctors in this specialty will lose their mapping tag.')) {
      try {
        await api.delete(`/admin/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert('Failed to delete category.');
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Medical Categories</h2>
          <p className="text-muted mb-0">Manage clinical specialties listed for doctor registrations.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Creation Form */}
        <div className="col-lg-4">
          <div className="card border p-4 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Plus size={18} className="text-primary" />
              <span>Add Specialty Category</span>
            </h5>
            
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {addError && (
                <div className="alert alert-danger small p-2 mb-0">{addError}</div>
              )}
              
              <div>
                <label className="form-label small fw-semibold text-muted">Specialty Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cardiology, Pediatrics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label small fw-semibold text-muted">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="form-label small fw-semibold text-muted">Preferred Icon Symbol</label>
                <select className="form-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                  <option value="Heart">Heart (Cardiovascular)</option>
                  <option value="Baby">Baby (Pediatric)</option>
                  <option value="Sparkles">Sparkles (Dermatology)</option>
                  <option value="Brain">Brain (Neurology)</option>
                  <option value="Activity">Activity (General / Orthopedic)</option>
                  <option value="Stethoscope">Stethoscope (General Practitioner)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary text-white w-100 py-2 mt-2" disabled={addLoading}>
                {addLoading ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Grid List */}
        <div className="col-lg-8">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading categories...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5 border rounded bg-white">
              <Grid size={48} className="text-muted mx-auto mb-3" />
              <h5>No Specialties Configured</h5>
              <p className="text-muted small">Configure categories on the left form panel.</p>
            </div>
          ) : (
            <div className="card border p-4 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Specialty Name</th>
                      <th>Description</th>
                      <th>Icon Code</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td><span className="fw-semibold text-dark">{cat.name}</span></td>
                        <td className="small text-muted">{cat.description || 'N/A'}</td>
                        <td><span className="badge bg-light text-dark border">{cat.icon}</span></td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat._id)}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
