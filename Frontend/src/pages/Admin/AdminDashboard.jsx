import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [allData, setAllData] = useState([]);
  const [schemeBeneficiaries, setSchemeBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilteredData, setCurrentFilteredData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const itemsPerPage = 20;

  const [stats, setStats] = useState({
    totalCount: 0, ngoCount: 0, idCount: 0,
    silaiCount: 0, swarojgaarCount: 0, swasthyaCount: 0,
    healthCardCount: 0, appointmentCount: 0
  });

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCredModal, setShowCredModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', mobile: '',
    role: 'Panchayat Coordinator', district: '', state: '', password: ''
  });
  const [successMsg, setSuccessMsg] = useState(null);
  const [credData, setCredData] = useState({ user: '', pass: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser !== 'Admin') navigate('/admin-login');
  }, [navigate]);

  useEffect(() => {
    fetchData(); fetchSchemeData(); fetchHealthCardData(); fetchAppointmentData();
  }, []);

  useEffect(() => {
    let filtered = allData;
    if (roleFilter === 'NGO') filtered = allData.filter(u => u.job_category === 'NGO');
    else if (roleFilter === 'Normal') filtered = allData.filter(u => u.job_category === 'general');
    else if (roleFilter === 'Employee') filtered = allData.filter(u => u.job_category === 'Employee');
    else if (roleFilter !== 'All') filtered = allData.filter(u => u.roleApplied === roleFilter);
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.uniqueId.includes(searchTerm)
      );
    }
    setCurrentFilteredData(filtered);
    setCurrentPage(1);
  }, [allData, roleFilter, searchTerm]);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/get-all-applicants`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      setAllData(list);
      updateStats(list);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const fetchSchemeData = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/get-all-beneficiaries`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      if (list.length >= 0) {
        setSchemeBeneficiaries(list);
        setStats(prev => ({
          ...prev,
          silaiCount: list.filter(d => d.yojanaName === 'Mahila Silai Prasikshan Yojana').length,
          swarojgaarCount: list.filter(d => d.yojanaName === 'Mahila Swarojgaar Yojana').length,
          swasthyaCount: list.filter(d => d.yojanaName === 'Swasthya Suraksha Yojana').length
        }));
      }
    } catch (err) { console.error('Scheme Fetch Error:', err); }
  };

  const fetchHealthCardData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/healthcard/?limit=1`);
      const data = await res.json();
      if (data.success) setStats(prev => ({ ...prev, healthCardCount: data.pagination?.total ?? data.data?.length ?? 0 }));
    } catch (err) { console.error('Health Card Fetch Error:', err); }
  };

  const fetchAppointmentData = async () => {
    try {
      const res = await fetch(`${apiUrl}/appointment/all`);
      const data = await res.json();
      if (data.success) setStats(prev => ({ ...prev, appointmentCount: data.data.length }));
    } catch (err) { console.error('Appointment Fetch Error:', err); }
  };

  const updateStats = (data) => {
    setStats(prev => ({
      ...prev,
      totalCount: data.length,
      ngoCount: data.filter(u => u.job_category === 'NGO').length,
      idCount: data.filter(u => u.emp_username).length
    }));
  };

  const showPerformanceReport = async () => {
    setShowPerformance(true);
    try {
      const res = await fetch(`${apiUrl}/admin/employee-stats`);
      if (!res.ok) {
        console.error('Stat fetch failed', res.status, res.statusText);
        setPerformanceData([]);
        return;
      }
      const data = await res.json();
      // guard against server returning an object
      setPerformanceData(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Performance Fetch Error:', e); setPerformanceData([]); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/admin/create-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg({ user: data.username, pass: data.password });
        setFormData({ fullName: '', email: '', mobile: '', role: 'Panchayat Coordinator', district: '', state: '', password: '' });
        fetchData();
      } else { alert('Error: ' + data.message); }
    } catch (e) { alert('Server Error'); }
  };

  const deleteEmployee = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/delete-employee/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { alert('Deleted!'); fetchData(); }
    } catch (e) { console.error(e); }
  };

  const openCardModal = (user) => {
    setCardData(user); setSelectedUser(user._id); setShowCardModal(true);
  };

  const downloadAdminCard = async () => {
    const card = document.getElementById('adminIdCard');
    if (card) {
      const canvas = await html2canvas(card, { scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = 'Employee_Card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const viewCredentials = (u, p) => { setCredData({ user: u, pass: p }); setShowCredModal(true); };

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminData');
    navigate('/admin-login');
  };

  const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentFilteredData.slice(start, start + itemsPerPage);

  return (
    <>
      <div className="ad-wrapper">

        {/* Sidebar overlay */}
        <div className={`ad-overlay-sidebar ${sidebarActive ? 'active' : ''}`}
          onClick={() => setSidebarActive(false)}></div>

        {/* Sidebar */}
        <nav className={`ad-sidebar ${sidebarActive ? 'active' : ''}`}>
          <div className="ad-sidebar-head">
            <img src="/logo.jpg" alt="Logo" className="ad-sidebar-logo" />
            <p className="ad-sidebar-brand">Aagaj Admin</p>
          </div>
          <ul className="ad-sidebar-nav">
            <li><Link to="/admin-dashboard" className="ad-nav-link active" onClick={() => setSidebarActive(false)}>
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </Link></li>
            <li><Link to="/ngo-jobs-data" className="ad-nav-link" onClick={() => setSidebarActive(false)}>
              <i className="fa-solid fa-users"></i> NGO Jobs Data
            </Link></li>
            <li><Link to="/normal-jobs-data" className="ad-nav-link" onClick={() => setSidebarActive(false)}>
              <i className="fa-solid fa-briefcase"></i> Normal Jobs Data
            </Link></li>
            <li><Link to="/payments" className="ad-nav-link" onClick={() => setSidebarActive(false)}>
              <i className="fa-solid fa-money-bill"></i> Payments
            </Link></li>
            <li className="ad-nav-divider"><Link to="/" className="ad-nav-link" onClick={() => setSidebarActive(false)}>
              <i className="fa-solid fa-house"></i> Back to Website
            </Link></li>
            <li><a href="#logout" className="ad-nav-link" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </a></li>
          </ul>
        </nav>

        {/* Main */}
        <div className="ad-main">

          {/* Top header */}
          <div className="ad-header">
            <div className="ad-header-left">
              <button className="ad-toggle-btn" onClick={() => setSidebarActive(!sidebarActive)}>
                <i className="fa-solid fa-bars"></i>
              </button>
              <h3 className="ad-page-title">Employee Management</h3>
            </div>
            <div className="ad-header-actions">
              <button className="ad-btn ad-btn-gray" onClick={fetchData}>
                <i className="fa-solid fa-rotate"></i> Refresh
              </button>
              <button className="ad-btn ad-btn-red" onClick={() => setShowAddEmployeeModal(true)}>
                <i className="fa-solid fa-key"></i> Create Password
              </button>
              <button className="ad-btn ad-btn-blue" onClick={showPerformanceReport}>
                <i className="fa-solid fa-chart-line"></i> Report
              </button>
            </div>
          </div>

          {/* Stats Row 1 */}
          <div className="ad-stats-grid ad-mb">
            <div className="ad-stat-card" style={{ borderBottomColor: '#ED1C24' }}>
              <div className="ad-stat-inner">
                <div>
                  <div className="ad-stat-label">Total Applicants</div>
                  <div className="ad-stat-num">{stats.totalCount}</div>
                </div>
                <i className="fa-solid fa-users ad-stat-icon" style={{ color: '#ED1C24' }}></i>
              </div>
            </div>
            <div className="ad-stat-card" style={{ borderBottomColor: '#fdd831' }}>
              <div className="ad-stat-inner">
                <div>
                  <div className="ad-stat-label">NGO Jobs</div>
                  <div className="ad-stat-num">{stats.ngoCount}</div>
                </div>
                <i className="fa-solid fa-handshake ad-stat-icon" style={{ color: '#fdd831' }}></i>
              </div>
            </div>
            <div className="ad-stat-card" style={{ borderBottomColor: '#0d6efd' }}>
              <div className="ad-stat-inner">
                <div>
                  <div className="ad-stat-label">Generated IDs</div>
                  <div className="ad-stat-num">{stats.idCount}</div>
                </div>
                <i className="fa-solid fa-id-card ad-stat-icon" style={{ color: '#0d6efd' }}></i>
              </div>
            </div>
          </div>

          {/* Stats Row 2 - Schemes */}
          <div className="ad-stats-grid ad-mb">
            <Link to="/silayi-yojana-data" className="ad-stat-link">
              <div className="ad-stat-card" style={{ borderBottomColor: '#e83e8c' }}>
                <div className="ad-stat-inner">
                  <div>
                    <div className="ad-stat-label">Mahila Silai Yojana</div>
                    <div className="ad-stat-num">{stats.silaiCount}</div>
                    <div className="ad-stat-hint">Click to View List</div>
                  </div>
                  <i className="fa-solid fa-scissors ad-stat-icon" style={{ color: '#e83e8c' }}></i>
                </div>
              </div>
            </Link>
            <Link to="/swarojgaar-data" className="ad-stat-link">
              <div className="ad-stat-card" style={{ borderBottomColor: '#20c997' }}>
                <div className="ad-stat-inner">
                  <div>
                    <div className="ad-stat-label">Mahila Swarojgaar</div>
                    <div className="ad-stat-num">{stats.swarojgaarCount}</div>
                    <div className="ad-stat-hint">Click to View List</div>
                  </div>
                  <i className="fa-solid fa-shop ad-stat-icon" style={{ color: '#20c997' }}></i>
                </div>
              </div>
            </Link>
            <Link to="/swasthya-suraksha-data" className="ad-stat-link">
              <div className="ad-stat-card" style={{ borderBottomColor: '#6610f2' }}>
                <div className="ad-stat-inner">
                  <div>
                    <div className="ad-stat-label">Swasthya Suraksha</div>
                    <div className="ad-stat-num">{stats.swasthyaCount}</div>
                    <div className="ad-stat-hint">Click to View List</div>
                  </div>
                  <i className="fa-solid fa-heart-pulse ad-stat-icon" style={{ color: '#6610f2' }}></i>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Row 3 - Health & Appointment */}
          <div className="ad-stats-grid-2 ad-mb">
            <Link to="/health-card-data" className="ad-stat-link">
              <div className="ad-stat-card" style={{ borderBottomColor: '#00bfa5' }}>
                <div className="ad-stat-inner">
                  <div>
                    <div className="ad-stat-label">Health Cards Issued</div>
                    <div className="ad-stat-num">{stats.healthCardCount}</div>
                    <div className="ad-stat-hint">Click to View List</div>
                  </div>
                  <i className="fa-solid fa-file-medical ad-stat-icon" style={{ color: '#00bfa5' }}></i>
                </div>
              </div>
            </Link>
            <Link to="/appointment-data" className="ad-stat-link">
              <div className="ad-stat-card" style={{ borderBottomColor: '#ffc107' }}>
                <div className="ad-stat-inner">
                  <div>
                    <div className="ad-stat-label">Appointments Booked</div>
                    <div className="ad-stat-num">{stats.appointmentCount}</div>
                    <div className="ad-stat-hint">Click to View List</div>
                  </div>
                  <i className="fa-solid fa-calendar-check ad-stat-icon" style={{ color: '#ffc107' }}></i>
                </div>
              </div>
            </Link>
          </div>

          {/* Performance Report */}
          {showPerformance && (
            <div className="ad-table-box ad-mb" style={{ borderLeft: '5px solid #0d6efd' }}>
              <div className="ad-perf-header">
                <span className="ad-perf-title">Performance Report</span>
                <button className="ad-btn ad-btn-outline" onClick={() => setShowPerformance(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="ad-table-scroll">
                <table className="ad-tbl">
                  <thead className="ad-thead-blue">
                    <tr>
                      <th>Rank</th><th>Email</th><th>Silayi</th>
                      <th>Swa.</th><th>Health</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((emp, index) => (
                      <tr key={index}>
                        <td>#{index + 1}</td>
                        <td>{emp.email}</td>
                        <td>{emp.silayi || 0}</td>
                        <td>{emp.swarojgaar || 0}</td>
                        <td>{emp.health || 0}</td>
                        <td className="ad-total-cell">{emp.total || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applicants Table */}
          <div className="ad-table-box">
            <div className="ad-tc-row">
              <h5 className="ad-tc-title">Applicant List</h5>
              <div className="ad-tc-filters">
                <select className="ad-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="All">All Roles</option>
                  <option value="NGO">Only NGO Jobs</option>
                  <option value="Normal">Only Normal Jobs</option>
                  <option value="Employee">Registered Employees</option>
                  <option value="Panchayat Coordinator">Panchayat Coordinator</option>
                  <option value="Block Coordinator">Block Coordinator</option>
                  <option value="District Coordinator">District Coordinator</option>
                  <option value="Health Supervisor">Health Supervisor</option>
                  <option value="Mahila Mitra">Mahila Mitra</option>
                  <option value="Skill Trainer">Skill Trainer</option>
                  <option value="Trainer">Trainer</option>
                </select>
                <input type="text" className="ad-search" placeholder="Search Name or ID..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="ad-table-scroll">
              <table className="ad-tbl" style={{ minWidth: '800px' }}>
                <thead className="ad-thead-dark">
                  <tr>
                    <th>Photo</th>
                    <th>Pravesh ID</th>
                    <th>Name / Email</th>
                    <th>Role Applied</th>
                    <th>Credentials</th>
                    <th style={{ textAlign: 'center' }}>Form PDF</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="ad-empty-cell">Loading Data...</td></tr>
                  ) : paginatedData.length === 0 ? (
                    <tr><td colSpan="7" className="ad-empty-cell">No Data Found</td></tr>
                  ) : (
                    paginatedData.map(user => {
                      const photo = user.photoPath
                        ? (user.photoPath.startsWith('http') ? user.photoPath : `${apiUrl}${user.photoPath}`)
                        : 'https://via.placeholder.com/40';
                      const pdfBtn = user.applicationPdf
                        ? <a href={`${apiUrl}${user.applicationPdf}`} target="_blank" rel="noreferrer" className="ad-icon-btn ad-icon-btn-red">
                            <i className="fa-solid fa-file-pdf"></i> View
                          </a>
                        : <span className="ad-badge ad-badge-gray">No PDF</span>;
                      const credBtn = user.emp_password
                        ? <button className="ad-icon-btn ad-icon-btn-green" onClick={() => viewCredentials(user.emp_username, user.emp_password_plain || 'Protected')}>Pass</button>
                        : <span className="ad-badge ad-badge-yellow">No Pass</span>;

                      return (
                        <tr key={user._id}>
                          <td><img src={photo} className="ad-thumb" alt="User" /></td>
                          <td className="ad-uid">AF-{user.uniqueId}</td>
                          <td>
                            <div className="ad-name">{user.fullName}</div>
                            <div className="ad-email">{user.email}</div>
                          </td>
                          <td><span className="ad-badge ad-badge-info">{user.roleApplied || 'N/A'}</span></td>
                          <td>{credBtn}</td>
                          <td style={{ textAlign: 'center' }}>{pdfBtn}</td>
                          <td>
                            <div className="ad-row-actions">
                              <button className="ad-icon-btn ad-icon-btn-blue" onClick={() => openCardModal(user)}>
                                <i className="fa-solid fa-id-card"></i>
                              </button>
                              <button className="ad-icon-btn ad-icon-btn-dark" onClick={() => deleteEmployee(user._id)}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="ad-pagination">
              <button className="ad-pg-btn" onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map(page => (
                  <button key={page} className={`ad-pg-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
              <button className="ad-pg-btn" onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {showAddEmployeeModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAddEmployeeModal(false)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header ad-mh-red">
              <span className="ad-modal-title">Create Employee Password</span>
              <button className="ad-modal-close" onClick={() => setShowAddEmployeeModal(false)}>&#x2715;</button>
            </div>
            <div className="ad-modal-body">
              <form onSubmit={handleAddEmployee}>
                <div className="ad-form-group">
                  <label className="ad-label">Full Name</label>
                  <input type="text" className="ad-input" value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                </div>
                <div className="ad-form-2col">
                  <div className="ad-form-group">
                    <label className="ad-label">Mobile</label>
                    <input type="text" className="ad-input" value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})} required />
                  </div>
                  <div className="ad-form-group">
                    <label className="ad-label">Email (User ID)</label>
                    <input type="email" className="ad-input" value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>
                <div className="ad-form-group">
                  <label className="ad-label ad-label-red">Create Login Password</label>
                  <input type="text" className="ad-input ad-input-danger" value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
                <div className="ad-form-group">
                  <label className="ad-label">Designation</label>
                  <select className="ad-select-field" value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Panchayat Coordinator">Panchayat Coordinator</option>
                    <option value="Block Coordinator">Block Coordinator</option>
                    <option value="District Coordinator">District Coordinator</option>
                    <option value="Health Supervisor">Health Supervisor</option>
                    <option value="Mahila Mitra">Mahila Mitra</option>
                    <option value="Skill Trainer">Skill Trainer</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                </div>
                <div className="ad-form-2col">
                  <div className="ad-form-group">
                    <label className="ad-label">District</label>
                    <input type="text" className="ad-input" value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})} />
                  </div>
                  <div className="ad-form-group">
                    <label className="ad-label">State</label>
                    <input type="text" className="ad-input" value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="ad-submit-btn">Update Password</button>
              </form>
              {successMsg && (
                <div className="ad-cred-box">
                  <p className="ad-cred-row">User ID: <strong className="ad-cred-val">{successMsg.user}</strong></p>
                  <p className="ad-cred-row">Pass: <strong className="ad-cred-val">{successMsg.pass}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: ID Card Preview */}
      {showCardModal && cardData && (
        <div className="ad-modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header ad-mh-default">
              <span className="ad-modal-title">ID Card Preview</span>
              <button className="ad-modal-close ad-modal-close-dark" onClick={() => setShowCardModal(false)}>&#x2715;</button>
            </div>
            <div className="ad-modal-body ad-modal-body-gray" style={{ padding: 0 }}>
              <div className="id-card-wrapper">
                <div className="id-card-container" id="adminIdCard">
                  <div className="unique-id">ID: AF-{cardData.uniqueId}</div>
                  <div className="card-header-custom">
                    <h3>Aagaj Foundation</h3>
                    <p>Registered Under Indian Trust Act 1882</p>
                  </div>
                  <div className="photo-section">
                    <img src={cardData.photoPath ? (cardData.photoPath.startsWith('http') ? cardData.photoPath : `${apiUrl}${cardData.photoPath}`) : 'https://via.placeholder.com/100'}
                      className="photo-frame" alt="User" crossOrigin="anonymous" />
                  </div>
                  <div className="card-body-custom">
                    <div className="card-name">{cardData.fullName}</div>
                    <div className="card-designation">{cardData.roleApplied || 'NGO Employee'}</div>
                    <div className="details-box">
                      <div><strong>Post:</strong> <span>{cardData.roleApplied || 'N/A'}</span></div>
                      <div><strong>DOB:</strong> <span>{cardData.dob || '--/--/----'}</span></div>
                      <div><strong>Mobile:</strong> <span>{cardData.mobile || '---'}</span></div>
                      <div><strong>Email:</strong> <span>{cardData.email.length > 18 ? cardData.email.substring(0, 16) + '...' : cardData.email}</span></div>
                      <div><strong>Dist:</strong> <span>{cardData.district || '---'}</span></div>
                      <div><strong>State:</strong> <span>{cardData.state || '---'}</span></div>
                    </div>
                  </div>
                  <div className="card-footer-custom">
                    www.aagajfoundation.com | Helpline: 9431430464
                  </div>
                </div>
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-btn ad-btn-gray" onClick={() => setShowCardModal(false)}>Close</button>
              <button className="ad-btn ad-btn-red" onClick={downloadAdminCard}>Download Card</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Credentials */}
      {showCredModal && (
        <div className="ad-modal-overlay" onClick={() => setShowCredModal(false)}>
          <div className="ad-modal ad-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header ad-mh-green">
              <span className="ad-modal-title">Login Details</span>
              <button className="ad-modal-close" onClick={() => setShowCredModal(false)}>&#x2715;</button>
            </div>
            <div className="ad-modal-body" style={{ textAlign: 'center' }}>
              <p className="ad-cred-label">User ID (Email):</p>
              <p className="ad-cred-highlight">{credData.user}</p>
              <hr />
              <p className="ad-cred-label">Password:</p>
              <p className="ad-cred-highlight ad-cred-big">{credData.pass}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
