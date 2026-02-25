import React, { useState } from 'react';
import getepayPortal from '../../GetepayComponents';
import './JobApplicationPayment.css';

/**
 * 💳 Job Application Payment Component
 * Payment लेगा job application के बाद
 * ApplicationForm पहले application save करता है, फिर यह component payment handle करता है
 */

const JobApplicationPayment = ({ 
  jobRole, 
  jobTitle, 
  jobFee, // e.g., "100" (without ₹)
  applicantData, // Applicant का सभी data
  photoFile,
  applicantId, // Application का unique ID (पहले से save है)
  onPaymentSuccess, // Success होने पर callback
  onPaymentFailed   // Failed होने पर callback
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // जो fee दिया है उसे number में convert करो
  const feeAmount = parseFloat(jobFee.toString().replace(/[^\d.]/g, '') || 0);

  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      console.log('💳 Initiating payment for application:', applicantId);
      
      // Step 1: Generate Order ID for this payment
      const orderId = `APP_${applicantId}_${Date.now()}`;
      
      console.log('📝 Order ID for payment:', orderId);

      // Step 2: Payment initiate करो GetePay के साथ
      console.log('💳 Initiating payment...');

      // GetePay Configuration
      const config = {
        getepay_mid: import.meta.env.VITE_GETEPAY_MID || '108',
        getepay_terminal_id: import.meta.env.VITE_GETEPAY_TERMINAL_ID || 'Getepay.merchant61062@icici',
        getepay_keys: import.meta.env.VITE_GETEPAY_KEYS || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=',
        getepay_ivs: import.meta.env.VITE_GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==',
        getepay_url: import.meta.env.VITE_GETEPAY_URL || 'https://pay1.getepay.in:8443/getepayPortal/pg/v2/generateInvoice',
      };

      // Payment data
      const paymentData = {
        mid: config.getepay_mid,
        amount: feeAmount.toFixed(2),
        merchantTransactionId: orderId,
        transactionDate: new Date().toISOString(),
        terminalId: config.getepay_terminal_id,
        udf1: applicantData.mobileNo || '0000000000',
        udf2: applicantData.email || 'noemail@agaz.in',
        udf3: applicantData.fullName || 'Anonymous',
        udf4: jobTitle || 'Job Application',
        udf5: jobRole || '',
        udf6: applicantId || '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
        ru: `${apiUrl || 'http://localhost:5000'}/application-pgresponse`,
        callbackUrl: '',
        currency: 'INR',
        paymentMode: 'ALL',
        bankId: '455',
        txnType: 'single',
        productType: 'IPG',
        txnNote: `Job Application - ${jobTitle}`,
        vpa: config.getepay_terminal_id,
      };

      console.log('📤 Payment Data:', { orderId, amount: feeAmount, jobTitle, applicantId });

      // Window storage में data save करो तاकि payment success पर access कर सकें
      sessionStorage.setItem('jobPaymentData', JSON.stringify({
        orderId,
        applicantId,
        amount: feeAmount,
        jobRole,
        jobTitle
      }));

      // Step 3: GetePay payment portal open करो
      await getepayPortal(paymentData, config);
      
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      setErrorMsg(error.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
      onPaymentFailed && onPaymentFailed(error);
    }
  };

  return (
    <div className="job-application-payment">
      <div className="payment-card">
        <div className="payment-header">
          <h2>💼 Job Application Payment</h2>
          <p>Complete your payment to finalize your application</p>
        </div>

        <div className="job-details">
          <div className="detail-item">
            <span className="detail-label">Job Title:</span>
            <span className="detail-value">{jobTitle}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Applicant Name:</span>
            <span className="detail-value">{applicantData.fullName || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{applicantData.email || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{applicantData.mobileNo || 'N/A'}</span>
          </div>
        </div>

        <div className="payment-amount">
          <div className="amount-box">
            <span className="amount-label">Application Fee</span>
            <span className="amount-value">₹{feeAmount}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <i className="fa-solid fa-exclamation-circle"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handlePayment}>
          <button 
            type="submit" 
            className="btn-pay"
            disabled={loading || feeAmount <= 0}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock"></i> Pay ₹{feeAmount} & Submit Application
              </>
            )}
          </button>
        </form>

        <p className="payment-note">
          <i className="fa-solid fa-info-circle"></i>
          Your application form will be submitted after successful payment. Your data is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default JobApplicationPayment;
