import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Monitor,
  MessageSquare,
  Info,
  Calendar,
  Clock,
  User,
  Activity,
  Heart
} from 'lucide-react';

const ConsultationRoom = () => {
  const { id } = useParams(); // Appointment ID
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Call state
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: 'Secure Peer-to-Peer Telehealth connection established.', time: '00:00' },
    { id: 2, sender: 'system', text: 'All clinical video feeds are HIPAA encrypted.', time: '00:00' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Refs
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch Appointment Info
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/appointments/${id}`);
        setAppointment(data);
        
        // Mock a first greeting message after 3 seconds
        setTimeout(() => {
          const senderName = data.doctorId?._id === user._id ? data.patientId?.name : (data.doctorId?.name || 'Dr. Practitioner');
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'other',
              text: `Hello, I have joined the video consultation room. Ready to begin!`,
              time: formatCallTime(duration)
            }
          ]);
        }, 3000);

      } catch (err) {
        console.error(err);
        setError('Failed to join the consultation room. Make sure you are authorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, user]);

  // Call timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // Video feed canvas animation
  useEffect(() => {
    if (!videoOn || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      // Draw futuristic grid background
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw complex pulsing circular sound waves
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 80;

      // Pulse gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.1)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + Math.sin(time) * 15 + 100, 0, Math.PI * 2);
      ctx.fill();

      // Pulse Ring 1 (Doctor or Patient icon placeholder)
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + Math.sin(time) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Pulse Ring 2
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 30 + Math.cos(time * 0.8) * 12, 0, Math.PI * 2);
      ctx.stroke();

      // Sine Wave overlay representing heartbeat
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y = centerY + Math.sin(i * 0.01 + time) * 15 * Math.sin(time * 0.2);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Text status
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('LIVE ENCRYPTED VIDEO FEED', centerX, centerY + 130);

      // Status indicator ring dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(centerX - 90, centerY + 126, 4, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [videoOn]);

  const formatCallTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'me',
        text: newMsg.trim(),
        time: formatCallTime(duration)
      }
    ]);
    const typed = newMsg.trim();
    setNewMsg('');

    // Simulated quick automated response contextually
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'other',
          text: `Got that. Let's record this information in the consultation sheet.`,
          time: formatCallTime(duration)
        }
      ]);
    }, 4000);
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to exit the consultation room?')) {
      const redirectUrl = user.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments';
      navigate(redirectUrl);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Joining video room...</span>
        </div>
        <p className="text-muted fw-semibold">Connecting to clinical servers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger p-4 text-center" style={{ borderRadius: '16px' }}>
          <h5 className="fw-bold">Connection Failed</h5>
          <p>{error}</p>
          <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const isDoctor = user.role === 'doctor';
  const otherUser = isDoctor ? appointment.patientId : appointment.doctorId;

  return (
    <div className="container-fluid px-0 animate-fade-in-up" style={{ marginTop: '-12px' }}>
      <div className="row g-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Left Side: Video Feed Stream & Controls */}
        <div className={showChat ? 'col-lg-8 d-flex flex-column' : 'col-lg-12 d-flex flex-column'}>
          <div
            className="flex-grow-1 position-relative d-flex flex-column justify-content-center bg-dark border shadow"
            style={{ borderRadius: '24px', overflow: 'hidden', minHeight: '480px' }}
          >
            {/* Header overlay */}
            <div
              className="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                zIndex: 10
              }}
            >
              <div className="d-flex align-items-center gap-2 text-white">
                <div
                  className="bg-success rounded-circle"
                  style={{ width: '10px', height: '10px', animation: 'pulse 1.5s infinite' }}
                ></div>
                <span className="small fw-semibold letter-spacing-1">
                  SECURE VISIT • {appointment.type.toUpperCase()}
                </span>
              </div>

              {/* Timer badge */}
              <div
                className="badge bg-danger text-white d-flex align-items-center gap-2 px-3 py-2 fs-6 fw-bold border border-danger"
                style={{ borderRadius: '20px' }}
              >
                <Clock size={16} />
                <span>{formatCallTime(duration)}</span>
              </div>
            </div>

            {/* Video Feed representation */}
            <div className="w-100 h-100 flex-grow-1 d-flex align-items-center justify-content-center bg-black">
              {videoOn ? (
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="w-100 h-100"
                  style={{ objectFit: 'contain', background: '#090d16' }}
                ></canvas>
              ) : (
                <div className="text-center text-muted p-5">
                  <VideoOff size={64} className="mb-3 text-secondary" />
                  <h5 className="fw-bold text-white">Video Feed Stopped</h5>
                  <p className="small">Your camera stream is currently turned off.</p>
                </div>
              )}

              {/* Mini picture-in-picture stream (Self overlay) */}
              <div
                className="position-absolute border shadow-sm bg-dark"
                style={{
                  width: '140px',
                  height: '105px',
                  bottom: '80px',
                  right: '20px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  zIndex: 5
                }}
              >
                <div className="w-100 h-100 bg-secondary d-flex flex-column align-items-center justify-content-center text-white small">
                  <User size={24} className="mb-1" />
                  <span style={{ fontSize: '10px' }}>You (Self)</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div
              className="p-3 d-flex justify-content-center align-items-center gap-3 bg-dark border-top border-secondary"
              style={{ zIndex: 10 }}
            >
              {/* Mic toggle */}
              <button
                type="button"
                className={`btn btn-lg rounded-circle d-flex align-items-center justify-content-center ${micOn ? 'btn-outline-light' : 'btn-danger text-white'}`}
                style={{ width: '48px', height: '48px', padding: '0', border: '1px solid var(--bs-border-color)' }}
                onClick={() => setMicOn(!micOn)}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              {/* Video toggle */}
              <button
                type="button"
                className={`btn btn-lg rounded-circle d-flex align-items-center justify-content-center ${videoOn ? 'btn-outline-light' : 'btn-danger text-white'}`}
                style={{ width: '48px', height: '48px', padding: '0', border: '1px solid var(--bs-border-color)' }}
                onClick={() => setVideoOn(!videoOn)}
                title={videoOn ? 'Stop Camera' : 'Start Camera'}
              >
                {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              {/* Screen Share simulation toggle */}
              <button
                type="button"
                className={`btn btn-lg rounded-circle d-flex align-items-center justify-content-center ${screenShare ? 'btn-success text-white' : 'btn-outline-light'}`}
                style={{ width: '48px', height: '48px', padding: '0', border: '1px solid var(--bs-border-color)' }}
                onClick={() => {
                  setScreenShare(!screenShare);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      sender: 'system',
                      text: `Screen sharing ${!screenShare ? 'started' : 'stopped'} by ${user.name}.`,
                      time: formatCallTime(duration)
                    }
                  ]);
                }}
                title={screenShare ? 'Stop Sharing' : 'Share Screen'}
              >
                <Monitor size={20} />
              </button>

              {/* Toggle chat panel */}
              <button
                type="button"
                className={`btn btn-lg rounded-circle d-flex align-items-center justify-content-center ${showChat ? 'btn-primary text-white' : 'btn-outline-light'}`}
                style={{ width: '48px', height: '48px', padding: '0', border: '1px solid var(--bs-border-color)' }}
                onClick={() => setShowChat(!showChat)}
                title="Toggle Live Chat"
              >
                <MessageSquare size={20} />
              </button>

              <div className="border-start border-secondary mx-2" style={{ height: '30px' }}></div>

              {/* Hangup button */}
              <button
                type="button"
                className="btn btn-danger btn-lg px-4 d-flex align-items-center gap-2 text-white"
                style={{ borderRadius: '24px' }}
                onClick={handleEndCall}
              >
                <PhoneOff size={18} />
                <span className="d-none d-sm-inline">End Visit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Shared Chat & Consultant Info Panel */}
        {showChat && (
          <div className="col-lg-4 d-flex flex-column">
            <div
              className="card border shadow h-100 d-flex flex-column"
              style={{ borderRadius: '24px', overflow: 'hidden', background: '#fff' }}
            >
              {/* Profile card block */}
              <div className="p-4 border-bottom bg-light">
                <h6 className="fw-bold mb-3 text-muted small d-flex align-items-center gap-2">
                  <Info size={14} className="text-primary" />
                  CONSULTATION ROOM MEMBERS
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    {otherUser ? otherUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{otherUser ? otherUser.name : 'Unknown User'}</h6>
                    <span className="badge bg-primary-light text-primary small" style={{ background: 'rgba(79,70,229,0.08)' }}>
                      Connected Party
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white rounded border small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Symptoms:</span>
                    <strong className="text-dark">{appointment.reason}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Time slot:</span>
                    <strong className="text-dark">{appointment.timeSlot}</strong>
                  </div>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ maxHeight: '350px', background: '#f8fafc' }}>
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span
                          className="d-inline-block px-3 py-1 bg-white border text-muted small"
                          style={{ borderRadius: '20px', fontSize: '11px' }}
                        >
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender === 'me';
                  return (
                    <div key={msg.id} className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                      <span className="small text-muted mb-1" style={{ fontSize: '10px' }}>
                        {isMe ? 'You' : (otherUser ? otherUser.name : 'Participant')} • {msg.time}
                      </span>
                      <div
                        className={`p-3 rounded-3 text-break small ${isMe ? 'bg-primary text-white font-medium' : 'bg-white border text-dark'}`}
                        style={{
                          maxWidth: '85%',
                          borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                          background: isMe ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#fff'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input section */}
              <form onSubmit={handleSendChat} className="p-3 border-top bg-white d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type message to other party..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  style={{ borderRadius: '12px' }}
                />
                <button type="submit" className="btn btn-primary text-white px-3" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
                  <Send size={16} />
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConsultationRoom;
