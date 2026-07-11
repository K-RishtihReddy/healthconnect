import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  Search,
  Stethoscope,
  Briefcase,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronDown,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
const STATIC_SPECIALIZATIONS = [
  'Cardiologists',
  'Dermatologists',
  'Endocrinologist',
  'Gastroenterologists',
  'Neurologist',
  'Oncologist',
  'Psychiatrist',
  'Obstetricians/Gynecologists'
];



const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  // Pre-populate with static list so dropdown always shows options
  const [availableSpecs, setAvailableSpecs] = useState([...STATIC_SPECIALIZATIONS].sort());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All Specializations');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Today's day name to check availability
  const todayName = DAYS_OF_WEEK[new Date().getDay()];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/doctors');
        const doctorList = Array.isArray(data) ? data : [];
        setDoctors(doctorList);
        setFiltered(doctorList);

        // Merge dynamic specs from actual doctors with the static list
        const dynamicSpecs = doctorList
          .map((d) => d.specialization)
          .filter(Boolean);
        const specsSet = new Set([...STATIC_SPECIALIZATIONS, ...dynamicSpecs]);
        const specs = Array.from(specsSet).sort();
        setAvailableSpecs(specs);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Unable to load doctors. Please try again later.');
        // Keep static specs even on error so dropdown still works
        setAvailableSpecs([...STATIC_SPECIALIZATIONS].sort());
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);


  // Re-filter whenever search/spec/availableOnly changes
  useEffect(() => {
    let result = [...doctors];

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      result = result.filter((d) => {
        const nameMatch = d.userId && d.userId.name && regex.test(d.userId.name);
        const bioMatch = d.bio && regex.test(d.bio);
        const specMatch = d.specialization && regex.test(d.specialization);
        return nameMatch || bioMatch || specMatch;
      });
    }

    if (selectedSpec && selectedSpec !== 'All Specializations') {
      result = result.filter((d) => d.specialization === selectedSpec);
    }

    if (availableOnly) {
      result = result.filter((d) =>
        d.availability && d.availability.some(
          (av) => av.day === todayName && av.slots && av.slots.length > 0
        )
      );
    }

    setFiltered(result);
  }, [search, selectedSpec, availableOnly, doctors]);

  const isDoctorAvailableToday = (doctor) => {
    if (!doctor.availability) return false;
    const todayEntry = doctor.availability.find((av) => av.day === todayName);
    return todayEntry && todayEntry.slots && todayEntry.slots.length > 0;
  };

  const getTodaySlots = (doctor) => {
    if (!doctor.availability) return [];
    const todayEntry = doctor.availability.find((av) => av.day === todayName);
    return todayEntry ? todayEntry.slots : [];
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSpec('All Specializations');
    setAvailableOnly(false);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center gap-2">
          <Stethoscope size={26} className="text-primary" />
          Find a Doctor
        </h2>
        <p className="text-muted mb-0">
          Browse verified doctors and book your appointment today ({todayName})
        </p>
      </div>

      <div className="row g-4">
        {/* ── Filter Sidebar ── */}
        <div className="col-lg-3">
          <div
            className="card border shadow-sm p-4"
            style={{ borderRadius: '18px', background: '#fff', position: 'sticky', top: '90px' }}
          >
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" />
              Filters
            </h6>

            {/* Search */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Search</label>
              <div
                className="d-flex align-items-center border rounded px-2 py-1 bg-white"
                style={{ gap: '6px' }}
              >
                <Search size={16} className="text-muted flex-shrink-0" />
                <input
                  type="text"
                  className="form-control border-0 p-1"
                  placeholder="Name, bio…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '13px', boxShadow: 'none' }}
                />
              </div>
            </div>

            {/* Specialization dropdown — dynamically built from fetched doctors */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted d-flex align-items-center justify-content-between">
                Specialization
                {availableSpecs.length > 0 && (
                  <span
                    style={{
                      background: 'rgba(79,70,229,0.1)',
                      color: '#4f46e5',
                      fontSize: '10px',
                      fontWeight: '700',
                      borderRadius: '20px',
                      padding: '2px 8px',
                    }}
                  >
                    {availableSpecs.length} available
                  </span>
                )}
              </label>
              <div className="position-relative">
                <select
                  className="form-select"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  style={{ fontSize: '13px', paddingRight: '32px' }}
                >
                  <option value="All Specializations">
                    All Specializations ({doctors.length})
                  </option>
                  {availableSpecs.map((spec) => {
                    const count = doctors.filter((d) => d.specialization === spec).length;
                    return (
                      <option key={spec} value={spec}>
                        {spec} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown
                  size={14}
                  className="text-muted position-absolute"
                  style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Available Today toggle */}
            <div className="mb-4">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="availableToggle"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  className="form-check-label small fw-semibold text-muted"
                  htmlFor="availableToggle"
                  style={{ cursor: 'pointer' }}
                >
                  Available Today Only
                </label>
              </div>
            </div>

            <button
              className="btn btn-outline-secondary w-100 btn-sm"
              onClick={clearFilters}
              style={{ fontSize: '13px', borderRadius: '8px' }}
            >
              Clear Filters
            </button>

            {/* Stats */}
            <div
              className="mt-4 p-3 rounded text-center"
              style={{ background: 'rgba(79,70,229,0.06)', borderRadius: '12px' }}
            >
              <p className="mb-1 fw-bold text-primary" style={{ fontSize: '22px' }}>
                {filtered.length}
              </p>
              <p className="mb-0 small text-muted">
                {filtered.length === 1 ? 'Doctor Found' : 'Doctors Found'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Doctors Grid ── */}
        <div className="col-lg-9">
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div className="spinner-border text-primary" role="status" style={{ width: '48px', height: '48px' }}>
                <span className="visually-hidden">Loading…</span>
              </div>
              <p className="text-muted small">Fetching available doctors…</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-5 card border"
              style={{ borderRadius: '18px', background: '#fff' }}
            >
              <Stethoscope size={52} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold">No Doctors Found</h5>
              <p className="text-muted small mb-3">
                Try adjusting your search or filters.
              </p>
              <button className="btn btn-outline-primary btn-sm mx-auto" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((doc) => {
                const availableToday = isDoctorAvailableToday(doc);
                const todaySlots = getTodaySlots(doc);
                const doctorUserId = doc.userId ? doc.userId._id : doc._id;
                const doctorName = doc.userId ? doc.userId.name : 'Dr. Practitioner';
                const doctorAvatar = doc.userId ? doc.userId.avatar : null;

                return (
                  <div key={doc._id} className="col-md-6 col-12">
                    <div
                      className="glass-card h-100 d-flex flex-column"
                      style={{ borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Top Badges Row */}
                      <div
                        className="position-absolute d-flex flex-column align-items-end gap-1"
                        style={{ top: '16px', right: '16px' }}
                      >
                        {/* Verified badge */}
                        {!doc.isVerified && (
                          <span
                            className="badge d-flex align-items-center gap-1"
                            style={{
                              background: 'rgba(245,158,11,0.12)',
                              color: '#d97706',
                              fontSize: '10px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              padding: '3px 8px',
                              border: '1px solid rgba(245,158,11,0.3)',
                            }}
                          >
                            ⏳ Pending Verification
                          </span>
                        )}
                        {/* Availability badge */}
                        {availableToday ? (
                          <span
                            className="badge d-flex align-items-center gap-1"
                            style={{
                              background: 'rgba(16,185,129,0.12)',
                              color: '#10b981',
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              padding: '4px 10px',
                              border: '1px solid rgba(16,185,129,0.3)',
                            }}
                          >
                            <CheckCircle size={11} />
                            Available Today
                          </span>
                        ) : (
                          <span
                            className="badge d-flex align-items-center gap-1"
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              padding: '4px 10px',
                              border: '1px solid rgba(239,68,68,0.25)',
                            }}
                          >
                            <XCircle size={11} />
                            Unavailable Today
                          </span>
                        )}
                      </div>

                      {/* Doctor Header */}
                      <div className="d-flex gap-3 align-items-center mb-3" style={{ marginTop: '4px' }}>
                        {doctorAvatar ? (
                          <img
                            src={`http://localhost:5000${doctorAvatar}`}
                            alt={doctorName}
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '3px solid rgba(79,70,229,0.15)',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            fontSize: '22px',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: doctorAvatar ? 'none' : 'flex',
                          }}
                        >
                          {doctorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '15px' }}>
                            {doctorName}
                          </h6>
                          <span
                            className="badge mb-1"
                            style={{
                              background: 'rgba(79,70,229,0.1)',
                              color: '#4f46e5',
                              fontSize: '11px',
                              borderRadius: '20px',
                              padding: '3px 10px',
                            }}
                          >
                            {doc.specialization}
                          </span>
                          <div className="d-flex align-items-center gap-1 text-warning" style={{ fontSize: '12px' }}>
                            <Star size={12} fill="currentColor" />
                            <span className="fw-semibold">{doc.rating || '4.5'}</span>
                            <span className="text-muted ms-1">· Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Pills */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span
                          className="d-flex align-items-center gap-1 small"
                          style={{
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: '#475569',
                          }}
                        >
                          <Briefcase size={12} className="text-primary" />
                          {doc.experience} yrs exp.
                        </span>
                        <span
                          className="d-flex align-items-center gap-1 small"
                          style={{
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: '#475569',
                          }}
                        >
                          <UserRound size={12} className="text-primary" />
                          {doc.qualification || 'MBBS'}
                        </span>
                        <span
                          className="d-flex align-items-center gap-1 small"
                          style={{
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: '#475569',
                          }}
                        >
                          <DollarSign size={12} className="text-primary" />
                          ${doc.fees} fee
                        </span>
                      </div>

                      {/* Bio */}
                      {doc.bio && (
                        <p
                          className="text-muted mb-3"
                          style={{
                            fontSize: '13px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.5',
                          }}
                        >
                          {doc.bio}
                        </p>
                      )}

                      {/* Today's Slots */}
                      {availableToday && todaySlots.length > 0 && (
                        <div className="mb-3">
                          <p
                            className="small fw-semibold text-muted mb-2 d-flex align-items-center gap-1"
                          >
                            <Clock size={13} className="text-primary" />
                            Today's Available Slots
                          </p>
                          <div className="d-flex flex-wrap gap-1">
                            {todaySlots.slice(0, 4).map((slot) => (
                              <span
                                key={slot}
                                style={{
                                  background: 'rgba(16,185,129,0.08)',
                                  color: '#059669',
                                  border: '1px solid rgba(16,185,129,0.25)',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}
                              >
                                {slot}
                              </span>
                            ))}
                            {todaySlots.length > 4 && (
                              <span
                                style={{
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                }}
                              >
                                +{todaySlots.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Divider + CTA */}
                      <div className="mt-auto pt-3 border-top d-flex gap-2">
                        <Link
                          to={`/doctors/${doctorUserId}`}
                          className="btn btn-outline-primary flex-grow-1"
                          style={{ fontSize: '13px', borderRadius: '10px', padding: '8px 0' }}
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/doctors/${doctorUserId}`}
                          className="btn btn-primary text-white flex-grow-1"
                          style={{ fontSize: '13px', borderRadius: '10px', padding: '8px 0' }}
                        >
                          Book Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
