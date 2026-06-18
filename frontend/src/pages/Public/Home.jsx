import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Search, Heart, Shield, Activity, Calendar, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/admin/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let query = '?';
    if (searchTerm) query += `search=${searchTerm}&`;
    if (selectedSpec) query += `specialization=${selectedSpec}`;
    navigate(`/doctors${query}`);
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Heart': return <Heart size={24} className="text-danger" />;
      case 'Activity': return <Activity size={24} className="text-primary" />;
      case 'Brain': return <Star size={24} className="text-warning" />;
      default: return <Activity size={24} className="text-primary" />;
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="py-5 bg-gradient-light border-bottom position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary-light text-primary fw-semibold px-3 py-2 rounded-pill mb-3" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
                Your Complete Digital Health Companion
              </span>
              <h1 className="display-4 fw-bold text-dark mb-3" style={{ lineHeight: '1.2' }}>
                Your Health Journey, <br />
                <span className="text-primary">Connected & Simplified</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '18px' }}>
                Book appointments with certified doctors, manage medical records securely, track treatments in a chronological timeline, and access prescription details anytime, anywhere.
              </p>

              {/* Search Widget */}
              <form onSubmit={handleSearch} className="p-3 bg-white border shadow-sm d-flex flex-column flex-sm-row gap-2 mb-4" style={{ borderRadius: '16px' }}>
                <div className="flex-grow-1 d-flex align-items-center px-2">
                  <Search size={20} className="text-muted me-2" />
                  <input
                    type="text"
                    className="form-control border-0 px-1"
                    placeholder="Search doctor by name or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ boxShadow: 'none' }}
                  />
                </div>
                <div className="border-start d-none d-sm-block" style={{ height: '30px', alignSelf: 'center' }}></div>
                <div className="d-flex align-items-center px-2">
                  <select
                    className="form-select border-0 bg-transparent text-muted"
                    value={selectedSpec}
                    onChange={(e) => setSelectedSpec(e.target.value)}
                    style={{ boxShadow: 'none', cursor: 'pointer', minWidth: '150px' }}
                  >
                    <option value="">All Specialities</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 text-white">
                  Find Doctor
                </button>
              </form>

              <div className="d-flex align-items-center gap-4 text-muted small">
                <span className="d-flex align-items-center gap-1"><Shield size={16} className="text-success" /> HIPAA Compliant Storage</span>
                <span className="d-flex align-items-center gap-1"><Heart size={16} className="text-danger" /> 24/7 Treatment Tracking</span>
              </div>
            </div>
            <div className="col-lg-6 text-center position-relative">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                alt="Healthcare Professionals"
                className="img-fluid rounded-3 shadow-lg"
                style={{ borderRadius: '24px', border: '8px solid rgba(255, 255, 255, 0.8)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Specialities Grid */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h2 className="fw-bold">Explore Medical Specialties</h2>
              <p className="text-muted mb-0">Consult with verified specialists across diverse clinical practices</p>
            </div>
            <Link to="/doctors" className="text-primary fw-medium text-decoration-none d-flex align-items-center gap-1">
              View All Doctors <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {categories.map((cat) => (
              <div key={cat._id} className="col-lg-2 col-md-4 col-6">
                <Link
                  to={`/doctors?specialization=${cat.name}`}
                  className="glass-card d-block p-4 text-center text-decoration-none text-dark h-100"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="bg-light d-inline-flex p-3 rounded-circle mb-3">
                    {getIconComponent(cat.icon)}
                  </div>
                  <h6 className="fw-bold mb-1">{cat.name}</h6>
                  <p className="small text-muted mb-0 text-truncate">{cat.description || 'Consult now'}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HealthConnect Features Showcase */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center max-w-lg mx-auto mb-5">
            <h2 className="fw-bold">Complete Healthcare Journey Management</h2>
            <p className="text-muted">A modern solution tailored for patients and clinical staff alike</p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-4 h-100 border shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="text-primary mb-3">
                  <Activity size={32} />
                </div>
                <h5 className="fw-bold">Interactive Health Timeline</h5>
                <p className="text-muted">
                  Never lose track of your treatments. View consultations, reports, prescriptions, and follow-ups in a structured, chronological path.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-4 h-100 border shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="text-primary mb-3">
                  <Calendar size={32} />
                </div>
                <h5 className="fw-bold">Instant Booking & Schedules</h5>
                <p className="text-muted">
                  Search active availability slots of doctors and request appointments in a click. Track your upcoming slots dynamically.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-4 h-100 border shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="text-primary mb-3">
                  <Shield size={32} />
                </div>
                <h5 className="fw-bold">Secure Health Records</h5>
                <p className="text-muted">
                  Upload lab reports, scans, and past prescriptions securely. Give doctors access to your medical history during consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
