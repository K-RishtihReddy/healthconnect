import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Phone, MapPin, Calendar, Camera, Check, ShieldAlert, BookOpen, DollarSign, Award, Briefcase } from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateProfile } = useContext(AuthContext);

  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [fees, setFees] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories (specializations) for doctors
  useEffect(() => {
    if (user && user.role === 'doctor') {
      const fetchCategories = async () => {
        try {
          const { data } = await api.get('/admin/categories');
          setCategories(data);
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      };
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'Male');
      if (user.dateOfBirth) {
        setDateOfBirth(user.dateOfBirth.split('T')[0]);
      }
      setAddress(user.address || '');
      if (user.avatar) {
        setAvatarPreview(`http://localhost:5000${user.avatar}`);
      }
      if (user.role === 'doctor' && user.doctorProfile) {
        setSpecialization(user.doctorProfile.specialization || '');
        setExperience(user.doctorProfile.experience || '');
        setQualification(user.doctorProfile.qualification || '');
        setFees(user.doctorProfile.fees || '');
        setBio(user.doctorProfile.bio || '');
      }
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('gender', gender);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('address', address);

    if (avatar) {
      formData.append('avatar', avatar);
    }

    if (password) {
      formData.append('password', password);
    }

    if (user.role === 'doctor') {
      formData.append('specialization', specialization);
      formData.append('experience', experience);
      formData.append('qualification', qualification);
      formData.append('fees', fees);
      formData.append('bio', bio);
    }

    try {
      await updateProfile(formData, true);
      setSuccess(true);
      setPassword(''); // Reset password field
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Profile Settings</h2>
          <p className="text-muted mb-0">Update your account details and profile demographics.</p>
        </div>
      </div>

      <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
        <form onSubmit={handleSubmit} className="row g-3">
          {success && (
            <div className="col-12">
              <div className="alert alert-success d-flex align-items-center gap-2 small p-2 mb-0" role="alert">
                <Check size={16} />
                <span>Profile details updated successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="col-12">
              <div className="alert alert-danger d-flex align-items-center gap-2 small p-2 mb-0" role="alert">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="col-12 d-flex flex-column align-items-center mb-3">
            <div className="position-relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={name}
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f46e5' }}
                />
              ) : (
                <div className="bg-light text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '120px', height: '120px', borderRadius: '50%', fontSize: '36px' }}>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="btn btn-primary btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center text-white"
                style={{ bottom: '0', right: '0', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                <Camera size={16} />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="d-none"
                />
              </label>
            </div>
            <span className="small text-muted mt-2">Click icon to change picture</span>
          </div>

          {/* Account Settings Section */}
          <div className="col-12">
            <h6 className="fw-bold mb-3 text-primary">Account Details</h6>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Full Name</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <User size={18} className="text-muted align-self-center me-2" />
              <input
                type="text"
                className="form-control border-0 p-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Phone Number</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <Phone size={18} className="text-muted align-self-center me-2" />
              <input
                type="text"
                className="form-control border-0 p-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Gender</label>
            <select
              className="form-select py-2"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ fontSize: '14px' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Date of Birth</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <Calendar size={18} className="text-muted align-self-center me-2" />
              <input
                type="date"
                className="form-control border-0 p-1"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
              />
            </div>
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold text-muted">Address</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <MapPin size={18} className="text-muted align-self-center me-2" />
              <input
                type="text"
                className="form-control border-0 p-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
              />
            </div>
          </div>

          {/* Doctor-Specific Fields Section */}
          {user && user.role === 'doctor' && (
            <>
              <div className="col-12 border-top pt-3 mt-3">
                <h6 className="fw-bold mb-3 text-primary">Clinical Information</h6>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Specialization</label>
                <div className="input-group border rounded px-2 py-1 bg-white">
                  <Award size={18} className="text-muted align-self-center me-2" />
                  <select
                    className="form-select border-0 p-1"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    style={{ fontSize: '14px', boxShadow: 'none' }}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Qualification</label>
                <div className="input-group border rounded px-2 py-1 bg-white">
                  <BookOpen size={18} className="text-muted align-self-center me-2" />
                  <input
                    type="text"
                    className="form-control border-0 p-1"
                    placeholder="e.g. MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    style={{ fontSize: '14px', boxShadow: 'none' }}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Experience (Years)</label>
                <div className="input-group border rounded px-2 py-1 bg-white">
                  <Briefcase size={18} className="text-muted align-self-center me-2" />
                  <input
                    type="number"
                    className="form-control border-0 p-1"
                    placeholder="e.g. 5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={{ fontSize: '14px', boxShadow: 'none' }}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Consultation Fees ($)</label>
                <div className="input-group border rounded px-2 py-1 bg-white">
                  <DollarSign size={18} className="text-muted align-self-center me-2" />
                  <input
                    type="number"
                    className="form-control border-0 p-1"
                    placeholder="e.g. 100"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    style={{ fontSize: '14px', boxShadow: 'none' }}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-muted">Professional Biography</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell patients about your background and clinical focus..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ fontSize: '14px', borderRadius: '8px' }}
                />
              </div>
            </>
          )}

          {/* Security Settings Section */}
          <div className="col-12 border-top pt-3 mt-3">
            <h6 className="fw-bold mb-3 text-primary">Security Settings</h6>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">New Password (leave blank to keep current)</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="col-12 text-end mt-4">
            <button type="submit" className="btn btn-primary text-white px-5 py-2" disabled={loading} style={{ borderRadius: '8px' }}>
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
