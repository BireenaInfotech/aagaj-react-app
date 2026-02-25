import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDataPage.css';

const AppointmentData = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAppointments(); }, []);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/appointment/all`);
      const result = await res.json();
      setAppointments(result.data || result || []);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':   return 'dp-badge dp-badge-yellow';
      case 'Confirmed': return 'dp-badge dp-badge-green';
      case 'Completed': return 'dp-badge dp-badge-blue';
      case 'Cancelled': return 'dp-badge dp-badge-red';
      default:          return 'dp-badge dp-badge-gray';
    }
  };

  const filteredData = appointments.filter(apt => {
    const matchesSearch =
      apt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.aadhar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.healthId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && apt.appointmentStatus?.toLowerCase() === statusFilter;
  });

  const formatAadhar = (aadhar) => aadhar ? aadhar.replace(/(\d{4})(?=\d)/g, '$1 ') : 'N/A';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '';
  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };

  const pills = [
    { key: 'all',       label: 'All',       active: 'dp-fb-active-dark' },
    { key: 'pending',   label: 'Pending',   active: 'dp-fb-active-warning' },
    { key: 'confirmed', label: 'Confirmed', active: 'dp-fb-active-success' },
    { key: 'completed', label: 'Completed', active: 'dp-fb-active-info' },
    { key: 'cancelled', label: 'Cancelled', active: 'dp-fb-active-danger' },
  ];

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
          <li><Link to="/appointment-data" className="active"><i className="fa-solid fa-calendar"></i> Appointments</Link></li>
          <li><Link to="/payments"><i className="fa-solid fa-money-bill"></i> Payments</Link></li>
          <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
          <li><a href="#logout" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
      </nav>

      <div className="main-content">
        <div className="dp-page-header">
          <h3 className="dp-page-title">
            <i className="fa-solid fa-calendar-check" style={{color:'#ffc107'}}></i> Appointments Management
          </h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchAppointments}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="dp-stats-2 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total Appointments</div><div className="dp-stat-num">{filteredData.length}</div></div>
              <i className="fa-solid fa-calendar dp-stat-icon" style={{color:'#ED1C24'}}></i>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Pending</div><div className="dp-stat-num">{filteredData.filter(a=>a.appointmentStatus==='Pending').length}</div></div>
              <i className="fa-solid fa-hourglass-end dp-stat-icon" style={{color:'#ffc107'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Confirmed</div><div className="dp-stat-num">{filteredData.filter(a=>a.appointmentStatus==='Confirmed').length}</div></div>
              <i className="fa-solid fa-check-circle dp-stat-icon" style={{color:'#198754'}}></i>
            </div>
          </div>
          <div className="stat-card gray">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Completed</div><div className="dp-stat-num">{filteredData.filter(a=>a.appointmentStatus==='Completed').length}</div></div>
              <i className="fa-solid fa-circle-check dp-stat-icon" style={{color:'#0dcaf0'}}></i>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="dp-table-header" style={{flexWrap:'wrap',gap:'0.5rem'}}>
          <div className="dp-filter-btns">
            {pills.map(p => (
              <button key={p.key} className={`dp-filter-btn ${statusFilter===p.key ? p.active : ''}`}
                onClick={() => setStatusFilter(p.key)}>{p.label}</button>
            ))}
          </div>
          <input type="text" className="dp-input" placeholder="Search name, Aadhar, phone, Health ID..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="dp-spinner"><div className="dp-spinner-circle"></div></div>
          ) : (
            <div className="dp-tbl-scroll">
              <table className="dp-tbl" style={{minWidth:'900px'}}>
                <thead className="dp-thead-dark">
                  <tr>
                    <th>Date</th><th>Patient Name</th><th>Aadhar</th><th>Contact</th>
                    <th>Health ID</th><th>Facility</th><th>Type</th><th>Department</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="9" className="dp-empty-cell">No Appointments Found</td></tr>
                  ) : filteredData.map(apt => (
                    <tr key={apt._id}>
                      <td className="dp-bold">{formatDate(apt.date)}</td>
                      <td className="dp-bold">{apt.name}</td>
                      <td>{formatAadhar(apt.aadhar)}</td>
                      <td><div className="dp-bold dp-small">{apt.phone}</div></td>
                      <td>{apt.healthId || '-'}</td>
                      <td>{apt.doctor || '-'}</td>
                      <td><span className="dp-badge dp-badge-blue">{apt.providerType || 'Hospital'}</span></td>
                      <td>{apt.department || '-'}</td>
                      <td><span className={getStatusBadge(apt.appointmentStatus)}>{apt.appointmentStatus || 'Pending'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentData;
