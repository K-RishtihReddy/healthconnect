import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { Clock, Plus, Trash2, Check, ShieldAlert } from 'lucide-react';

const Availability = () => {
  const { user, setUser } = useContext(AuthContext);
  
  const [availability, setAvailability] = useState([]);
  const [newDay, setNewDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Default standard slots list helper
  const standardSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    if (user && user.doctorProfile) {
      setAvailability(user.doctorProfile.availability || []);
    }
  }, [user]);

  const handleAddDay = () => {
    // Check if day already exists in config
    const exists = availability.find(av => av.day === newDay);
    if (exists) {
      alert(`${newDay} is already added. Add time slots inside it instead.`);
      return;
    }
    setAvailability([...availability, { day: newDay, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }]);
  };

  const handleRemoveDay = (dayName) => {
    setAvailability(availability.filter(av => av.day !== dayName));
  };

  const handleAddSlotToDay = (dayName) => {
    if (!newSlot) {
      alert('Please select or write a time slot.');
      return;
    }
    
    const list = availability.map(av => {
      if (av.day === dayName) {
        if (av.slots.includes(newSlot)) {
          alert('Slot already exists.');
          return av;
        }
        // Add slot and sort
        const updatedSlots = [...av.slots, newSlot].sort();
        return { ...av, slots: updatedSlots };
      }
      return av;
    });

    setAvailability(list);
    setNewSlot('');
  };

  const handleRemoveSlotFromDay = (dayName, slotValue) => {
    const list = availability.map(av => {
      if (av.day === dayName) {
        return { ...av, slots: av.slots.filter(s => s !== slotValue) };
      }
      return av;
    });
    setAvailability(list);
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      // Send PUT request to doctor profile
      const { data } = await api.put('/doctors/profile', {
        availability: availability
      });

      // Update state in AuthContext
      setUser(prev => ({
        ...prev,
        doctorProfile: {
          ...prev.doctorProfile,
          availability: availability
        }
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update availability schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Availability Scheduling</h2>
          <p className="text-muted mb-0">Configure your weekly consulting days and hours.</p>
        </div>
      </div>

      <div className="card border p-4 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 small p-2 mb-3" role="alert">
            <Check size={16} />
            <span>Availability schedule saved successfully!</span>
          </div>
        )}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 small p-2 mb-3" role="alert">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Add Day Widget */}
        <div className="p-3 border rounded bg-light mb-4 row g-2 align-items-center mx-0">
          <div className="col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1">Select Day</label>
            <select className="form-select" value={newDay} onChange={(e) => setNewDay(e.target.value)}>
              {weekdays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <span className="small text-muted">Initializes with standard slots: 9:00, 10:00, 11:00, 14:00, 15:00.</span>
          </div>
          <div className="col-md-3 text-end">
            <button type="button" className="btn btn-primary text-white w-100 py-2" onClick={handleAddDay}>
              Add Day
            </button>
          </div>
        </div>

        {/* Configured Days List */}
        {availability.length === 0 ? (
          <div className="text-center py-5 border border-dashed rounded bg-light">
            <Clock size={40} className="text-muted mx-auto mb-2" />
            <p className="text-muted mb-0">No active consulting days configured.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {availability.map((av) => (
              <div key={av.day} className="p-4 border rounded bg-white position-relative shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-primary">{av.day}</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleRemoveDay(av.day)}
                  >
                    <Trash2 size={14} /> Remove Day
                  </button>
                </div>

                {/* Time Slots Tags */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {av.slots.map((slot) => (
                    <span
                      key={slot}
                      className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2"
                      style={{ fontSize: '12px', borderRadius: '20px' }}
                    >
                      <Clock size={12} className="text-primary" />
                      <span>{slot}</span>
                      <button
                        type="button"
                        className="btn-close ms-1"
                        style={{ fontSize: '8px' }}
                        onClick={() => handleRemoveSlotFromDay(av.day, slot)}
                      ></button>
                    </span>
                  ))}
                </div>

                {/* Add slot inside day */}
                <div className="row g-2 align-items-center" style={{ maxWidth: '400px' }}>
                  <div className="col-8">
                    <select
                      className="form-select form-select-sm"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                    >
                      <option value="">Select Time Slot</option>
                      {standardSlots.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-2 w-100 justify-content-center"
                      onClick={() => handleAddSlotToDay(av.day)}
                    >
                      <Plus size={12} /> Add Slot
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <hr className="my-3" />

            <div className="text-end">
              <button
                type="button"
                className="btn btn-primary text-white px-5 py-2"
                onClick={handleSaveConfig}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
