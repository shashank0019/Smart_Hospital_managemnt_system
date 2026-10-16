import React, { useEffect, useState, useRef } from 'react';
import client, { API_BASE_URL } from '../../api/client';
import { io } from 'socket.io-client';
import TelemedicineRoom from '../telemedicine/TelemedicineRoom';
import { FaPhoneAlt, FaVideo, FaComments, FaAmbulance, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';
import './Dashboard.css';

const EmergencyDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatDoctor, setChatDoctor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [activeTelemedicine, setActiveTelemedicine] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await client.get('/api/doctors/emergency');
        setDoctors(res.data || []);
      } catch (err) {
        setError('Failed to fetch emergency physicians');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleOpenChat = (doctor) => {
    if (!userName) {
      setShowNamePrompt(true);
      setChatDoctor(doctor);
      return;
    }
    openChatWithDoctor(doctor);
  };

  const openChatWithDoctor = (doctor) => {
    setChatDoctor(doctor);
    setChatHistory([]);
    setChatMessage('');

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL);
    }

    socketRef.current.emit('joinRoom', { room: doctor.email });

    socketRef.current.off('chatHistory');
    socketRef.current.on('chatHistory', (history) => {
      setChatHistory(history || []);
    });

    socketRef.current.off('receiveMessage');
    socketRef.current.on('receiveMessage', (msg) => {
      setChatHistory((prev) => [...prev, msg]);
    });
  };

  const handleCloseChat = () => {
    setChatDoctor(null);
    setChatHistory([]);
    setChatMessage('');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && chatDoctor && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: chatDoctor.email,
        sender: userName || 'Emergency Caller',
        text: chatMessage,
        senderRole: 'guest'
      });
      setChatMessage('');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNamePrompt(false);
    if (chatDoctor) {
      openChatWithDoctor(chatDoctor);
    }
  };

  return (
    <div className="emergency-dashboard-container" style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
        color: '#fff',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(220, 38, 38, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '50%' }}>
            <FaAmbulance size={36} />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>24/7 Emergency Care Portal</h1>
            <p style={{ margin: '4px 0 0', fontSize: '15px', opacity: 0.9 }}>
              Immediate trauma support, on-call doctor video triage, and emergency first-aid protocols.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '12px 20px', borderRadius: '12px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hospital Trauma Hotline</span>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900 }}>📞 1800-123-4567</p>
        </div>
      </div>

      {/* First Aid Section */}
      <section className="first-aid-section" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaHeartbeat color="#ef4444" /> Urgent First Aid Protocols
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>CPR (Adult & Pediatric):</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              If unresponsive and not breathing, call emergency services immediately. Deliver 100-120 hard, fast chest compressions per minute to the center of chest.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>Severe Bleeding:</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Apply firm, direct pressure with a clean cloth or bandage. Elevate the wounded limb above heart level if no fractures are suspected.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0284c7' }}>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>Burns & Scalds:</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Hold burn under cool running water for at least 10-15 minutes. Never apply ice, butter, or toothpaste. Cover loosely with sterile dressing.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>Choking (Heimlich Maneuver):</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Stand behind person, place fist just above navel, grasp with other hand and give quick upward thrusts until airway is cleared.
            </p>
          </div>
        </div>
      </section>

      {/* On-Call Doctors Section */}
      <section className="urgent-doctors-section" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#0f172a' }}>On-Call Emergency Physicians</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Locating on-call doctors...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No on-call doctors listed currently. Call emergency hotline directly.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Dr. {doc.name}</h3>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
                    {doc.specialization}
                  </span>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569' }}>
                    Contact: <strong>{doc.contactNumber || 'Available On-Duty'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => setActiveTelemedicine(doc)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0d9488, #10b981)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FaVideo /> Video Consult
                  </button>

                  <button
                    onClick={() => handleOpenChat(doc)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#fff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <FaComments color="#0d9488" /> Urgent Chat
                  </button>

                  {doc.contactNumber && (
                    <a
                      href={`tel:${doc.contactNumber}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#ef4444',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <FaPhoneAlt /> Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Chat Name Prompt Modal */}
      {showNamePrompt && (
        <div className="chat-modal">
          <div className="chat-modal-content">
            <h3>Enter Your Name for Emergency Chat</h3>
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Your Name / Relative Name"
                required
                className="chat-input"
              />
              <button className="send-chat-btn" type="submit">Start Emergency Chat</button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Chat Modal */}
      {chatDoctor && !showNamePrompt && (
        <div className="chat-modal">
          <div className="chat-modal-content" style={{ borderRadius: '16px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Emergency Chat: Dr. {chatDoctor.name}</h3>
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>{chatDoctor.specialization}</span>
              </div>
              <span className="close-chat" onClick={handleCloseChat} style={{ cursor: 'pointer', fontSize: '24px' }}>&times;</span>
            </div>

            <div className="chat-history" style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px', background: '#f8fafc', borderRadius: '10px' }}>
              {chatHistory.map((msg, i) => {
                const isMe = msg.sender === userName || msg.senderRole === 'guest';
                return (
                  <div
                    key={i}
                    style={{
                      margin: '6px 0',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      maxWidth: '75%',
                      marginLeft: isMe ? 'auto' : '0',
                      background: isMe ? '#ef4444' : '#e2e8f0',
                      color: isMe ? '#fff' : '#0f172a',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 600 }}>{msg.sender}</div>
                    {msg.text}
                  </div>
                );
              })}
            </div>

            <div className="chat-input-row" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type emergency inquiry..."
                className="chat-input"
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button
                className="send-chat-btn"
                onClick={handleSendMessage}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telemedicine Video Consultation Room */}
      {activeTelemedicine && (
        <TelemedicineRoom
          roomName={`Emergency-${activeTelemedicine._id || 'Urgent'}`}
          doctorName={activeTelemedicine.name}
          patientName={userName || 'Emergency Patient'}
          onClose={() => setActiveTelemedicine(null)}
        />
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/" style={{ textDecoration: 'none', color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FaArrowLeft /> Back to Hospital Home
        </a>
      </div>
    </div>
  );
};

export default EmergencyDashboard;