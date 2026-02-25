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

const SwarojgaarData = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/swarojgaar/all-groups`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const normalizeStatus = (s) => {
    const v = (s || 'Pending').toLowerCase();
    return v === 'paid' ? 'Success' : v === 'failed' ? 'Failed' : 'Pending';
  };

  const filteredData = data.filter(group => {
    const matchesSearch =
      group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.location?.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.location?.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.registeredByName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'All' || normalizeStatus(group.paymentStatus) === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const statusCounts = data.reduce((acc, u) => { acc[normalizeStatus(u.paymentStatus)] += 1; return acc; }, { Success: 0, Pending: 0, Failed: 0 });

  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar activeLink="swarojgaar" onLogout={handleLogout} />
      <div className="main-content">

        <div className="dp-page-header">
          <h3 className="dp-page-title">Swarojgaar Data Management</h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchData}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        <div className="dp-stats-2 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total Applicants</div><div className="dp-stat-num">{filteredData.length}</div></div>
              <i className="fa-solid fa-users dp-stat-icon" style={{color:'#ED1C24'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Successful</div><div className="dp-stat-num">{statusCounts.Success}</div></div>
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

        <div className="table-container">
          <div className="dp-table-header">
            <span className="dp-table-title">Swarojgaar Applicants</span>
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
              <table className="dp-tbl" style={{minWidth:'900px'}}>
                <thead className="dp-thead-dark">
                  <tr><th>#</th><th>Group Name</th><th>Location</th><th>Members</th><th>Reg. Fee</th><th>Registered By</th><th>Payment Status</th></tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="7" className="dp-empty-cell">No Data Found</td></tr>
                  ) : filteredData.map((group, idx) => (
                    <tr key={group._id}>
                      <td className="dp-bold">{idx + 1}</td>
                      <td>
                        <div className="dp-bold dp-small">{group.groupName}</div>
                        <div className="dp-muted dp-small">{new Date(group.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td>
                        <div className="dp-bold dp-small">{group.location?.village || '—'}</div>
                        <div className="dp-muted dp-small">{group.location?.district}</div>
                      </td>
                      <td><span className="dp-badge dp-badge-blue">{group.members?.length || 0} सदस्य</span></td>
                      <td className="dp-bold">₹{group.registrationFee || '—'}</td>
                      <td className="dp-muted dp-small">{group.registeredByName || '—'}</td>
                      <td>
                        <span className={`dp-badge ${normalizeStatus(group.paymentStatus) === 'Success' ? 'dp-badge-green' : normalizeStatus(group.paymentStatus) === 'Failed' ? 'dp-badge-red' : 'dp-badge-yellow'}`}>
                          {group.paymentStatus || 'Pending'}
                        </span>
                      </td>
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

export default SwarojgaarData;
