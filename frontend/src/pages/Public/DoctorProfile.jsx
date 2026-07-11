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

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState({});

  // Helper to format Date to YYYY-MM-DD local string
  const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set tomorrow as default booking date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(getLocalDateString(tomorrow));
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

  // Fetch month availability when currentMonth or doctor changes
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      if (!doctor) return;

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // Start of grid (Sunday of the first row)
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay();
      
      const gridStart = new Date(firstDay);
      gridStart.setDate(firstDay.getDate() - firstDayOfWeek);

      // End of grid (42 days total)
      const gridEnd = new Date(gridStart);
      gridEnd.setDate(gridStart.getDate() + 41);

      const startStr = getLocalDateString(gridStart);
      const endStr = getLocalDateString(gridEnd);

      try {
        const { data } = await api.get(`/doctors/${id}/availability?startDate=${startStr}&endDate=${endStr}`);
        if (data.range) {
          setMonthAvailability(data.dates);
        }
      } catch (err) {
        console.error('Error fetching month availability:', err);
      }
    };
    fetchMonthAvailability();
  }, [currentMonth, doctor, id]);

  // Sync available slots when selectedDate or monthAvailability changes
  useEffect(() => {
    if (selectedDate && monthAvailability[selectedDate]) {
      setAvailableSlots(monthAvailability[selectedDate].slots || []);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, monthAvailability]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const today = new Date();
    if (currentMonth.getFullYear() > today.getFullYear() || 
       (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth())) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDayOfWeek);

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(gridStart);
      dayDate.setDate(gridStart.getDate() + i);
      
      const dateStr = getLocalDateString(dayDate);
      const isCurrentMonth = dayDate.getMonth() === month;
      const isPast = dayDate < today;
      const dayInfo = monthAvailability[dateStr];
      const hasSlots = dayInfo && dayInfo.totalSlotsCount > 0;
      const isAvailable = dayInfo && dayInfo.availableSlotsCount > 0;
      const isSelected = selectedDate === dateStr;
      
      let style = {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        margin: 'auto'
      };

      if (!isCurrentMonth) {
        style.color = '#cbd5e1';
        style.background = 'transparent';
        style.cursor = 'default';
      } else if (isPast) {
        style.color = '#cbd5e1';
        style.background = '#f8fafc';
        style.cursor = 'not-allowed';
      } else if (isSelected) {
        style.background = '#4f46e5';
        style.color = '#ffffff';
        style.boxShadow = '0 4px 10px rgba(79, 70, 229, 0.3)';
        style.transform = 'scale(1.08)';
      } else if (!hasSlots) {
        style.color = '#b91c1c';
        style.background = '#fef2f2';
        style.border = '1px solid #fecaca';
        style.cursor = 'not-allowed';
      } else if (isAvailable) {
        style.background = '#ecfdf5';
        style.color = '#047857';
        style.border = '1px solid #a7f3d0';
      } else {
        style.background = '#fef2f2';
        style.color = '#b91c1c';
        style.border = '1px solid #fecaca';
      }

      const handleClick = () => {
        if (!isCurrentMonth || isPast || !hasSlots) return;
        setSelectedDate(dateStr);
        setSelectedSlot('');
      };

      days.push(
        <div key={i} className="col text-center p-1" style={{ width: '14.28%' }}>
          <button
            type="button"
            style={style}
            onClick={handleClick}
            disabled={!isCurrentMonth || isPast || !hasSlots}
            title={
              dayInfo 
                ? `${dayInfo.bookedSlotsCount}/${dayInfo.totalSlotsCount} filled, ${dayInfo.availableSlotsCount} remaining`
                : ''
            }
          >
            {dayDate.getDate()}
          </button>
        </div>
      );
    }
    return days;
  };

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
                  <label className="form-label small fw-semibold text-muted mb-2">Select Date</label>
                  
                  {/* Custom Color-Coded React Calendar */}
                  <div className="border rounded p-3 mb-3 bg-light" style={{ borderRadius: '16px' }}>
                    {/* Calendar Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 fw-bold text-dark">
                        {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h6>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                          onClick={handlePrevMonth}
                          disabled={
                            currentMonth.getFullYear() === new Date().getFullYear() &&
                            currentMonth.getMonth() === new Date().getMonth()
                          }
                        >
                          &lt;
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                          onClick={handleNextMonth}
                        >
                          &gt;
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="row g-0 mb-2 border-bottom pb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} className="col text-center small fw-semibold text-muted" style={{ width: '14.28%', fontSize: '11px' }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="row g-0">
                      {renderCalendar()}
                    </div>

                    {/* Calendar Legend */}
                    <div className="d-flex gap-3 justify-content-center mt-3 pt-2 border-top" style={{ fontSize: '10px' }}>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', display: 'inline-block' }}></span>
                        <span className="text-muted">Available</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'inline-block' }}></span>
                        <span className="text-muted">Booked Out</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-block' }}></span>
                        <span className="text-muted">Not Working</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Date Summary Indicator */}
                  {selectedDate && monthAvailability[selectedDate] && (
                    <>
                      {monthAvailability[selectedDate].totalSlotsCount > 0 ? (
                        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2 border-0" style={{ borderRadius: '12px', fontSize: '13px', backgroundColor: 'rgba(13, 110, 253, 0.08)', color: '#0d6efd' }}>
                          <Clock size={16} />
                          <span>
                            <strong>{monthAvailability[selectedDate].bookedSlotsCount}/{monthAvailability[selectedDate].totalSlotsCount}</strong> are filled and remaining slots are <strong>{monthAvailability[selectedDate].availableSlotsCount}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2 border-0" style={{ borderRadius: '12px', fontSize: '13px', backgroundColor: 'rgba(255, 193, 7, 0.08)', color: '#ffc107' }}>
                          <ShieldAlert size={16} />
                          <span>Doctor is not available on this date.</span>
                        </div>
                      )}
                    </>
                  )}
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
