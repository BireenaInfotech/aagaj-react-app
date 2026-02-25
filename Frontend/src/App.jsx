import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import About from './pages/about/About'
import Gallery from './pages/gallery/Gallery'
import Contact from './pages/contact/Contact'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import NGOJobsData from './pages/Admin/NGOJobsData'
import NormalJobsData from './pages/Admin/NormalJobsData'
import SilayiYojanaData from './pages/Admin/SilayiYojanaData'
import SwarojgaarData from './pages/Admin/SwarojgaarData'
import SwasthyaSurakshaData from './pages/Admin/SwasthyaSurakshaData'
import HealthCardData from './pages/Admin/HealthCardData'
import AppointmentData from './pages/Admin/AppointmentData'
import Payments from './pages/Admin/Payments'
import EmployeeLogin from './pages/Employee/EmployeeLogin'

import Donate from './pages/Donate/Donate'
import PaymentResponse from './pages/PaymentResponse/PaymentResponse'

import NGOJobs from './pages/Career/NGOJobs'
import GeneralJobs from './pages/Career/GeneralJobs'
import ApplicationForm from './pages/Career/ApplicationForm'
import Appointment from './pages/HealthServices/Appointment'
import SilayiyojnaDescription from './pages/Schemes/SilayiyojnaDescription'
import SwarojgaarDescription from './pages/Schemes/SwarojgaarDescription'
import SwasthyaSurakshaRegister from './pages/Schemes/SwasthyaSurakshaRegister'
import SilayiRegistration from './pages/Schemes/SilayiRegistration'
import SwarojgaarRegistration from './pages/Schemes/SwarojgaarRegistration'
import HealthCard from './pages/HealthServices/HealthCard'
import ViewHealthCard from './pages/HealthServices/ViewHealthCard'
import ProtectedRoute from './components/ProtectedRoute'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'
import TermsAndConditions from './pages/Legal/TermsAndConditions'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ngo-jobs-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <NGOJobsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/normal-jobs-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <NormalJobsData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/silayi-yojana-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <SilayiYojanaData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/swarojgaar-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <SwarojgaarData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/swasthya-suraksha-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <SwasthyaSurakshaData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/health-card-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <HealthCardData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointment-data" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AppointmentData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <Payments />
            </ProtectedRoute>
          } 
        />
        <Route path="/employee-login" element={<EmployeeLogin />} />
       
        <Route path="/donate" element={<Donate />} />
        <Route path="/pgresponse" element={<PaymentResponse />} />
        <Route path="/payment-response" element={<PaymentResponse />} />
        
        <Route path="/ngo-jobs" element={<NGOJobs />} />
        <Route path="/general-jobs" element={<GeneralJobs />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/silayiyojna-description" element={<SilayiyojnaDescription />} />
        <Route path="/swarojgaar-description" element={<SwarojgaarDescription />} />
        <Route path="/swasthya-suraksha-register" element={<SwasthyaSurakshaRegister />} />
        <Route 
          path="/silayi-register" 
          element={
            <ProtectedRoute requiredRole="employee">
              <SilayiRegistration />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/swarojgaar-register" 
          element={
            <ProtectedRoute requiredRole="employee">
              <SwarojgaarRegistration />
            </ProtectedRoute>
          } 
        />
        <Route path="/healthcard" element={<HealthCard />} />
        <Route path="/view-health-card/:healthCardId" element={<ViewHealthCard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  )
}

export default App
