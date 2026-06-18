import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  UserCheck,
  Grid,
  Clock
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const renderPatientLinks = () => (
    <>
      <NavLink to="/patient" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/patient/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Calendar size={20} />
        <span>My Appointments</span>
      </NavLink>
      <NavLink to="/patient/records" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <FileText size={20} />
        <span>Medical Records</span>
      </NavLink>
      <NavLink to="/patient/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Pill size={20} />
        <span>Prescriptions</span>
      </NavLink>
      <NavLink to="/patient/followups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Bell size={20} />
        <span>Follow-Ups</span>
      </NavLink>
      <NavLink to="/patient/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Profile Settings</span>
      </NavLink>
    </>
  );

  const renderDoctorLinks = () => (
    <>
      <NavLink to="/doctor" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/doctor/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Calendar size={20} />
        <span>Appointments</span>
      </NavLink>
      <NavLink to="/doctor/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Users size={20} />
        <span>Patients List</span>
      </NavLink>
      <NavLink to="/doctor/availability" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Clock size={20} />
        <span>Availability</span>
      </NavLink>
      <NavLink to="/doctor/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Pill size={20} />
        <span>Prescriptions</span>
      </NavLink>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Analytics</span>
      </NavLink>
      <NavLink to="/admin/verify" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <ShieldCheck size={20} />
        <span>Verify Doctors</span>
      </NavLink>
      <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <UserCheck size={20} />
        <span>Manage Users</span>
      </NavLink>
      <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Grid size={20} />
        <span>Categories</span>
      </NavLink>
    </>
  );

  return (
    <div className="sidebar-custom d-flex flex-column h-100">
      <div className="mb-4">
        <p className="small text-uppercase text-muted fw-bold tracking-wider mb-2" style={{ fontSize: '11px' }}>
          Menu Options
        </p>
      </div>
      <nav className="flex-grow-1">
        {user.role === 'patient' && renderPatientLinks()}
        {user.role === 'doctor' && renderDoctorLinks()}
        {user.role === 'admin' && renderAdminLinks()}
      </nav>
      <div className="mt-auto border-top pt-3 text-center">
        <span className="small text-muted">Role: <strong className="text-primary">{user.role.toUpperCase()}</strong></span>
      </div>
    </div>
  );
};

export default Sidebar;
