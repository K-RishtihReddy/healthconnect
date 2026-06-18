import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, Star, MapPin, Award, ShieldAlert, Check } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams(); // User ID of doctor
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('In-Person');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Set tomorrow as default booking date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateString);
  }, []);

  // Fetch Doctor Profile
  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !doctor) return;
      try {
        const { data } = await api.get(`/doctors/${id}/availability?date=${selectedDate}`);
        setAvailableSlots(data.slots || []);
        setSelectedSlot(''); // Reset selection
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };
    fetchAvailability();
  }, [selectedDate, doctor, id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }

    if (user.role !== 'patient') {
      setError('Only registered patients can book appointments.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      await api.post('/appointments', {
        doctorId: doctor.userId._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
        type
      });
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5 align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading doctor profile...</span>
        </div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="row g-4">
        {/* Profile Details Column */}
        <div className="col-lg-8">
          <div className="glass-card p-4 mb-4" style={{ borderRadius: '20px' }}>
            <div className="d-flex flex-column flex-sm-row gap-4 mb-4 align-items-center align-items-sm-start">
              {doctor.userId?.avatar ? (
                <img
                  src={`http://localhost:5000${doctor.userId.avatar}`}
                  alt={doctor.userId.name}
                  style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                />
              ) : (
                <div className="bg-primary-light text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '130px', height: '130px', borderRadius: '50%', fontSize: '40px', background: 'rgba(79, 70, 229, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  {doctor.userId ? doctor.userId.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <div className="text-center text-sm-start">
                <h2 className="fw-bold mb-1">{doctor.userId ? doctor.userId.name : 'Dr. Practitioner'}</h2>
                <p className="text-primary fw-medium fs-5 mb-2">{doctor.specialization}</p>
                <div className="d-flex flex-wrap gap-3 align-items-center justify-content-center justify-content-sm-start">
                  <span className="badge bg-success px-3 py-2" style={{ borderRadius: '20px' }}>Verified</span>
                  <div className="d-flex align-items-center gap-1 text-warning small">
                    <Star size={16} fill="currentColor" />
                    <span className="fw-bold text-dark">{doctor.rating || 4.8}</span>
                    <span className="text-muted">(100+ Patients Checked)</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <h5 className="fw-bold mb-3">About Biography</h5>
            <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
              {doctor.bio || 'Dr. Practitioner has not updated their biography details yet. They are dedicated to delivering patient-centric, high-quality medical services.'}
            </p>

            <h5 className="fw-bold mb-3">Professional Qualifications</h5>
            <div className="d-flex gap-3 mb-4">
              <div className="bg-light p-3 rounded-circle text-primary align-self-start">
                <Award size={24} />
              </div>
              <div>
                <h6 className="fw-bold mb-1">{doctor.qualification}</h6>
                <p className="text-muted small mb-0">Certified Practitioner with {doctor.experience} years of clinical history.</p>
              </div>
            </div>

            <h5 className="fw-bold mb-3">Practice Location</h5>
            <div className="d-flex gap-3">
              <div className="bg-light p-3 rounded-circle text-primary align-self-start">
                <MapPin size={24} />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Consultation Address</h6>
                <p className="text-muted small mb-0">{doctor.userId?.address || 'Medical Center Office Suite 404, Hospital Road'}</p>
              </div>
            </div>
          </div>

          {/* Availability Reference */}
          <div className="card border p-4" style={{ borderRadius: '20px' }}>
            <h5 className="fw-bold mb-3">Standard Availability Schedule</h5>
            <div className="row g-2">
              {doctor.availability && doctor.availability.map((av, idx) => (
                <div key={idx} className="col-sm-6">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold mb-1">{av.day}</h6>
                    <p className="small text-muted mb-0">{av.slots.length} Slots: {av.slots[0]} - {av.slots[av.slots.length - 1]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Booking Panel */}
        <div className="col-lg-4">
          <div className="card border p-4 shadow-sm position-sticky" style={{ top: '100px', borderRadius: '20px', background: '#fff' }}>
            <h4 className="fw-bold mb-4">Book Appointment</h4>
            
            {bookingSuccess ? (
              <div className="text-center py-4">
                <div className="bg-success text-white d-inline-flex p-3 rounded-circle mb-3">
                  <Check size={32} />
                </div>
                <h5 className="fw-bold">Booking Confirmed!</h5>
                <p className="text-muted small">Redirecting to your appointments list...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="d-flex flex-column gap-3">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 small p-2" role="alert">
                    <ShieldAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div>
                  <label className="form-label small fw-semibold text-muted">Consultation Type</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn w-100 py-2 small fw-medium ${type === 'In-Person' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                      onClick={() => setType('In-Person')}
                    >
                      In-Person Visit
                    </button>
                    <button
                      type="button"
                      className={`btn w-100 py-2 small fw-medium ${type === 'Online' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                      onClick={() => setType('Online')}
                    >
                      Online consultation
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-semibold text-muted">Select Date</label>
                  <div className="input-group border rounded px-2 py-1">
                    <Calendar size={18} className="text-muted align-self-center me-2" />
                    <input
                      type="date"
                      className="form-control border-0 p-1"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ fontSize: '14px', boxShadow: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-semibold text-muted">Select Time Slot</label>
                  {availableSlots.length === 0 ? (
                    <div className="p-3 border rounded bg-light text-center small text-muted">
                      No slots available for this date.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '150px', overflowY: 'auto', padding: '2px' }}>
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`btn btn-sm py-2 px-3 ${selectedSlot === slot ? 'btn-primary text-white' : 'btn-outline-light text-dark border'}`}
                          onClick={() => setSelectedSlot(slot)}
                          style={{ borderRadius: '20px', fontSize: '12px' }}
                        >
                          <Clock size={12} className="me-1 d-inline" /> {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label small fw-semibold text-muted">Symptoms / Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Briefly state symptoms, medical concerns..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ fontSize: '14px' }}
                    required
                  ></textarea>
                </div>

                <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small">Doctor Fee</span>
                    <h4 className="mb-0 fw-bold">${doctor.fees}</h4>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 text-white"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Booking...' : user ? 'Book Slot' : 'Login to Book'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
