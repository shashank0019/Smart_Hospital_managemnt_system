import React, { useState } from 'react';
import { FaVideo, FaPhoneSlash, FaCopy, FaCheck } from 'react-icons/fa';

const TelemedicineRoom = ({ roomName, doctorName, patientName, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate safe sanitized room identifier
  const cleanRoom = (roomName || 'Hospital-Consultation').replace(/[^a-zA-Z0-9-_]/g, '-');
  const jitsiUrl = `https://meet.jit.si/SmartHospital-${cleanRoom}#config.startWithAudioMuted=false&config.prejoinPageEnabled=false`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(jitsiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 100000,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1e293b',
        padding: '12px 24px',
        borderRadius: '12px',
        marginBottom: '12px',
        color: '#f8fafc',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #0d9488, #10b981)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <FaVideo size={18} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>
              Virtual Telemedicine Consultation
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Doctor: <strong>Dr. {doctorName || 'Specialist'}</strong> | Patient: <strong>{patientName || 'Patient'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#334155',
              border: 'none',
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            {copied ? <FaCheck color="#10b981" /> : <FaCopy />}
            {copied ? 'Link Copied!' : 'Copy Meeting Link'}
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <FaPhoneSlash /> End Call
          </button>
        </div>
      </div>

      {/* Video Container Frame */}
      <div style={{
        flex: 1,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        background: '#000',
        position: 'relative'
      }}>
        <iframe
          src={jitsiUrl}
          title="Telemedicine Virtual Consultation"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
        />
      </div>
    </div>
  );
};

export default TelemedicineRoom;
