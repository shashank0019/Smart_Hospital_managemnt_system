import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [authTest, setAuthTest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setTokenInfo({
          token: token.substring(0, 50) + '...',
          decoded: decoded,
          role: localStorage.getItem('role'),
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName')
        });
      } catch (err) {
        setError('Invalid token format');
      }
    } else {
      setError('No token found');
    }
  }, []);

  const testAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments/auth-test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthTest(response.data);
      setError('');
    } catch (err) {
      setError('Auth test failed: ' + (err.response?.data?.message || err.message));
      setAuthTest(null);
    }
  };

  const testDoctorsEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthTest({ ...authTest, doctors: response.data });
      setError('');
    } catch (err) {
      setError('Doctors endpoint failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>Token Debug Information</h3>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {tokenInfo && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Token Info:</h4>
          <pre style={{ backgroundColor: '#fff', padding: '10px', fontSize: '12px' }}>
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <button onClick={testAuth} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Test Authentication
        </button>
        <button onClick={testDoctorsEndpoint} style={{ padding: '5px 10px' }}>
          Test Doctors Endpoint
        </button>
      </div>

      {authTest && (
        <div>
          <h4>Auth Test Result:</h4>
          <pre style={{ backgroundColor: '#fff', padding: '10px', fontSize: '12px' }}>
            {JSON.stringify(authTest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TokenDebug;
