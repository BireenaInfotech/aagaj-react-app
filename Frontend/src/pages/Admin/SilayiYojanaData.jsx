import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDataPage.css';

const AdminSidebar = ({ activeLink, onLogout }) => (
  <nav className="sidebar">
    <div className="sidebar-header">
      <img src="/logo.jpg" alt="Logo" />
      <p className="dp-sb-brand">Aagaj Admin</p>
    </div>
    <ul>
      <li><Link to="/admin-dashboard" className={activeLink==='dashboard'?'active':''}>
        <i className="fa-solid fa-gauge-high"></i> Dashboard</Link></li>
      <li><Link to="/ngo-jobs-data" className={activeLink==='ngo'?'active':''}>
        <i className="fa-solid fa-users"></i> NGO Jobs Data</Link></li>
      <li><Link to="/normal-jobs-data" className={activeLink==='normal'?'active':''}>
        <i className="fa-solid fa-briefcase"></i> Normal Jobs Data</Link></li>
      <li><Link to="/silayi-yojana-data" className={activeLink==='silayi'?'active':''}>
        <i className="fa-solid fa-scissors"></i> Silai Yojana</Link></li>
      <li><Link to="/swarojgaar-data" className={activeLink==='swarojgaar'?'active':''}>
        <i className="fa-solid fa-shop"></i> Swarojgaar</Link></li>
      <li><Link to="/swasthya-suraksha-data" className={activeLink==='swasthya'?'active':''}>
        <i className="fa-solid fa-heart-pulse"></i> Swasthya Suraksha</Link></li>
      <li><Link to="/health-card-data" className={activeLink==='health'?'active':''}>
        <i className="fa-solid fa-file-medical"></i> Health Cards</Link></li>
      <li><Link to="/appointment-data" className={activeLink==='appointment'?'active':''}>
        <i className="fa-solid fa-calendar"></i> Appointments</Link></li>
      <li><Link to="/payments" className={activeLink==='payments'?'active':''}>
        <i className="fa-solid fa-money-bill"></i> Payments</Link></li>
      <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
      <li><a href="#logout" onClick={onLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
    </ul>
  </nav>
);

const SilayiYojanaData = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/schemes/all-beneficiaries?yojana=Mahila%20Silai%20Prasikshan%20Yojana`);
      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const normalizeStatus = (s) => {
    const v = (s || 'Pending').toLowerCase();
    return v === 'paid' ? 'Success' : v === 'failed' ? 'Failed' : 'Pending';
  };

  const filteredData = data.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.serialNumber?.toString().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'All' || normalizeStatus(user.paymentStatus) === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const statusCounts = data.reduce((acc, u) => { acc[normalizeStatus(u.paymentStatus)] += 1; return acc; }, { Success: 0, Pending: 0, Failed: 0 });

  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar activeLink="silayi" onLogout={handleLogout} />
      <div className="main-content">

        <div className="dp-page-header">
          <h3 className="dp-page-title">Silayi Yojana Management</h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchData}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="dp-stats-2 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total Beneficiaries</div><div className="dp-stat-num">{filteredData.length}</div></div>
              <i className="fa-solid fa-users dp-stat-icon" style={{color:'#ED1C24'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Success</div><div className="dp-stat-num">{statusCounts.Success}</div></div>
              <i className="fa-solid fa-circle-check dp-stat-icon" style={{color:'#0d6efd'}}></i>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Pending</div><div className="dp-stat-num">{statusCounts.Pending}</div></div>
              <i className="fa-solid fa-clock dp-stat-icon" style={{color:'#ffc107'}}></i>
            </div>
          </div>
          <div className="stat-card gray">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Failed</div><div className="dp-stat-num">{statusCounts.Failed}</div></div>
              <i className="fa-solid fa-circle-xmark dp-stat-icon" style={{color:'#6c757d'}}></i>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="dp-table-header">
            <span className="dp-table-title">Silayi Yojana Beneficiaries</span>
            <div className="dp-filters">
              <select className="dp-select" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <input type="text" className="dp-input" placeholder="Search Name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="dp-spinner"><div className="dp-spinner-circle"></div></div>
          ) : (
            <div className="dp-tbl-scroll">
              <table className="dp-tbl" style={{minWidth:'800px'}}>
                <thead className="dp-thead-dark">
                  <tr><th>Serial No</th><th>Name</th><th>Mobile / Email</th><th>Training</th><th>Payment Status</th><th>Registered By</th></tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="6" className="dp-empty-cell">No Data Found</td></tr>
                  ) : filteredData.map(user => (
                    <tr key={user._id}>
                      <td className="dp-bold">{user.serialNumber}</td>
                      <td>
                        <div className="dp-bold dp-small">{user.name}</div>
                        <div className="dp-muted dp-small">{user.guardianName}</div>
                      </td>
                      <td>
                        <div className="dp-bold dp-small">{user.mobileNumber}</div>
                        <div className="dp-muted dp-small">{user.email}</div>
                      </td>
                      <td><span className="dp-badge dp-badge-blue">{user.trainingName || 'N/A'}</span></td>
                      <td>
                        <span className={`dp-badge ${user.paymentStatus === 'Paid' ? 'dp-badge-green' : 'dp-badge-yellow'}`}>
                          {user.paymentStatus}
                        </span>
                      </td>
                      <td>{user.registeredByName || user.registeredBy}</td>
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

export default SilayiYojanaData;
