import GcmPgEncryption from './components/encryptEas';
import decryptEas from './components/decryptEas';

const getepayPortal = async (data, config) => {
  try {
    const iv = config.getepay_ivs;
    const ivKey = config.getepay_keys;

    // Encrypt data
    const gcm = new GcmPgEncryption(iv, ivKey);
    const ciphertext = await gcm.encryptWithMKeys(JSON.stringify(data));

    const raw = JSON.stringify({
      mid: data.mid,
      req: ciphertext,
      terminalId: data.terminalId,
    });

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
      redirect: 'follow',
    };

    // Call GetePay API
    const response = await fetch(config.getepay_url, requestOptions);
    const resultText = await response.text();
    const raw_result = JSON.parse(resultText);
    const responseData = raw_result.response;

    // Decrypt response
    const decryptedJson = await decryptEas(responseData, iv, ivKey);
    const decrypted_response = JSON.parse(decryptedJson);

   
    
    // Redirect to GetePay payment portal
    window.location.href = decrypted_response.paymentUrl;
  } catch (error) {
    console.error(' Payment Error:', error);
    alert('Payment initiation failed: ' + error.message);
  }
};

export default getepayPortal;
