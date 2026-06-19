import React, { useState, useEffect } from 'react';
import { HomeTab, CalendarTab, StudyTab, WorkTab, SettingsTab, Toast, useToast } from './components/Tabs';
import './index.css';

const TABS = [
  { id: 'home',     label: '홈',    icon: '🏠', sub: '오늘의 요약' },
  { id: 'calendar', label: '일정',  icon: '📅', sub: '캘린더 & 일정' },
  { id: 'study',    label: '순공',  icon: '⏱️', sub: '학습 타이머' },
  { id: 'work',     label: '근무',  icon: '💼', sub: '출퇴근 관리' },
  { id: 'settings', label: '설정',  icon: '⚙️', sub: '환경 설정' },
];

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];
const MON_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
function padZ(n) { return String(n).padStart(2, '0'); }

// ── Sidebar (desktop only) ────────────────────────────────
function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode, now }) {
  const h = padZ(now.getHours());
  const m = padZ(now.getMinutes());
  const s = padZ(now.getSeconds());
  const dateStr = `${now.getFullYear()}. ${MON_KR[now.getMonth()]} ${now.getDate()}일 (${DAY_KR[now.getDay()]})`;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Planor</div>
      <div className="sidebar-time">
        {h}:{m}<span className="sidebar-sec">:{s}</span>
      </div>
      <div className="sidebar-date">{dateStr}</div>

      <nav className="sidebar-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="sidebar-item-icon">{tab.icon}</span>
            <div>
              <div style={{ lineHeight: 1.2 }}>{tab.label}</div>
              <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.6, marginTop: 1 }}>{tab.sub}</div>
            </div>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-icon-btn" onClick={() => setDarkMode(d => !d)} title="다크 모드 토글">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </aside>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('planor-dark') === 'true'; } catch { return false; }
  });
  const [studySessions, setStudySessions] = useState(() => {
    try { const s = localStorage.getItem('planor-v2-study'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [workRecords] = useState(() => {
    try { const s = localStorage.getItem('planor-v2-work'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('planor-dark', String(darkMode)); } catch {}
  }, [darkMode]);

  const [toastMsg, showToast] = useToast();

  const timeStr = `${padZ(now.getHours())}:${padZ(now.getMinutes())}:${padZ(now.getSeconds())}`;
  const dateStr = `${MON_KR[now.getMonth()]} ${now.getDate()}일 (${DAY_KR[now.getDay()]})`;

  const activeTabData = TABS.find(t => t.id === activeTab);

  function renderTab() {
    switch (activeTab) {
      case 'home':     return <HomeTab studySessions={studySessions} workRecords={workRecords} />;
      case 'calendar': return <CalendarTab />;
      case 'study':    return <StudyTab onSessionSaved={setSessions => setStudySessions(setSessions)} />;
      case 'work':     return <WorkTab />;
      case 'settings': return <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} />;
      default:         return null;
    }
  }

  return (
    <div className="app-shell">
      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        now={now}
      />

      {/* ── Mobile top header (hidden on desktop via CSS) ── */}
      <header className="app-header">
        <div className="header-logo">Planor</div>
        <div className="header-center">
          <div className="header-live-time">{timeStr}</div>
          <div className="header-live-date">{dateStr}</div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setDarkMode(d => !d)} title="다크 모드">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="tab-content">
        <div className="desktop-content-wrap">
          <div className="desktop-page-header desktop-only">
            <div className="desktop-page-title">{activeTabData?.icon} {activeTabData?.label}</div>
            <div className="desktop-page-sub">{activeTabData?.sub}</div>
          </div>
          <div key={activeTab} className="tab-fade-in">
            {renderTab()}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tab nav (hidden on desktop via CSS) ── */}
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
