import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import './AdminDataPage.css';

const AdminDataPage = ({ title, apiEndpoint, filterField, filterValue, jobCategory = null }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCredModal, setShowCredModal] = useState(false);
  const [credData, setCredData] = useState({ user: '', pass: '' });
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [selectedApplicantName, setSelectedApplicantName] = useState('');
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const rawData = await res.json();
      let dataToUse = Array.isArray(rawData) ? rawData : rawData.data || [];
      if (!Array.isArray(dataToUse)) { alert('Error: Invalid data format received from server'); setLoading(false); return; }
      let filtered = dataToUse;
      if (jobCategory) filtered = dataToUse.filter(item => item.job_category === jobCategory);
      else if (filterField && filterValue) filtered = dataToUse.filter(item => item[filterField] === filterValue);
      setData(filtered);
      setLoading(false);
    } catch (err) { alert('Error loading data: ' + err.message); setLoading(false); }
  };

  const handleAutoGenerateCredentials = async (applicantId, fullName, paymentStatus) => {
    if (paymentStatus !== 'Success') { alert(`Cannot generate credentials!\n\nPayment Status: ${paymentStatus || 'Pending'}\n\nOnly successful payments can generate credentials.`); return; }
    try {
      const res = await fetch(`${apiUrl}/admin/generate-credentials/${applicantId}`, { method: 'POST' });
      const result = await res.json();
      if (result.success && result.credentials) {
        setCredData({ user: result.credentials.username, pass: result.credentials.password });
        setShowCredModal(true);
        setData(prev => prev.map(u => u._id === applicantId ? { ...u, emp_username: result.credentials.username, emp_password: '***' } : u));
        setTimeout(() => { setShowCredModal(false); setTimeout(() => fetchData(), 500); }, 3000);
      } else { alert('Credentials generated successfully' + (result.message || '')); }
    } catch (err) { alert('Server error: ' + err.message); }
  };

  const filteredData = data.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uniqueId?.toString().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentStatusFilter === 'All' || user.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesPayment;
  });

  const handleOpenCard = (user) => { setSelectedUser(user); setShowCardModal(true); };
  const handleViewCreds = (username, password) => { setCredData({ user: username, pass: password }); setShowCredModal(true); };
  const handleGenerateClick = (id, name) => { setSelectedApplicantId(id); setSelectedApplicantName(name); setPasswordForm({ password:'', confirmPassword:'' }); setPasswordError(''); setShowSetPasswordModal(true); };
  const handlePasswordChange = (e) => { const { name, value } = e.target; setPasswordForm(prev => ({ ...prev, [name]: value })); setPasswordError(''); };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.password || !passwordForm.confirmPassword) { setPasswordError('Both password fields are required!'); return; }
    if (passwordForm.password.length < 6) { setPasswordError('Password must be at least 6 characters!'); return; }
    if (passwordForm.password !== passwordForm.confirmPassword) { setPasswordError('Passwords do not match!'); return; }
    try {
      const res = await fetch(`${apiUrl}/admin/set-password/${selectedApplicantId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: passwordForm.password }) });
      const result = await res.json();
      if (result.success && result.credentials) {
        setCredData({ user: result.credentials.username, pass: result.credentials.password });
        setShowSetPasswordModal(false);
        setShowCredModal(true);
        alert(`PASSWORD SET SUCCESSFULLY!\n\nUsername: ${result.credentials.username}\nPassword: ${result.credentials.password}\n\nPlease share these credentials with the employee!`);
        setTimeout(() => fetchData(), 1000);
      } else { setPasswordError('Error: ' + (result.message || 'Failed to set password')); }
    } catch (err) { setPasswordError('Error setting password: ' + err.message); }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to DELETE this applicant? This action cannot be undone!')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/delete-employee/${id}`, { method:'DELETE', headers:{'Content-Type':'application/json'} });
      const result = await res.json();
      if (result.success || res.ok) { alert('Applicant deleted successfully!'); fetchData(); }
      else alert('Error: ' + (result.message || 'Failed to delete'));
    } catch (err) { alert('Error deleting applicant: ' + err.message); }
  };

  const downloadCard = async () => {
    const cardElement = document.getElementById('adminIdCard');
    if (!cardElement) { alert('Card element not found!'); return; }
    try {
      const canvas = await html2canvas(cardElement, { scale:3, useCORS:true });
      const link = document.createElement('a');
      link.download = `AF-${selectedUser?.uniqueId}_${selectedUser?.fullName || 'Employee'}_Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      alert('ID Card downloaded successfully!');
    } catch (err) { alert('Error downloading card: ' + err.message); }
  };

  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };

  const pwMatch = passwordForm.password === passwordForm.confirmPassword;

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
          <li><Link to="/payments"><i className="fa-solid fa-money-bill"></i> Payments</Link></li>
          <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
          <li><a href="#logout" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
      </nav>

      <div className="main-content">
        <div className="dp-page-header">
          <h3 className="dp-page-title">{title}</h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchData}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        <div className="dp-stats-2 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total Applicants</div><div className="dp-stat-num">{data.length}</div></div>
              <i className="fa-solid fa-users dp-stat-icon" style={{color:'#ED1C24'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Generated IDs</div><div className="dp-stat-num">{data.filter(u=>u.emp_password).length}</div></div>
              <i className="fa-solid fa-id-card dp-stat-icon" style={{color:'#0d6efd'}}></i>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="dp-table-header">
            <span className="dp-table-title">{title}</span>
            <div className="dp-filters">
              <input type="text" className="dp-input" placeholder="Search Name or ID..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
              <select className="dp-select" value={paymentStatusFilter} onChange={e=>setPaymentStatusFilter(e.target.value)}>
                <option value="All">All Payment Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="dp-spinner"><div className="dp-spinner-circle"></div></div>
          ) : (
            <div className="dp-tbl-scroll">
              <table className="dp-tbl" style={{minWidth:'900px'}}>
                <thead className="dp-thead-dark">
                  <tr>
                    <th>Photo</th><th>Pravesh ID</th><th>Name / Email</th><th>Role Applied</th>
                    <th>Payment Status</th><th>Username</th><th>Password</th>
                    <th className="dp-center">Form PDF</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="9" className="dp-empty-cell">No Data Found</td></tr>
                  ) : filteredData.map(user => {
                    const getPhotoUrl = (path, size = 40) => {
                      if (!path) return `https://via.placeholder.com/${size}`;
                      if (path.startsWith('http')) return path; // Cloudinary or external URL
                      return `${apiUrl}${path}`; // legacy local path
                    };
                    const photo = getPhotoUrl(user.photoPath, 40);
                    const pdfUrl = user.applicationPdf ? `${apiUrl}${user.applicationPdf}` : null;
                    return (
                      <tr key={user._id}>
                        <td><img src={photo} className="user-thumb" alt="User" crossOrigin="anonymous" onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/40'; }} /></td>
                        <td className="dp-uid">AF-{user.uniqueId}</td>
                        <td>
                          <div className="dp-bold dp-small">{user.fullName}</div>
                          <div className="dp-muted" style={{fontSize:'11px'}}>{user.email}</div>
                        </td>
                        <td><span className="dp-badge dp-badge-blue" style={{fontSize:'11px'}}>{user.roleApplied || 'N/A'}</span></td>
                        <td>
                          {user.paymentStatus === 'Success' && <span className="dp-badge dp-badge-green"> {user.paymentStatus}</span>}
                          {user.paymentStatus === 'Pending' && <span className="dp-badge dp-badge-yellow"> {user.paymentStatus}</span>}
                          {user.paymentStatus === 'Failed' && <span className="dp-badge dp-badge-red"> {user.paymentStatus}</span>}
                          {!user.paymentStatus && <span className="dp-badge dp-badge-gray"> Pending</span>}
                        </td>
                        <td>
                          {user.emp_username ? (
                            <code className="dp-code" style={{fontSize:'11px'}}>{user.emp_username}</code>
                          ) : (
                            <button
                              className={`dp-btn dp-btn-sm ${user.paymentStatus === 'Success' ? 'dp-btn-warning' : 'dp-btn-gray'}`}
                              onClick={() => handleAutoGenerateCredentials(user._id, user.fullName, user.paymentStatus)}
                              disabled={user.paymentStatus !== 'Success'}
                              title={user.paymentStatus === 'Success' ? 'Click to generate credentials' : 'Only successful payments can generate credentials'}
                            >
                              <i className="fa-solid fa-key"></i> Generate
                            </button>
                          )}
                        </td>
                        <td>
                          {user.emp_password ? (
                            <button className="dp-btn dp-btn-green dp-btn-sm" onClick={()=>handleViewCreds(user.emp_username, user.emp_password_plain || 'Protected')} title="View password">
                              <i className="fa-solid fa-eye"></i> View
                            </button>
                          ) : (
                            <span className="dp-badge dp-badge-gray">Not Generated</span>
                          )}
                        </td>
                        <td className="dp-center">
                          {pdfUrl ? (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="dp-btn dp-btn-red dp-btn-sm">
                              <i className="fa-solid fa-file-pdf"></i> PDF
                            </a>
                          ) : (
                            <span className="dp-badge dp-badge-gray">No PDF</span>
                          )}
                        </td>
                        <td>
                          <div className="dp-row-actions">
                            <button className="dp-btn dp-btn-blue dp-btn-sm" onClick={()=>handleOpenCard(user)}>
                              <i className="fa-solid fa-id-card"></i>
                            </button>
                            <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={()=>handleDeleteEmployee(user._id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ID Card Modal */}
      {showCardModal && selectedUser && (
        <div className="dp-modal-overlay" onClick={()=>setShowCardModal(false)}>
          <div className="dp-modal" onClick={e=>e.stopPropagation()}>
            <div className="dp-modal-header dp-mh-default">
              <span className="dp-modal-title">ID Card Preview</span>
              <button className="dp-modal-close dp-modal-close-dark" onClick={()=>setShowCardModal(false)}></button>
            </div>
            <div className="dp-modal-body" style={{padding:0,background:'#f8f9fa',textAlign:'center'}}>
              <div className="id-card-wrapper">
                <div className="id-card-container" id="adminIdCard">
                  <div className="unique-id">ID: AF-{selectedUser.uniqueId}</div>
                  <div className="card-header-custom">
                    <h3>Aagaj Foundation</h3>
                    <p>Registered Under Indian Trust Act 1882</p>
                  </div>
                  <div className="photo-section">
                    <img src={selectedUser.photoPath?.startsWith('http') ? selectedUser.photoPath : selectedUser.photoPath ? `${apiUrl}${selectedUser.photoPath}` : 'https://via.placeholder.com/100'} className="photo-frame" alt="User" crossOrigin="anonymous" />
                  </div>
                  <div className="card-body-custom">
                    <div className="card-name">{selectedUser.fullName}</div>
                    <div className="card-designation">{selectedUser.roleApplied || 'General Staff'}</div>
                    <div className="details-box">
                      <div><strong>Post:</strong> <span>{selectedUser.roleApplied || 'N/A'}</span></div>
                      <div><strong>DOB:</strong> <span>{selectedUser.dob || 'N/A'}</span></div>
                      <div><strong>Mobile:</strong> <span>{selectedUser.mobile}</span></div>
                      <div><strong>Email:</strong> <span>{selectedUser.email.length > 18 ? selectedUser.email.substring(0,16)+'...' : selectedUser.email}</span></div>
                      <div><strong>Dist:</strong> <span>{selectedUser.district || 'N/A'}</span></div>
                      <div><strong>State:</strong> <span>{selectedUser.state || 'N/A'}</span></div>
                    </div>
                  </div>
                  <div className="card-footer-custom">www.aagajfoundation.com | Helpline: 9431430464</div>
                </div>
              </div>
            </div>
            <div className="dp-modal-footer">
              <button className="dp-btn dp-btn-gray dp-btn-sm" onClick={()=>setShowCardModal(false)}>Close</button>
              <button className="dp-btn dp-btn-green dp-btn-sm" onClick={downloadCard}><i className="fa-solid fa-download"></i> Download Card</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Password Modal */}
      {showSetPasswordModal && (
        <div className="dp-modal-overlay" onClick={()=>setShowSetPasswordModal(false)}>
          <div className="dp-modal dp-modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="dp-modal-header dp-mh-blue-grad">
              <div>
                <span className="dp-modal-title"><i className="fa-solid fa-lock"></i> Set Password</span>
                <div className="dp-modal-sub">Create secure credentials</div>
              </div>
              <button className="dp-modal-close" onClick={()=>setShowSetPasswordModal(false)}></button>
            </div>
            <form onSubmit={handleSubmitPassword}>
              <div className="dp-modal-body" style={{maxHeight:'calc(85vh - 140px)',overflowY:'auto'}}>
                <div className="dp-applicant-box">
                  <div className="dp-small"><i className="fa-solid fa-user" style={{color:'#0d6efd',marginRight:'4px'}}></i><strong>Applicant:</strong></div>
                  <div className="dp-bold" style={{marginLeft:'20px',fontSize:'14px'}}>{selectedApplicantName}</div>
                </div>
                {passwordError && (
                  <div className="dp-box-error"><i className="fa-solid fa-circle-exclamation"></i> <strong>Error:</strong> {passwordError}</div>
                )}
                <div className="dp-form-group">
                  <label className="dp-form-label"><i className="fa-solid fa-key" style={{color:'#ffc107',marginRight:'6px'}}></i>Password</label>
                  <input type="password" className={`dp-form-input ${passwordForm.password ? 'dp-input-green' : ''}`} name="password" value={passwordForm.password} onChange={handlePasswordChange} placeholder="Min 6 characters" required />
                  <div className="dp-hint"><i className="fa-solid fa-circle-info"></i> Minimum 6 characters</div>
                </div>
                <div className="dp-form-group">
                  <label className="dp-form-label"><i className="fa-solid fa-key" style={{color:'#ffc107',marginRight:'6px'}}></i>Confirm</label>
                  <input type="password"
                    className={`dp-form-input ${passwordForm.confirmPassword ? (pwMatch ? 'dp-input-green' : 'dp-input-red') : ''}`}
                    name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Re-enter password" required />
                  {passwordForm.confirmPassword && (
                    <div className={`dp-hint ${pwMatch ? 'dp-hint-green' : 'dp-hint-red'}`}>
                      <i className={`fa-solid ${pwMatch ? 'fa-check-circle' : 'fa-times-circle'}`}></i> {pwMatch ? 'Match!' : 'No match'}
                    </div>
                  )}
                </div>
              </div>
              <div className="dp-modal-footer">
                <button type="button" className="dp-btn dp-btn-outline dp-btn-sm" onClick={()=>setShowSetPasswordModal(false)}><i className="fa-solid fa-times"></i> Cancel</button>
                <button type="submit" className="dp-btn dp-btn-green dp-btn-sm" disabled={!passwordForm.password || !passwordForm.confirmPassword || !pwMatch}><i className="fa-solid fa-check"></i> Set</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredModal && (
        <div className="dp-modal-overlay" onClick={()=>setShowCredModal(false)}>
          <div className="dp-modal dp-modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="dp-modal-header dp-mh-green-grad">
              <div>
                <span className="dp-modal-title"><i className="fa-solid fa-check-circle"></i> Credentials Generated!</span>
                <div className="dp-modal-sub">Copy & share these credentials</div>
              </div>
              <button className="dp-modal-close" onClick={()=>setShowCredModal(false)}></button>
            </div>
            <div className="dp-modal-body" style={{maxHeight:'calc(85vh - 110px)',overflowY:'auto'}}>
              <div className="dp-box-success"><i className="fa-solid fa-circle-check"></i> <strong>Ready to Share!</strong> Copy credentials below.</div>
              <div className="dp-form-group">
                <label className="dp-form-label"><i className="fa-solid fa-user" style={{color:'#0d6efd',marginRight:'6px'}}></i>Username</label>
                <div className="dp-copy-group">
                  <input type="text" className="dp-copy-input dp-copy-input-blue" value={credData.user} readOnly />
                  <button type="button" className="dp-copy-btn dp-copy-btn-blue" onClick={()=>navigator.clipboard.writeText(credData.user)}><i className="fa-solid fa-copy"></i> Copy</button>
                </div>
              </div>
              <div className="dp-form-group">
                <label className="dp-form-label"><i className="fa-solid fa-key" style={{color:'#dc3545',marginRight:'6px'}}></i>Password</label>
                <div className="dp-copy-group">
                  <input type="text" className="dp-copy-input dp-copy-input-red" value={credData.pass} readOnly />
                  <button type="button" className="dp-copy-btn dp-copy-btn-red" onClick={()=>navigator.clipboard.writeText(credData.pass)}><i className="fa-solid fa-copy"></i> Copy</button>
                </div>
              </div>
              <div className="dp-box-note"><i className="fa-solid fa-circle-info"></i> <strong>Note:</strong> This modal will auto-close in 3 seconds & page will refresh.</div>
            </div>
            <div className="dp-modal-footer">
              <span className="dp-muted"><i className="fa-solid fa-refresh"></i> Will auto-refresh page...</span>
              <button type="button" className="dp-btn dp-btn-green dp-btn-sm" onClick={()=>setShowCredModal(false)}><i className="fa-solid fa-check"></i> Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataPage;
