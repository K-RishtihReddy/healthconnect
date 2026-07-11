import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import { Activity, User as UserIcon, Stethoscope, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();


  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [fees, setFees] = useState('');
  const [bio, setBio] = useState('');

  // Predefined list of doctor specializations
  const specializationOptions = [
    'Cardiologists',
    'Dermatologists',
    'Endocrinologist',
    'Gastroenterologists',
    'Neurologist',
    'Oncologist',
    'Psychiatrist',
    'Obstetricians/Gynecologists',
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'doctor' ? '/doctor' : '/patient');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare register payload
    const payload = {
      name,
      email,
      password,
      role,
      phone,
      gender,
      dateOfBirth,
      address
    };

    if (role === 'doctor') {
      payload.specialization = specialization;
      payload.experience = experience;
      payload.qualification = qualification;
      payload.fees = fees;
      payload.bio = bio;
    }

    try {
      await register(payload);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="card border p-4 shadow-sm w-100 animate-fade-in-up" style={{ maxWidth: '600px', borderRadius: '20px', background: '#fff' }}>
        <div className="text-center mb-4">
          <div className="bg-primary-light text-primary d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
            <Activity size={32} />
          </div>
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted small">Join HealthConnect as a Patient or Healthcare Provider</p>
        </div>

        {/* Role Select Tabs */}
        <div className="d-flex mb-4 p-1 bg-light rounded" style={{ borderRadius: '8px' }}>
          <button
            type="button"
            className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 fw-semibold ${role === 'patient' ? 'bg-white shadow-sm text-primary' : 'bg-transparent text-muted'}`}
            onClick={() => setRole('patient')}
          >
            <UserIcon size={18} />
            Patient Sign Up
          </button>
          <button
            type="button"
            className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 fw-semibold ${role === 'doctor' ? 'bg-white shadow-sm text-primary' : 'bg-transparent text-muted'}`}
            onClick={() => setRole('doctor')}
          >
            <Stethoscope size={18} />
            Doctor Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="row g-3">
          {error && (
            <div className="col-12">
              <div className="alert alert-danger d-flex align-items-center gap-2 small p-2 mb-0" role="alert">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Common Credentials */}
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+1 555-0188"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Gender</label>
            <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold text-muted">Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="Street Address, City, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Doctor Specific Fields */}
          {role === 'doctor' && (
            <div className="col-12 border-top pt-3 mt-3 row g-3 mx-0 px-0">
              <div className="col-12 mb-2">
                <span className="badge bg-primary text-white">Clinical Information</span>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Specialization *</label>
                <select
                  className="form-select"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                >
                  <option value="" disabled>Select specialization</option>
                  {specializationOptions.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Qualification *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MBBS, MD Cardiology"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Experience (Years) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="10"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Consultation Fees ($) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="150"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold text-muted">Professional Biography</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Briefly summarize your clinical practice, clinical focus areas, etc."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
              <div className="col-12 text-muted small bg-light p-2 rounded">
                Note: Doctor accounts must be verified by the administrator before listing in search results.
              </div>
            </div>
          )}

          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary py-2 text-white w-100" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 border-top pt-3">
          <p className="small text-muted mb-0">
            Already have an account? <Link to="/login" className="text-primary fw-medium text-decoration-none">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
