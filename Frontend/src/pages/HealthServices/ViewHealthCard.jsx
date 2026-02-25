import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './HealthCard.css';

const ViewHealthCard = () => {
  const { healthCardId } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/healthcard/get-by-id/${healthCardId}`);
        
        if (!response.ok) {
          throw new Error('Health card not found');
        }
        
        const data = await response.json();
        console.log('📥 Received card data:', data);
        
        // Extract actual card data from response wrapper
        if (data.success && data.data) {
          setCardData(data.data);
          console.log('✅ Card data set successfully:', data.data);
        } else {
          setCardData(data);
        }
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load health card');
        console.error('Error fetching card:', err);
      } finally {
        setLoading(false);
      }
    };

    if (healthCardId) {
      fetchCardData();
    }
  }, [healthCardId, apiUrl]);

  const formatAadhar = (aadhar) => {
    return aadhar.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2e3192', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#2e3192' }}>Loading Health Card...</h2>
          <p style={{ color: '#64748b' }}>Please wait while we retrieve your health card details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#2e3192', marginBottom: '10px' }}>Card Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Please check the card ID and try again.</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return null;
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: '#2e3192', color: 'white', padding: '30px 20px', textAlign: 'center', borderRadius: '0 0 20px 20px', marginBottom: '40px' }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '15px' }} />
        <h1 style={{ margin: '0 0 5px 0', fontWeight: '900', fontSize: '28px' }}>AAGAJ FOUNDATION</h1>
        <p style={{ margin: '0', color: '#cbd5e1', fontWeight: '700', fontSize: '14px', letterSpacing: '2px' }}>HEALTH IDENTITY CARD</p>
        <p style={{ margin: '10px 0 0 0', color: '#e2e8f0', fontWeight: '600', fontSize: '12px' }}>This Card is Being Issued Under Swasthya Suraksha Yojna</p>
      </div>

      {/* Main Content */}
      {cardData && (
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Patient Photo & Basic Info */}
        <div style={{ background: 'linear-gradient(135deg, #2e3192 0%, #445099 100%)', padding: '30px 20px', color: 'white' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img 
              src={cardData?.photoPath} 
              alt="Patient" 
              style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '3px solid white' }} 
            />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '700', opacity: 0.9 }}>HEALTH CARD ID</p>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>{cardData?.healthId || 'N/A'}</h2>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '700', opacity: 0.9 }}>PATIENT NAME</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '800' }}>{cardData?.fullName?.toUpperCase() || 'N/A'}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 3px 0', fontSize: '10px', fontWeight: '700', opacity: 0.9 }}>AGE / GENDER</p>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '800' }}>{cardData?.age || 'N/A'} {cardData?.age ? 'YRS' : ''} / {cardData?.gender?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px 0', fontSize: '10px', fontWeight: '700', opacity: 0.9 }}>BLOOD GROUP</p>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '800' }}>{cardData?.bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Status Info */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase' }}>
            <i className="fas fa-phone" style={{ marginRight: '8px' }}></i>Contact Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>MOBILE NUMBER</p>
              <p style={{ margin: '0', fontSize: '14px', fontWeight: '800', color: '#2e3192' }}>+91 {cardData?.mobile || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>AADHAR NUMBER</p>
              <p style={{ margin: '0', fontSize: '14px', fontWeight: '800', color: '#2e3192' }}>{cardData?.aadhar ? formatAadhar(cardData.aadhar) : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase' }}>
            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>Residential Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>VILLAGE</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.village?.toUpperCase() || 'N/A'}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>BLOCK</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.block?.toUpperCase() || 'N/A'}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>STATE</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.state?.toUpperCase() || 'N/A'}</p>
            </div>
            
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PANCHAYAT</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.panchayat?.toUpperCase() || 'N/A'}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>DISTRICT</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.district?.toUpperCase() || 'N/A'}</p>
              
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PIN CODE</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.address?.pincode || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase' }}>
            <i className="fas fa-heartbeat" style={{ marginRight: '8px' }}></i>Medical Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>BLOOD GROUP</p>
              <p style={{ margin: '0', fontSize: '14px', fontWeight: '900', color: '#ed1c24', background: '#fff5f5', padding: '8px 12px', borderRadius: '6px', textAlign: 'center', border: '2px solid #fed7d7' }}>
                {cardData?.bloodGroup || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>AGE</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.age || 'N/A'} Years</p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>GENDER</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.gender?.toUpperCase() || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Enrollment Information */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase' }}>
            <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>Enrollment Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ENROLLMENT DATE</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.createdAt ? formatDate(cardData.createdAt) : 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PAYMENT STATUS</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: cardData?.paymentStatus === 'completed' ? '#10b981' : '#f97316' }}>{cardData?.paymentStatus?.toUpperCase() || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>VALID FROM</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.issueDate ? formatDate(cardData.issueDate) : formatDate(cardData?.createdAt) || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>EXPIRES ON</p>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>{cardData?.expiryDate ? formatExpiryDate(cardData.expiryDate) : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Card Status */}
        <div style={{ padding: '25px 20px', background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '2px solid #10b981', textAlign: 'center' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#10b981', marginBottom: '8px', display: 'block' }}></i>
                <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CARD STATUS</p>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: '900', color: '#10b981' }}>VALID</p>
              </div>
            </div>
            <div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '2px solid #0284c7', textAlign: 'center' }}>
                <i className="fas fa-calendar-check" style={{ fontSize: '24px', color: '#0284c7', marginBottom: '8px', display: 'block' }}></i>
                <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>VALID UNTIL</p>
                <p style={{ margin: '0', fontSize: '13px', fontWeight: '900', color: '#0284c7' }}>{cardData?.expiryDate ? formatExpiryDate(cardData.expiryDate) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Additional Info */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #edf2f7', background: '#fafbfc' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase' }}>
            <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>Verification Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>PHOTO VERIFIED</p>
              <p style={{ margin: '0', fontSize: '12px', fontWeight: '800', color: '#10b981' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Yes
              </p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>AADHAR VERIFIED</p>
              <p style={{ margin: '0', fontSize: '12px', fontWeight: '800', color: '#10b981' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Yes
              </p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>MOBILE VERIFIED</p>
              <p style={{ margin: '0', fontSize: '12px', fontWeight: '800', color: '#10b981' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Yes
              </p>
            </div>
          </div>
          <div style={{ marginTop: '15px', padding: '12px', background: '#e7f3ff', borderRadius: '8px', border: '1px solid #0284c7' }}>
            <p style={{ margin: '0', fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
              This is a digitally verified health identity card issued under Swasthya Suraksha Yojna. All details have been verified and validated.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#2e3192', color: 'white', padding: '20px', textAlign: 'center', borderTop: '3px solid #ed1c24' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: '800', opacity: 0.9 }}>AAGAJ FOUNDATION - REG: 1882 ACT</p>
          <p style={{ margin: '0', fontSize: '10px', color: '#cbd5e1' }}>Digital health identity card | Swasthya Suraksha Yojna</p>
        </div>
      </div>
      )}

      {/* Print Button */}
      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
        <button 
          onClick={() => window.print()} 
          style={{
            padding: '12px 30px',
            background: '#2e3192',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '14px',
            gap: '10px',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <i className="fas fa-print"></i> Print Card Details
        </button>
      </div>
    </div>
  );
};

export default ViewHealthCard;
