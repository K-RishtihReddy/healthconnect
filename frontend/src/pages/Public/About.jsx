import React from 'react';
import { Activity, ShieldAlert, Award, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="container py-5 animate-fade-in-up">
      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-3">About HealthConnect</h1>
          <p className="lead text-muted">
            HealthConnect is a digital clinical management ecosystem bridging the gap between healthcare practitioners and patients.
          </p>
        </div>
      </div>

      <div className="row g-5 align-items-center mb-5">
        <div className="col-lg-6">
          <h3 className="fw-bold mb-3">Our Mission</h3>
          <p className="text-muted" style={{ lineHeight: '1.7' }}>
            We believe clinical history management should be borderless, intuitive, and secure. HealthConnect enables individuals to build their personal health folders chronologically while offering doctors a real-time availability planner and consultation toolkit.
          </p>
          <p className="text-muted" style={{ lineHeight: '1.7' }}>
            By digitizing prescriptions, scheduling clinical follow-ups, and organizing medical records, we aim to minimize missed appointments, improve medical compliance, and simplify clinical administrative workloads.
          </p>
        </div>
        <div className="col-lg-6">
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
            alt="Clinical Laboratory"
            className="img-fluid rounded shadow"
            style={{ borderRadius: '16px' }}
          />
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card border p-4 text-center h-100">
            <div className="text-primary mb-3 mx-auto">
              <Award size={32} />
            </div>
            <h5 className="fw-bold">Certified Specialists</h5>
            <p className="text-muted small">
              Every healthcare provider listed on our directory undergoes rigorous background verification and license check by administrative team.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border p-4 text-center h-100">
            <div className="text-primary mb-3 mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h5 className="fw-bold">HIPAA Secure Records</h5>
            <p className="text-muted small">
              Patient data privacy is our priority. Uploaded records are encrypted and protected by strict role-based access limits.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border p-4 text-center h-100">
            <div className="text-primary mb-3 mx-auto">
              <Activity size={32} />
            </div>
            <h5 className="fw-bold">Dynamic Health Timeline</h5>
            <p className="text-muted small">
              Track your treatment progression automatically. From your very first appointment to lab reports, everything is laid out chronologically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
