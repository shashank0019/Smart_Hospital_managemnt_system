import React, { useState } from 'react';
import { FaRobot, FaStethoscope, FaExclamationTriangle, FaHeartbeat, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const COMMON_SYMPTOMS = [
  'Chest Pain / Tightness',
  'Shortness of Breath',
  'High Fever (>102°F)',
  'Severe Headache / Migraine',
  'Persistent Cough',
  'Abdominal Pain / Cramps',
  'Skin Rash / Itching',
  'Joint Pain / Swelling',
  'Dizziness / Vertigo',
  'Ear Pain / Discharge',
  'Extreme Fatigue / Weakness',
  'Anxiety / Panic / Insomnia'
];

const SymptomChecker = ({ onSelectSpecialist }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [duration, setDuration] = useState('1-3 days');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0 && !customInput.trim()) {
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    // AI Medical Triage Simulation Engine
    setTimeout(() => {
      const allSymptoms = [...selectedSymptoms];
      if (customInput.trim()) allSymptoms.push(customInput.trim());

      const sText = allSymptoms.join(' ').toLowerCase();

      let urgency = 'Routine';
      let urgencyColor = '#10b981';
      let recommendedSpecialist = 'General Physician';
      let clinicalNotes = '';
      let immediateAdvice = '';

      if (sText.includes('chest pain') || sText.includes('shortness of breath') || sText.includes('tightness')) {
        urgency = 'Emergency';
        urgencyColor = '#ef4444';
        recommendedSpecialist = 'Cardiologist';
        clinicalNotes = 'Symptoms suggest potential cardiovascular or acute respiratory involvement. Requires immediate professional medical evaluation.';
        immediateAdvice = 'Rest in a comfortable position, avoid exertion. If chest pressure radiates to the left arm or jaw, seek urgent emergency care immediately.';
      } else if (sText.includes('headache') || sText.includes('dizziness') || sText.includes('vertigo')) {
        urgency = 'Urgent';
        urgencyColor = '#f59e0b';
        recommendedSpecialist = 'Neurologist';
        clinicalNotes = 'Neurological evaluation indicated to rule out migraine complications, vestibular dysfunction, or intracranial pressure variations.';
        immediateAdvice = 'Stay hydrated, rest in a quiet and dim environment, and avoid bright screens until evaluated.';
      } else if (sText.includes('skin') || sText.includes('rash') || sText.includes('itching')) {
        urgency = 'Routine';
        urgencyColor = '#0d9488';
        recommendedSpecialist = 'Dermatologist';
        clinicalNotes = 'Dermatological symptoms consistent with acute dermatitis, allergic reaction, or fungal/bacterial skin irritation.';
        immediateAdvice = 'Avoid scratching or harsh soaps. Keep the area clean and apply a cold damp compress if irritated.';
      } else if (sText.includes('joint') || sText.includes('swelling') || sText.includes('bone') || sText.includes('back')) {
        urgency = 'Urgent';
        urgencyColor = '#f59e0b';
        recommendedSpecialist = 'Orthopedic';
        clinicalNotes = 'Musculoskeletal findings indicating possible joint inflammation, ligament sprain, or degenerative arthropathy.';
        immediateAdvice = 'Follow R.I.C.E protocol (Rest, Ice, Compression, Elevation). Avoid heavy lifting.';
      } else if (sText.includes('ear') || sText.includes('throat') || sText.includes('tonsil')) {
        urgency = 'Routine';
        urgencyColor = '#0d9488';
        recommendedSpecialist = 'ENT Specialist';
        clinicalNotes = 'Upper respiratory or otolaryngologic inflammation. May require otoscopic examination.';
        immediateAdvice = 'Gargle with warm salt water and avoid inserting cotton buds into the ear canal.';
      } else if (sText.includes('cough') || sText.includes('breath') || sText.includes('fever') || sText.includes('cold')) {
        urgency = 'Urgent';
        urgencyColor = '#f59e0b';
        recommendedSpecialist = 'Pulmonologist';
        clinicalNotes = 'Respiratory infection or bronchospasm. Monitoring oxygen levels and lung auscultation advised.';
        immediateAdvice = 'Inhale warm steam, drink warm fluids, and isolate if feverish.';
      } else {
        urgency = 'Routine';
        urgencyColor = '#0d9488';
        recommendedSpecialist = 'General Physician';
        clinicalNotes = 'Constitutional symptoms that benefit from an initial comprehensive physical checkup and routine baseline blood work.';
        immediateAdvice = 'Maintain proper hydration, balanced nutrition, and record your temperature twice daily.';
      }

      setAnalysisResult({
        urgency,
        urgencyColor,
        recommendedSpecialist,
        clinicalNotes,
        immediateAdvice,
        analyzedSymptoms: allSymptoms
      });
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <span style={{
          background: 'linear-gradient(135deg, #0d9488, #0284c7)',
          padding: '10px 12px',
          borderRadius: '12px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaRobot size={22} />
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>
            AI Health Triage & Specialist Recommender
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Select your symptoms for an intelligent medical triage assessment and specialist recommendation.
          </p>
        </div>
      </div>

      <form onSubmit={handleAnalyze}>
        {/* Symptom Selection Chips */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Common Symptoms (click to select):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMMON_SYMPTOMS.map((sym) => {
              const active = selectedSymptoms.includes(sym);
              return (
                <button
                  type="button"
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: active ? '1px solid #0d9488' : '1px solid #cbd5e1',
                    background: active ? '#ccfbf1' : '#f8fafc',
                    color: active ? '#0f766e' : '#334155',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {active ? '✓ ' : '+ '} {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom text & duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Other symptoms or details:
            </label>
            <input
              type="text"
              placeholder="e.g. sharp lower right stomach pain, nausea"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Duration:
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                background: '#fff',
                boxSizing: 'border-box'
              }}
            >
              <option value="< 24 hours">Under 24 hours</option>
              <option value="1-3 days">1 - 3 days</option>
              <option value="1-2 weeks">1 - 2 weeks</option>
              <option value="> 1 month">Over a month</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Age (Optional):
            </label>
            <input
              type="number"
              placeholder="e.g. 28"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={analyzing || (selectedSymptoms.length === 0 && !customInput.trim())}
          style={{
            background: 'linear-gradient(135deg, #0d9488, #0284c7)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: analyzing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
            opacity: (selectedSymptoms.length === 0 && !customInput.trim()) ? 0.6 : 1
          }}
        >
          <FaStethoscope /> {analyzing ? 'AI Clinical Analysis in progress...' : 'Analyze Symptoms & Recommend Specialist'}
        </button>
      </form>

      {/* AI Results Card */}
      {analysisResult && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          borderRadius: '12px',
          background: '#f8fafc',
          border: `1.5px solid ${analysisResult.urgencyColor}`,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaHeartbeat color={analysisResult.urgencyColor} size={20} />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                AI Triage Assessment
              </h3>
            </div>
            <span style={{
              background: analysisResult.urgencyColor,
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Urgency: {analysisResult.urgency}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
            <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Recommended Specialist
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>
                Dr. Specialist ({analysisResult.recommendedSpecialist})
              </p>
            </div>

            <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Immediate Self-Care Guidance
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                {analysisResult.immediateAdvice}
              </p>
            </div>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
            <strong>Clinical Reasoning:</strong> {analysisResult.clinicalNotes}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onSelectSpecialist && onSelectSpecialist(analysisResult.recommendedSpecialist)}
              style={{
                background: '#0d9488',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Book with a {analysisResult.recommendedSpecialist} <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
