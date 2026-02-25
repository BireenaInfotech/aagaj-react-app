import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDataPage.css';

const SwasthyaSurakshaData = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(`${apiUrl}/swasthya-suraksha-provider/all`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const filteredData = data.filter(p => {
    const matchesSearch =
      p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorizedPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.whatsappNumber?.includes(searchTerm);
    const matchesCategory = categoryFilter === 'All' || p.businessCategory === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.registrationStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (s) => s === 'Approved' ? 'dp-badge-green' : s === 'Pending' ? 'dp-badge-yellow' : 'dp-badge-red';
  const getCatColor = (cat) => cat === 'Hospital' ? '#2196F3' : cat === 'Lab' ? '#4CAF50' : '#FF9800';
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
          <li><Link to="/swasthya-suraksha-data" className="active"><i className="fa-solid fa-heart-pulse"></i> Swasthya Suraksha</Link></li>
          <li><Link to="/health-card-data"><i className="fa-solid fa-file-medical"></i> Health Cards</Link></li>
          <li><Link to="/appointment-data"><i className="fa-solid fa-calendar"></i> Appointments</Link></li>
          <li><Link to="/payments"><i className="fa-solid fa-money-bill"></i> Payments</Link></li>
          <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
          <li><a href="#logout" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
      </nav>

      <div className="main-content">
        <div className="dp-page-header">
          <h3 className="dp-page-title"> Swasthya Suraksha Provider Registrations</h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchData}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        <div className="dp-stats-2 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Approved</div><div className="dp-stat-num">{data.filter(p=>p.registrationStatus==='Approved').length}</div></div>
              <i className="fa-solid fa-check-circle dp-stat-icon" style={{color:'#198754'}}></i>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Pending</div><div className="dp-stat-num">{data.filter(p=>p.registrationStatus==='Pending').length}</div></div>
              <i className="fa-solid fa-clock dp-stat-icon" style={{color:'#ffc107'}}></i>
            </div>
          </div>
          <div className="stat-card gray">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Rejected</div><div className="dp-stat-num">{data.filter(p=>p.registrationStatus==='Rejected').length}</div></div>
              <i className="fa-solid fa-times-circle dp-stat-icon" style={{color:'#dc3545'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total</div><div className="dp-stat-num">{data.length}</div></div>
              <i className="fa-solid fa-hospital dp-stat-icon" style={{color:'#0d6efd'}}></i>
            </div>
          </div>
        </div>

        <div className="dp-table-header" style={{flexWrap:'wrap',gap:'0.5rem',marginBottom:'1rem'}}>
          <input type="text" className="dp-input" placeholder="Search name, city, phone..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          <select className="dp-select" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Hospital">Hospital</option>
            <option value="Lab">Lab</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>
          <select className="dp-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="dp-spinner"><div className="dp-spinner-circle"></div></div>
          ) : (
            <div className="dp-tbl-scroll">
              <table className="dp-tbl" style={{minWidth:'1100px'}}>
                <thead className="dp-thead-dark">
                  <tr>
                    <th>Unique ID</th><th>Business Name</th><th>Category</th><th>Contact Person</th>
                    <th>Phone</th><th>City</th><th>License</th><th>Registered By</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="10" className="dp-empty-cell">No Data Found</td></tr>
                  ) : filteredData.map(provider => (
                    <React.Fragment key={provider._id}>
                      <tr
                        onClick={() => setExpandedId(expandedId===provider._id ? null : provider._id)}
                        style={{cursor:'pointer'}}
                        className={expandedId===provider._id ? 'dp-tbl-row-active' : ''}
                      >
                        <td className="dp-uid">{provider.uniqueId}</td>
                        <td className="dp-bold">{provider.businessName}</td>
                        <td>
                          <span className="dp-badge" style={{backgroundColor:getCatColor(provider.businessCategory)}}>
                            {provider.businessCategory}
                          </span>
                        </td>
                        <td>{provider.authorizedPersonName}</td>
                        <td>
                          <a href={`tel:${provider.whatsappNumber}`} className="dp-link" onClick={e=>e.stopPropagation()}>
                            {provider.whatsappNumber}
                          </a>
                        </td>
                        <td>{provider.city}</td>
                        <td className="dp-small">{provider.licenseNumber}</td>
                        <td><span className="dp-badge dp-badge-gray">{provider.registeredByName || 'N/A'}</span></td>
                        <td><span className={`dp-badge ${getStatusBadge(provider.registrationStatus)}`}>{provider.registrationStatus}</span></td>
                        <td className="dp-small">
                          {new Date(provider.createdAt).toLocaleDateString('hi-IN')}
                          <br/><span className="dp-muted">Click for details</span>
                        </td>
                      </tr>

                      {expandedId === provider._id && (
                        <tr>
                          <td colSpan="10" style={{padding:'1.5rem',background:'#f8f9fa'}}>
                            <div className="dp-detail-grid">
                              {/* Left Column */}
                              <div>
                                <div className="dp-detail-section">
                                  <div className="dp-detail-h5"> Business Information</div>
                                  <table className="dp-detail-tbl">
                                    <tbody>
                                      <tr><td className="dp-bold">Unique ID:</td><td>{provider.uniqueId}</td></tr>
                                      <tr><td className="dp-bold">Category:</td><td>{provider.businessCategory}</td></tr>
                                      <tr><td className="dp-bold">Business Name:</td><td>{provider.businessName}</td></tr>
                                      <tr><td className="dp-bold">Details:</td><td>{provider.businessDetails || 'N/A'}</td></tr>
                                      <tr><td className="dp-bold">Extra Info:</td><td>{provider.extraInfo || 'N/A'}</td></tr>
                                      <tr><td className="dp-bold">License No.:</td><td>{provider.licenseNumber}</td></tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div className="dp-detail-section">
                                  <div className="dp-detail-h5"> Location Details</div>
                                  <table className="dp-detail-tbl">
                                    <tbody>
                                      <tr><td className="dp-bold">Address:</td><td>{provider.address}</td></tr>
                                      <tr><td className="dp-bold">Landmark:</td><td>{provider.landmark || 'N/A'}</td></tr>
                                      <tr><td className="dp-bold">City:</td><td>{provider.city}</td></tr>
                                      <tr><td className="dp-bold">State:</td><td>{provider.state}</td></tr>
                                      <tr><td className="dp-bold">Pincode:</td><td>{provider.pincode}</td></tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div>
                                <div className="dp-detail-section">
                                  <div className="dp-detail-h5"> Contact Information</div>
                                  <table className="dp-detail-tbl">
                                    <tbody>
                                      <tr><td className="dp-bold">Person Name:</td><td>{provider.authorizedPersonName}</td></tr>
                                      <tr>
                                        <td className="dp-bold">WhatsApp:</td>
                                        <td>
                                          <a href={`https://wa.me/${provider.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="dp-link">
                                            <i className="fa-brands fa-whatsapp" style={{color:'#25D366',marginRight:'4px'}}></i>
                                            {provider.whatsappNumber}
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div className="dp-detail-section">
                                  <div className="dp-detail-h5"> Services Offered</div>
                                  {provider.servicesOffered?.length > 0 ? (
                                    <div className="dp-tags">
                                      {provider.servicesOffered.map((svc,idx)=>(
                                        <span key={idx} className="dp-badge dp-badge-blue">{svc}</span>
                                      ))}
                                    </div>
                                  ) : <p className="dp-muted">No services specified</p>}
                                </div>

                                <div className="dp-detail-section">
                                  <div className="dp-detail-h5"> Registration Status</div>
                                  <table className="dp-detail-tbl">
                                    <tbody>
                                      <tr><td className="dp-bold">Status:</td><td><span className={`dp-badge ${getStatusBadge(provider.registrationStatus)}`}>{provider.registrationStatus}</span></td></tr>
                                      <tr><td className="dp-bold">Registered By:</td><td><span className="dp-badge dp-badge-gray">{provider.registeredByName || 'N/A'}</span></td></tr>
                                      <tr><td className="dp-bold">Registered On:</td><td>{new Date(provider.createdAt).toLocaleDateString('hi-IN')} {new Date(provider.createdAt).toLocaleTimeString('hi-IN')}</td></tr>
                                      <tr><td className="dp-bold">Last Updated:</td><td>{new Date(provider.updatedAt).toLocaleDateString('hi-IN')}</td></tr>
                                    </tbody>
                                  </table>
                                </div>

                                {provider.registrationNotes && (
                                  <div className="dp-detail-section">
                                    <div className="dp-detail-h5"> Notes</div>
                                    <div className="dp-box-note">{provider.registrationNotes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="dp-muted" style={{marginTop:'0.75rem',fontSize:'0.85rem'}}>
          Showing {filteredData.length} of {data.length} providers
        </div>
      </div>
    </div>
  );
};

export default SwasthyaSurakshaData;
