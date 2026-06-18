import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <Link className="d-flex align-items-center gap-2 fw-bold text-primary fs-4 mb-3 text-decoration-none" to="/">
              <Activity size={28} className="text-primary" />
              <span>HealthConnect</span>
            </Link>
            <p className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Empowering patients and doctors with an all-in-one clinical management tool. Manage records, appointments, prescriptions, and follow-ups with ease.
            </p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '14px' }}>
              <li><Link to="/" className="text-muted text-decoration-none hover-primary">Home</Link></li>
              <li><Link to="/doctors" className="text-muted text-decoration-none hover-primary">Find Doctors</Link></li>
              <li><Link to="/about" className="text-muted text-decoration-none hover-primary">About Us</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Services</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '14px' }}>
              <li className="text-muted">Appointment Scheduling</li>
              <li className="text-muted">Health Timeline Tracking</li>
              <li className="text-muted">Digital Medical Records</li>
              <li className="text-muted">E-Prescriptions</li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled d-flex flex-column gap-3" style={{ fontSize: '14px' }}>
              <li className="d-flex align-items-center gap-2 text-muted">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <span>742 Evergreen Terrace, Springfield</span>
              </li>
              <li className="d-flex align-items-center gap-2 text-muted">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span>+1 555-0199</span>
              </li>
              <li className="d-flex align-items-center gap-2 text-muted">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span>support@healthconnect.com</span>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <p className="text-muted small mb-0">© {new Date().getFullYear()} HealthConnect. All rights reserved.</p>
          <div className="d-flex gap-3 text-muted small">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
