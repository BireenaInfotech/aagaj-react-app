import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDataPage.css';

const Payments = () => {
  const navigate = useNavigate();
  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };

  return (
    <div className="dashboard-wrapper">
      <nav className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.jpg" alt="Logo" />
          <p className="dp-sb-brand">Aagaj Admin</p>
        </div>
        <ul>
          <li><Link to="/admin-dashboard"><i className="fa-solid fa-gauge-high"></i> Dashboard</Link></li>
          <li><Link to="/ngo-jobs-data"><i className="fa-solid fa-users"></i> NGO Jobs Data</Link></li>
          <li><Link to="/normal-jobs-data"><i className="fa-solid fa-briefcase"></i> Normal Jobs Data</Link></li>
          <li><Link to="/silayi-yojana-data"><i className="fa-solid fa-scissors"></i> Silai Yojana</Link></li>
          <li><Link to="/swarojgaar-data"><i className="fa-solid fa-shop"></i> Swarojgaar</Link></li>
          <li><Link to="/swasthya-suraksha-data"><i className="fa-solid fa-heart-pulse"></i> Swasthya Suraksha</Link></li>
          <li><Link to="/health-card-data"><i className="fa-solid fa-file-medical"></i> Health Cards</Link></li>
          <li><Link to="/appointment-data"><i className="fa-solid fa-calendar"></i> Appointments</Link></li>
          <li><Link to="/payments" className="active"><i className="fa-solid fa-money-bill"></i> Payments</Link></li>
          <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
          <li><a href="#logout" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
      </nav>

      <div className="main-content">
        <div className="dp-page-header">
          <h3 className="dp-page-title">Payments Management</h3>
        </div>
        <div className="table-container">
          <div style={{textAlign:'center',padding:'3rem 1rem'}}>
            <i className="fa-solid fa-construction" style={{fontSize:'3rem',color:'#6c757d',display:'block',marginBottom:'1rem'}}></i>
            <h4 className="dp-muted" style={{marginBottom:'0.5rem'}}>Coming Soon</h4>
            <p className="dp-muted">The Payments Management module is under development.</p>
            <p className="dp-muted dp-small">This section will allow you to manage all payments, billing, and financial transactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
