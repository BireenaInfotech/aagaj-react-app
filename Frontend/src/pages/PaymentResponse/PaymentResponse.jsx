import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './PaymentResponse.css';

const PaymentResponse = () => {
  const navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Get response from query params
    const params = new URLSearchParams(window.location.search);
    const response = params.get('response');
    const status = params.get('payment');

    if (response) {
      try {
        const decoded = decodeURIComponent(response);
        const parsed = JSON.parse(decoded);
        console.log('📊 Payment Response Data:', parsed);
        setResponseData(parsed);
        setPaymentStatus(parsed.paymentStatus || parsed.txnStatus || status);
      } catch (err) {
        console.error('Error parsing response:', err);
        setPaymentStatus('error');
      }
    } else if (status) {
      setPaymentStatus(status);
    }
  }, []);

  const isSuccess = paymentStatus === 'success' || paymentStatus === 'SUCCESS';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'FAILED';
  const isPending = paymentStatus === 'pending' || paymentStatus === 'PENDING';

  // Helper function to safely display data
  const renderDetailRow = (label, value) => {
    if (!value || value === 'N/A' || value === null || value === undefined) {
      return null;
    }
    return (
      <div className="detail-row">
        <span className="label">{label}:</span>
        <span className="value">{value}</span>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="payment-response-container">
        <div className="response-card">
          {/* Success State */}
          {isSuccess && (
            <>
              <div className="status-icon success">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h1 className="status-title">Payment Successful! 🎉</h1>
              <p className="status-message">Thank you for your generous donation!</p>

              {responseData && (
                <div className="response-details">
                  <div className="section-title">💼 Transaction Details</div>
                  
                  {renderDetailRow('Order ID', responseData.merchantTransactionId || responseData.merchantOrderNo || responseData.orderId || 'N/A')}
                  
                  {renderDetailRow('Transaction ID', responseData.getepayTxnId || responseData.txnId || responseData.transactionId || 'N/A')}
                  
                  {renderDetailRow('Merchant ID', responseData.mid || 'N/A')}
                  
                  {renderDetailRow('Transaction Date', responseData.transactionDate || responseData.txnDate || new Date().toLocaleString() || 'N/A')}
                  
                  {renderDetailRow('Amount Donated', responseData.amount || responseData.txnAmount || 'N/A' ? `₹ ${responseData.amount || responseData.txnAmount}` : 'N/A')}
                  
                  {renderDetailRow('Currency', responseData.currency || 'INR')}
                  
                  <div className="section-title">👤 Donor Information</div>
                  
                  {renderDetailRow('Full Name', responseData.donor_name || responseData.customerName || responseData.name || 'N/A')}
                  
                  {renderDetailRow('Email Address', responseData.email || responseData.customerEmail || 'N/A')}
                  
                  {renderDetailRow('Phone Number', responseData.phone || responseData.customerPhone || responseData.mobileNumber || 'N/A')}
                  
                  {renderDetailRow('Address', responseData.address || responseData.customerAddress || 'N/A')}
                  
                  {renderDetailRow('City', responseData.city || 'N/A')}
                  
                  {renderDetailRow('State', responseData.state || 'N/A')}
                  
                  {renderDetailRow('Pincode', responseData.pincode || responseData.postalCode || 'N/A')}
                  
                  <div className="section-title">✅ Payment Status</div>
                  
                  {renderDetailRow('Status', 'SUCCESS')}
                  
                  {renderDetailRow('Message', responseData.message || 'Payment processed successfully')}
                </div>
              )}

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-house me-2"></i>Back to Home
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/donate')}>
                  <i className="fa-solid fa-heart me-2"></i>Donate Again
                </button>
              </div>

              <div className="receipt-info">
                <p>
                  <i className="fa-solid fa-envelope me-2 text-info"></i>
                  A receipt has been sent to your email address.
                </p>
              </div>
            </>
          )}

          {/* Failed State */}
          {isFailed && (
            <>
              <div className="status-icon failed">
                <i className="fa-solid fa-circle-xmark"></i>
              </div>
              <h1 className="status-title">Payment Failed ❌</h1>
              <p className="status-message">We couldn't process your payment. Please try again.</p>

              {responseData && (
                <div className="response-details">
                  <div className="section-title">💼 Transaction Details</div>
                  
                  {renderDetailRow('Order ID / Transaction ID', responseData.merchantTransactionId || responseData.merchantOrderNo || responseData.orderId || 'N/A')}
                  
                  {renderDetailRow('GetePay Transaction ID', responseData.getepayTxnId || responseData.txnId || responseData.transactionId || 'N/A')}
                  
                  {renderDetailRow('Merchant ID', responseData.mid || 'N/A')}
                  
                  {renderDetailRow('Transaction Date', responseData.transactionDate || responseData.txnDate || new Date().toLocaleString() || 'N/A')}
                  
                  {renderDetailRow('Amount Attempted', responseData.amount || responseData.txnAmount || 'N/A' ? `₹ ${responseData.amount || responseData.txnAmount}` : 'N/A')}
                  
                  <div className="section-title">👤 Donor Information</div>
                  
                  {renderDetailRow('Full Name', responseData.donor_name || responseData.customerName || responseData.name || 'N/A')}
                  
                  {renderDetailRow('Email Address', responseData.email || responseData.customerEmail || 'N/A')}
                  
                  {renderDetailRow('Phone Number', responseData.phone || responseData.customerPhone || responseData.mobileNumber || 'N/A')}
                  
                  <div className="section-title">❌ Failure Details</div>
                  
                  {renderDetailRow('Status', 'FAILED')}
                  
                  {renderDetailRow('Error Message', responseData.message || responseData.errorMessage || responseData.reason || 'Payment processing failed')}
                </div>
              )}

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-house me-2"></i>Back to Home
                </button>
                <button className="btn btn-danger" onClick={() => navigate('/donate')}>
                  <i className="fa-solid fa-arrow-rotate-left me-2"></i>Try Again
                </button>
              </div>
            </>
          )}

          {/* Pending State */}
          {isPending && (
            <>
              <div className="status-icon pending">
                <i className="fa-solid fa-hourglass-end"></i>
              </div>
              <h1 className="status-title">Payment Pending ⏳</h1>
              <p className="status-message">Your payment is being processed. Please wait...</p>

              {responseData && (
                <div className="response-details">
                  <div className="section-title">💼 Transaction Details</div>
                  
                  {renderDetailRow('Order ID / Transaction ID', responseData.merchantTransactionId || responseData.merchantOrderNo || responseData.orderId || 'N/A')}
                  
                  {renderDetailRow('GetePay Transaction ID', responseData.getepayTxnId || responseData.txnId || responseData.transactionId || 'N/A')}
                  
                  {renderDetailRow('Merchant ID', responseData.mid || 'N/A')}
                  
                  {renderDetailRow('Amount', responseData.amount || responseData.txnAmount || 'N/A' ? `₹ ${responseData.amount || responseData.txnAmount}` : 'N/A')}
                  
                  <div className="section-title">👤 Donor Information</div>
                  
                  {renderDetailRow('Full Name', responseData.donor_name || responseData.customerName || responseData.name || 'N/A')}
                  
                  {renderDetailRow('Email Address', responseData.email || responseData.customerEmail || 'N/A')}
                  
                  {renderDetailRow('Phone Number', responseData.phone || responseData.customerPhone || responseData.mobileNumber || 'N/A')}
                </div>
              )}

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-house me-2"></i>Back to Home
                </button>
              </div>

              <div className="receipt-info">
                <p>
                  <i className="fa-solid fa-info-circle me-2 text-warning"></i>
                  We'll notify you once your payment is confirmed.
                </p>
              </div>
            </>
          )}

          {/* Error State */}
          {!isSuccess && !isFailed && !isPending && (
            <>
              <div className="status-icon error">
                <i className="fa-solid fa-exclamation-triangle"></i>
              </div>
              <h1 className="status-title">Something Went Wrong 🚨</h1>
              <p className="status-message">Unable to process your request. Please contact support.</p>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <i className="fa-solid fa-house me-2"></i>Back to Home
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/donate')}>
                  <i className="fa-solid fa-redo me-2"></i>Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentResponse;
