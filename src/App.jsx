import React, { useState, useEffect } from 'react';
import { HomeTab, CalendarTab, StudyTab, WorkTab, SettingsTab, Toast, useToast } from './components/Tabs';
import './index.css';

const TABS = [
  { id: 'home',     label: '홈',    icon: '🏠' },
  { id: 'calendar', label: '일정',  icon: '📅' },
  { id: 'study',    label: '순공',  icon: '⏱️' },
  { id: 'work',     label: '근무',  icon: '💼' },
  { id: 'settings', label: '설정',  icon: '⚙️' },
];

function padZ(n) { return String(n).padStart(2, '0'); }

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('planor-dark') === 'true'; } catch { return false; }
  });
  const [studySessions, setStudySessions] = useState(() => {
    try { const s = localStorage.getItem('planor-v2-study'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [workRecords, setWorkRecords] = useState(() => {
    try { const s = localStorage.getItem('planor-v2-work'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Live time for header
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('planor-dark', String(darkMode)); } catch {}
  }, [darkMode]);

  const [toastMsg, showToast] = useToast();

  const headerTimeStr = `${padZ(now.getHours())}:${padZ(now.getMinutes())}:${padZ(now.getSeconds())}`;

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-logo">Planor</div>
        <div className="header-live-time">{headerTimeStr}</div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setDarkMode(d => !d)} title="다크 모드 토글">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="tab-content">
        {activeTab === 'home' && (
          <HomeTab studySessions={studySessions} workRecords={workRecords} />
        )}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'study' && (
          <StudyTab onSessionSaved={(sessions) => setStudySessions(sessions)} />
        )}
        {activeTab === 'work' && <WorkTab />}
        {activeTab === 'settings' && (
          <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} />
        )}
      </div>

      {/* ── Bottom Tab Nav ── */}
      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <Toast msg={toastMsg} />
    </div>
  );
}
