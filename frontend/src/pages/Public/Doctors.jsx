import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { Search, MapPin, Star, Stethoscope, Briefcase } from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const specParam = searchParams.get('specialization') || '';

  const [search, setSearch] = useState(searchParam);
  const [selectedSpec, setSelectedSpec] = useState(specParam);

  // Sync params to state on change
  useEffect(() => {
    setSearch(searchParam);
    setSelectedSpec(specParam);
    fetchDoctors();
  }, [searchParam, specParam]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors';
      const params = [];
      if (searchParam) params.push(`search=${encodeURIComponent(searchParam)}`);
      if (specParam) params.push(`specialization=${encodeURIComponent(specParam)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const { data } = await api.get(url);
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (selectedSpec) newParams.specialization = selectedSpec;
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSpec('');
    setSearchParams({});
  };

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="row g-4 mb-5">
        <div className="col-12 text-center">
          <h1 className="fw-bold">Find Certified Doctors</h1>
          <p className="text-muted">Consult online or schedule an in-person visit with verified practitioners</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Filter Panel */}
        <div className="col-lg-3">
          <div className="card border p-4 shadow-sm" style={{ borderRadius: '16px', background: '#fff' }}>
            <h5 className="fw-bold mb-4">Filters</h5>
            
            <form onSubmit={handleFilterSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold text-muted">Search Doctor</label>
                <div className="input-group border rounded px-2 py-1 bg-white">
                  <Search size={18} className="text-muted align-self-center me-2" />
                  <input
                    type="text"
                    className="form-control border-0 p-1"
                    placeholder="Doctor name, bio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ fontSize: '14px', boxShadow: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-semibold text-muted">Specialization</label>
                <select
                  className="form-select"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  style={{ fontSize: '14px' }}
                >
                  <option value="">All Specialties</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary w-100 py-2 text-white" style={{ fontSize: '14px' }}>
                  Apply
                </button>
                <button type="button" className="btn btn-outline-secondary w-100 py-2" onClick={clearFilters} style={{ fontSize: '14px' }}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading doctors...</span>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-5 card border" style={{ borderRadius: '16px' }}>
              <Stethoscope size={48} className="text-muted mx-auto mb-3" />
              <h5>No Doctors Found</h5>
              <p className="text-muted small">Try tweaking your search terms or specializations</p>
              <button className="btn btn-outline-primary btn-sm mx-auto mt-2" onClick={clearFilters}>
                View All Doctors
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {doctors.map((doc) => (
                <div key={doc._id} className="col-md-6 col-12">
                  <div className="glass-card p-4 h-100 d-flex flex-column" style={{ borderRadius: '16px' }}>
                    <div className="d-flex gap-3 mb-3">
                      {doc.userId && doc.userId.avatar ? (
                        <img
                          src={`http://localhost:5000${doc.userId.avatar}`}
                          alt={doc.userId.name}
                          style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      ) : (
                        <div className="bg-primary-light text-primary d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', borderRadius: '50%', fontSize: '24px', fontWeight: 'bold', background: 'rgba(79, 70, 229, 0.1)' }}>
                          {doc.userId ? doc.userId.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                      )}
                      <div>
                        <h5 className="fw-bold mb-1">{doc.userId ? doc.userId.name : 'Dr. Practitioner'}</h5>
                        <span className="badge bg-primary-light text-primary mb-2" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
                          {doc.specialization}
                        </span>
                        <div className="d-flex align-items-center gap-1 text-warning small">
                          <Star size={14} fill="currentColor" />
                          <span>{doc.rating || 4.5}</span>
                          <span className="text-muted">(Verified)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 text-muted small flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Briefcase size={14} className="text-primary" />
                        <span><strong>Experience:</strong> {doc.experience} years</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Stethoscope size={14} className="text-primary" />
                        <span className="text-truncate"><strong>Qualification:</strong> {doc.qualification}</span>
                      </div>
                      <p className="mb-0 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.4' }}>
                        {doc.bio || 'No doctor biography available.'}
                      </p>
                    </div>

                    <hr className="my-3" />
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        <p className="mb-0 text-muted small">Consultation Fee</p>
                        <p className="mb-0 fw-bold text-dark fs-5">${doc.fees}</p>
                      </div>
                      <Link to={`/doctors/${doc.userId ? doc.userId._id : doc._id}`} className="btn btn-primary text-white">
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
