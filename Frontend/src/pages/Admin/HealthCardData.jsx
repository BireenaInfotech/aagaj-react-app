import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDataPage.css';
import '../HealthServices/HealthCard.css';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';

const HealthCardData = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/healthcard/`);
      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (err) { console.error('Fetch Error:', err); setLoading(false); }
  };

  const isCardActive = (card) => !card.expiryDate || new Date(card.expiryDate) > new Date();

  const filteredData = data.filter(card => {
    const matchesSearch =
      card.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.healthId?.toString().includes(searchTerm) ||
      card.mobile?.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'active') return matchesSearch && isCardActive(card);
    if (statusFilter === 'inactive') return matchesSearch && !isCardActive(card);
    return matchesSearch;
  });

  const handleLogout = () => { sessionStorage.removeItem('loggedInUser'); sessionStorage.removeItem('adminEmail'); navigate('/'); };
  const formatAadhar = (aadhar) => { if (!aadhar) return 'N/A'; const s = aadhar.toString(); return `${s.slice(0,4)} ${s.slice(4,8)} ${s.slice(8,12)}`; };
  const formatExpiryDate = (expiry) => { if (!expiry) return 'N/A'; return new Date(expiry).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'2-digit' }); };

  const viewCardDetails = async (card) => {
    setSelectedCard(card);
    try {
      const qrText = `Health ID: ${card.healthId || card._id}\nName: ${card.fullName || card.name}\nAadhar: ${formatAadhar(card.aadhar)}\nPhone: ${card.mobileNumber || card.mobile}`;
      const qrImage = await QRCode.toDataURL(qrText, { errorCorrectionLevel:'H', type:'image/jpeg', quality:0.98, margin:1, width:300 });
      setQrCodeImage(qrImage);
    } catch (err) { console.error('QR Code error:', err); }
    setShowCardModal(true);
  };

  const downloadPDF = async () => {
    try {
      if (!selectedCard) return;
      const element = document.getElementById('health-card-print-area');
      if (!element) { alert('Card data not found'); return; }
      const clonedElement = element.cloneNode(true);
      clonedElement.style.display = 'block';
      clonedElement.style.padding = '20px';
      clonedElement.style.background = '#ffffff';
      const opt = {
        margin: 5,
        filename: `Swasthya_Suraksha_Card_${selectedCard.healthId || selectedCard._id}.pdf`,
        image: { type:'jpeg', quality:0.98 },
        html2canvas: { scale:2, useCORS:true, allowTaint:true, backgroundColor:'#ffffff' },
        jsPDF: { orientation:'portrait', unit:'mm', format:'a4' }
      };
      html2pdf().set(opt).from(clonedElement).save();
      alert('PDF downloaded successfully!');
    } catch (error) { console.error('PDF download error:', error); alert('Error downloading PDF.'); }
  };

  const pills = [
    { key:'all',      label:`All Cards (${data.length})`,                          active:'dp-fb-active-primary' },
    { key:'active',   label:`Active (${data.filter(c=>isCardActive(c)).length})`,  active:'dp-fb-active-success' },
    { key:'inactive', label:`Expired (${data.filter(c=>!isCardActive(c)).length})`,active:'dp-fb-active-warning' },
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
          <li><Link to="/health-card-data" className="active"><i className="fa-solid fa-file-medical"></i> Health Cards</Link></li>
          <li><Link to="/appointment-data"><i className="fa-solid fa-calendar"></i> Appointments</Link></li>
          <li><Link to="/payments"><i className="fa-solid fa-money-bill"></i> Payments</Link></li>
          <li className="dp-nav-divider"><Link to="/"><i className="fa-solid fa-house"></i> Back to Website</Link></li>
          <li><a href="#logout" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a></li>
        </ul>
      </nav>

      <div className="main-content">
        <div className="dp-page-header">
          <h3 className="dp-page-title">Health Card Management</h3>
          <button className="dp-btn dp-btn-dark dp-btn-sm" onClick={fetchData}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        <div className="dp-stats-3 dp-mb">
          <div className="stat-card red">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Total Cards</div><div className="dp-stat-num">{data.length}</div></div>
              <i className="fa-solid fa-id-card dp-stat-icon" style={{color:'#ED1C24'}}></i>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Active Cards</div><div className="dp-stat-num">{data.filter(c=>isCardActive(c)).length}</div></div>
              <i className="fa-solid fa-credit-card dp-stat-icon" style={{color:'#0d6efd'}}></i>
            </div>
          </div>
          <div className="stat-card gray">
            <div className="dp-stat-inner">
              <div><div className="dp-stat-label">Expired Cards</div><div className="dp-stat-num">{data.filter(c=>!isCardActive(c)).length}</div></div>
              <i className="fa-solid fa-exclamation-circle dp-stat-icon" style={{color:'#ffc107'}}></i>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="dp-table-header">
            <span className="dp-table-title">Health Cards</span>
            <input type="text" className="dp-input" placeholder="Search Name or Card Number..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <div className="dp-filter-btns" style={{marginBottom:'1rem'}}>
            {pills.map(p=>(
              <button key={p.key} className={`dp-filter-btn ${statusFilter===p.key ? p.active : ''}`} onClick={()=>setStatusFilter(p.key)}>
                {p.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="dp-spinner"><div className="dp-spinner-circle"></div></div>
          ) : (
            <div className="dp-tbl-scroll">
              <table className="dp-tbl" style={{minWidth:'800px'}}>
                <thead className="dp-thead-dark">
                  <tr>
                    <th>Card Number</th><th>Name</th><th>Contact Details</th><th>Age / DOB</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="6" className="dp-empty-cell">No Data Found</td></tr>
                  ) : filteredData.map(card => (
                    <tr key={card._id}>
                      <td className="dp-uid">{card.healthId}</td>
                      <td>{card.fullName}</td>
                      <td>
                        <div className="dp-bold dp-small">{card.mobile}</div>
                        <div className="dp-muted dp-small">{card.aadhar}</div>
                      </td>
                      <td>{card.age}</td>
                      <td>
                        {isCardActive(card) ? (
                          <span className="dp-badge dp-badge-green"><i className="fa-solid fa-check-circle"></i> Active</span>
                        ) : (
                          <span className="dp-badge dp-badge-yellow"><i className="fa-solid fa-exclamation-circle"></i> Expired</span>
                        )}
                      </td>
                      <td>
                        <div className="dp-row-actions">
                          <button className="dp-btn dp-btn-info dp-btn-sm" onClick={()=>viewCardDetails(card)} title="View Card">
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                          <button className="dp-btn dp-btn-green dp-btn-sm" onClick={()=>{ setSelectedCard(card); setTimeout(()=>downloadPDF(),100); }} title="Download PDF">
                            <i className="fa-solid fa-download"></i> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Card Details Modal — all inline styles kept as original */}
      {showCardModal && selectedCard && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'15px',overflowY:'auto'}}>
          <div style={{background:'white',borderRadius:'18px',maxWidth:'600px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',display:'flex',flexDirection:'column',maxHeight:'85vh',margin:'auto'}}>
            <div style={{padding:'30px 25px 15px 25px',textAlign:'center',borderBottom:'1px solid #e2e8f0'}}>
              <h1 style={{color:'#0f172a',margin:'0 0 8px 0',fontSize:'22px',fontWeight:'900'}}>{selectedCard.fullName}</h1>
              <p style={{color:'#64748b',margin:0,fontSize:'13px',fontWeight:'700'}}>Health ID: {selectedCard.healthId}</p>
            </div>
            <div style={{overflowY:'auto',flex:1,padding:'30px 20px',background:'#f5f5f5'}}>
              <div className="modern-health-card" style={{marginBottom:'40px'}}>
                <div style={{background:'#fff',textAlign:'center',padding:'2px 0',fontSize:'9px',fontWeight:'800',color:'#2e3192',letterSpacing:'1px',borderBottom:'1px solid #eee'}}>
                  This Card is Being Issued Under Swasthya Suraksha Yojna
                </div>
                <div className="card-header-premium">
                  <div className="card-header-left">
                    <img src="/logo.jpg" alt="Logo" className="card-logo" />
                    <div className="foundation-logo-text">AAGAJ<span>.</span>FOUNDATION</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'8px',fontWeight:'700'}}>HEALTH CARD</div>
                    <div style={{fontSize:'12px',fontWeight:'900',color:'#ed1c24'}}>{selectedCard.healthId}</div>
                  </div>
                </div>
                <div className="card-body-main">
                  <div className="photo-box">
                    <img src={selectedCard.photoPath} alt="Patient" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                  <div className="patient-info-grid">
                    <div className="data-item full"><label>PATIENT NAME</label><span>{selectedCard.fullName.toUpperCase()}</span></div>
                    <div className="data-item"><label>AGE / GENDER</label><span>{selectedCard.age} YRS / {selectedCard.gender?.toUpperCase()||'N/A'}</span></div>
                    <div className="data-item"><label>BLOOD GROUP</label><span>{selectedCard.bloodGroup||'N/A'}</span></div>
                    <div className="data-item full"><label>AADHAR NUMBER</label><span>{formatAadhar(selectedCard.aadhar)}</span></div>
                    <div className="data-item full"><label>CONTACT NO.</label><span style={{color:'#2e3192'}}>+91 {selectedCard.mobile}</span></div>
                  </div>
                </div>
                <div className="card-footer-strip">
                  <div>
                    <div style={{fontSize:'9px',fontWeight:'800',color:'#10b981'}}>VALID IDENTITY</div>
                    <div style={{fontSize:'7px',color:'#94a3b8'}}>Digitally Secured Profile</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'7px',color:'#94a3b8'}}>EXPIRY DATE</div>
                    <div style={{fontSize:'10px',fontWeight:'800'}}>{formatExpiryDate(selectedCard.expiryDate)}</div>
                  </div>
                </div>
              </div>
              <div className="modern-health-card">
                <div style={{background:'#2e3192',color:'white',textAlign:'center',padding:'12px',fontWeight:'800',fontSize:'14px'}}>RESIDENTIAL & OTHER DETAILS</div>
                <div className="card-body-main" style={{flexDirection:'row',padding:'20px',gap:'20px',alignItems:'flex-start'}}>
                  <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                    <div className="data-item"><label>VILLAGE</label><span>{selectedCard.address?.village||selectedCard.village||'N/A'}</span></div>
                    <div className="data-item"><label>PANCHAYAT</label><span>{selectedCard.address?.panchayat||selectedCard.panchayat||'N/A'}</span></div>
                    <div className="data-item"><label>BLOCK</label><span>{selectedCard.address?.block||selectedCard.block||'N/A'}</span></div>
                    <div className="data-item"><label>DISTRICT</label><span>{selectedCard.address?.district||selectedCard.district||'N/A'}</span></div>
                    <div className="data-item"><label>STATE</label><span>{selectedCard.address?.state||selectedCard.state||'N/A'}</span></div>
                    <div className="data-item"><label>PIN CODE</label><span>{selectedCard.address?.pincode||selectedCard.pincode||'N/A'}</span></div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                    {qrCodeImage && (<img src={qrCodeImage} alt="QR Code" style={{width:'120px',height:'120px',border:'2px solid #2e3192',borderRadius:'8px',padding:'4px',background:'white'}} />)}
                    <p style={{margin:'0',fontSize:'7px',fontWeight:'700',color:'#2e3192',textAlign:'center'}}>SCAN FOR<br/>DETAILS</p>
                  </div>
                </div>
                <div style={{padding:'12px 20px',borderTop:'1px solid #e2e8f0',textAlign:'center'}}>
                  <p style={{margin:'0',fontSize:'8px',fontWeight:'800',color:'#2e3192'}}>AAGAJ FOUNDATION - REG: 1882 ACT</p>
                  <p style={{margin:'3px 0 0 0',fontSize:'6px',color:'#64748b'}}>Digital health identity | Keep it safe</p>
                </div>
              </div>
            </div>
            <div style={{background:'#f5f5f5',padding:'20px',borderTop:'1px solid #e2e8f0',display:'flex',gap:'10px',justifyContent:'space-between'}}>
              <button onClick={()=>setShowCardModal(false)} style={{flex:1,padding:'12px',background:'#e2e8f0',color:'#2e3192',border:'none',borderRadius:'12px',fontWeight:'800',cursor:'pointer',fontSize:'14px'}}>Close</button>
              <button onClick={()=>downloadPDF()} style={{flex:1,padding:'12px',background:'#10b981',color:'white',border:'none',borderRadius:'12px',fontWeight:'800',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                <i className="fas fa-download"></i> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area for PDF */}
      <div id="health-card-print-area" style={{display:'none',padding:'20px',background:'white',fontSize:'16px'}}>
        {selectedCard && (
          <>
            <div className="modern-health-card" style={{marginBottom:'30px',background:'white'}}>
              <div style={{background:'#fff',textAlign:'center',padding:'2px 0',fontSize:'9px',fontWeight:'800',color:'#2e3192',letterSpacing:'1px',borderBottom:'1px solid #eee'}}>
                This Card is Being Issued Under Swasthya Suraksha Yojna
              </div>
              <div className="card-header-premium">
                <div className="card-header-left">
                  <img src="/logo.jpg" alt="Logo" className="card-logo" />
                  <div className="foundation-logo-text">AAGAJ<span>.</span>FOUNDATION</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'8px',fontWeight:'700'}}>HEALTH CARD</div>
                  <div style={{fontSize:'12px',fontWeight:'900',color:'#ed1c24'}}>{selectedCard.healthId}</div>
                </div>
              </div>
              <div className="card-body-main">
                <div className="photo-box"><img src={selectedCard.photoPath} alt="Patient" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
                <div className="patient-info-grid">
                  <div className="data-item full"><label>PATIENT NAME</label><span>{selectedCard.fullName.toUpperCase()}</span></div>
                  <div className="data-item"><label>AGE / GENDER</label><span>{selectedCard.age} YRS / {selectedCard.gender?.toUpperCase()||'N/A'}</span></div>
                  <div className="data-item"><label>BLOOD GROUP</label><span>{selectedCard.bloodGroup||'N/A'}</span></div>
                  <div className="data-item full"><label>AADHAR NUMBER</label><span>{formatAadhar(selectedCard.aadhar)}</span></div>
                  <div className="data-item full"><label>CONTACT NO.</label><span style={{color:'#2e3192'}}>+91 {selectedCard.mobile}</span></div>
                </div>
              </div>
              <div className="card-footer-strip">
                <div>
                  <div style={{fontSize:'9px',fontWeight:'800',color:'#10b981'}}>VALID IDENTITY</div>
                  <div style={{fontSize:'7px',color:'#94a3b8'}}>Digitally Secured Profile</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'7px',color:'#94a3b8'}}>EXPIRY DATE</div>
                  <div style={{fontSize:'10px',fontWeight:'800'}}>{formatExpiryDate(selectedCard.expiryDate)}</div>
                </div>
              </div>
            </div>
            <div className="modern-health-card" style={{background:'white'}}>
              <div style={{background:'#2e3192',color:'white',textAlign:'center',padding:'12px',fontWeight:'800',fontSize:'14px'}}>RESIDENTIAL & OTHER DETAILS</div>
              <div className="card-body-main" style={{flexDirection:'row',padding:'20px',gap:'20px',alignItems:'flex-start'}}>
                <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div className="data-item"><label>VILLAGE</label><span>{selectedCard.address?.village||selectedCard.village||'N/A'}</span></div>
                  <div className="data-item"><label>PANCHAYAT</label><span>{selectedCard.address?.panchayat||selectedCard.panchayat||'N/A'}</span></div>
                  <div className="data-item"><label>BLOCK</label><span>{selectedCard.address?.block||selectedCard.block||'N/A'}</span></div>
                  <div className="data-item"><label>DISTRICT</label><span>{selectedCard.address?.district||selectedCard.district||'N/A'}</span></div>
                  <div className="data-item"><label>STATE</label><span>{selectedCard.address?.state||selectedCard.state||'N/A'}</span></div>
                  <div className="data-item"><label>PIN CODE</label><span>{selectedCard.address?.pincode||selectedCard.pincode||'N/A'}</span></div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                  {qrCodeImage && (<img src={qrCodeImage} alt="QR Code" style={{width:'120px',height:'120px',border:'2px solid #2e3192',borderRadius:'8px',padding:'4px',background:'white'}} />)}
                  <p style={{margin:'0',fontSize:'7px',fontWeight:'700',color:'#2e3192',textAlign:'center'}}>SCAN FOR<br/>DETAILS</p>
                </div>
              </div>
              <div style={{padding:'12px 20px',borderTop:'1px solid #e2e8f0',textAlign:'center'}}>
                <p style={{margin:'0',fontSize:'8px',fontWeight:'800',color:'#2e3192'}}>AAGAJ FOUNDATION - REG: 1882 ACT</p>
                <p style={{margin:'3px 0 0 0',fontSize:'6px',color:'#64748b'}}>Digital health identity | Keep it safe</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HealthCardData;
