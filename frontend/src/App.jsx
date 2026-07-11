import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Public Pages
import Home from './pages/Public/Home';
import Doctors from './pages/Public/Doctors';
import DoctorProfile from './pages/Public/DoctorProfile';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';
import About from './pages/Public/About';

// Import Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard';
import PatientAppointments from './pages/Patient/MyAppointments';
import PatientRecords from './pages/Patient/MedicalRecords';
import PatientPrescriptions from './pages/Patient/Prescriptions';
import PatientFollowUps from './pages/Patient/FollowUps';
import FindDoctors from './pages/Patient/FindDoctors';
import ProfileSettings from './pages/Shared/ProfileSettings';
import ConsultationRoom from './pages/Shared/ConsultationRoom';

// Import Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorPatients from './pages/Doctor/PatientsList';
import DoctorAvailability from './pages/Doctor/Availability';

// Import Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminVerifyDoctors from './pages/Admin/VerifyDoctors';
import AdminManageUsers from './pages/Admin/ManageUsers';
import AdminCategories from './pages/Admin/Categories';

// Layout wrapper for Public Pages (displays navbar and footer)
const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-height-vh-100" style={{ minHeight: '100vh' }}>
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout wrapper for Dashboards (displays navbar, sidebar, and layout panel)
const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          {/* Sidebar Left Column */}
          <aside className="col-lg-2 col-md-3 p-0 d-none d-md-block border-end bg-white">
            <Sidebar />
          </aside>

          {/* Main Dashboard Panel Right Column */}
          <main className="col-lg-10 col-md-9 p-4 bg-light" style={{ minHeight: 'calc(100vh - 73px)' }}>
            <div className="container-fluid px-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Patient Dashboard Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="find-doctors" element={<FindDoctors />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="followups" element={<PatientFollowUps />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="consultation/:id" element={<ConsultationRoom />} />
      </Route>
 
      {/* Doctor Dashboard Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} /> {/* Shared read component */}
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="consultation/:id" element={<ConsultationRoom />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verify" element={<AdminVerifyDoctors />} />
        <Route path="users" element={<AdminManageUsers />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
