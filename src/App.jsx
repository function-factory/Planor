import React, { useState, useEffect } from 'react';
import { HomeTab, CalendarTab, StudyTab, WorkTab, SettingsTab, Toast, useToast, ModalSheet } from './components/Tabs';
import MusicWidget from './components/MusicWidget';
import ThemeSelector from '././components/ThemeSelector';
import ClockWidget from '././components/ClockWidget';
import StudentWidgets from '././components/StudentWidgets';
import OfficeWidgets from '././components/OfficeWidgets';
import HierarchicalPlanner from '././components/HierarchicalPlanner';
import './index.css';

// Local storage helper
function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : def;
    } catch {
      return def;
    }
  });
  const update = (next) => {
    try {
      const v = typeof next === 'function' ? next(val) : next;
      setVal(v);
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {
      console.error(e);
    }
  };
  return [val, update];
}

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];
const MON_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
function padZ(n) { return String(n).padStart(2, '0'); }

// ── Sidebar (desktop only) ────────────────────────────────
function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode, now, activeTabs }) {
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
        {activeTabs.map(tab => (
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

      <MusicWidget />

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
  const [musicOpen, setMusicOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('planor-dark') === 'true'; } catch { return false; }
  });

  // Global Themes & Modes State
  const [theme, setTheme] = useLS('planor-v3-theme', 'modern-light');
  const [font, setFont] = useLS('planor-v3-font', 'sans');
  const [mode, setMode] = useLS('planor-v3-desk-mode', 'student');

  // Dashboard shared states
  const [timetable, setTimetable] = useLS('planor-v3-timetable', {});
  const [dday, setDday] = useLS('planor-v3-dday', { name: '기말고사', target: '2026-07-10T09:00' });
  const [flashcards, setFlashcards] = useLS('planor-v3-flashcards', []);

  const [eisenhower, setEisenhower] = useLS('planor-v3-eisenhower', { iu: [], inu: [], niu: [], ninu: [] });
  const [kanban, setKanban] = useLS('planor-v3-kanban', []);
  const [memoText, setMemoText] = useLS('planor-v3-memo', '');

  const [plans, setPlans] = useLS('planor-v3-plans', []);

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

  // Sync ClassName (Theme & Font & DarkMode)
  useEffect(() => {
    const themeClass = `theme-${theme}`;
    const fontClass = `font-class-${font}`;
    document.documentElement.className = `${themeClass} ${fontClass} ${darkMode ? 'dark' : ''}`;
    try { localStorage.setItem('planor-dark', String(darkMode)); } catch {}
  }, [theme, font, darkMode]);

  const [toastMsg, showToast] = useToast();

  const timeStr = `${padZ(now.getHours())}:${padZ(now.getMinutes())}:${padZ(now.getSeconds())}`;
  const dateStr = `${MON_KR[now.getMonth()]} ${now.getDate()}일 (${DAY_KR[now.getDay()]})`;

  // Dynamic Tabs Configuration
  const activeTabs = [
    { id: 'home',     label: '홈',    icon: '🏠', sub: '오늘의 요약' },
    { id: 'calendar', label: '일정',  icon: '📅', sub: '캘린더 & 일정' },
    mode === 'student'
      ? { id: 'student', label: '학습', icon: '🎓', sub: '학습 대시보드' }
      : { id: 'office',  label: '오피스', icon: '💼', sub: '근무 대시보드' },
    { id: 'planner',  label: '계획',  icon: '🎯', sub: '트리 계획표' },
    { id: 'settings', label: '설정',  icon: '⚙️', sub: '환경 설정' },
  ];

  const activeTabData = activeTabs.find(t => t.id === activeTab);

  // Auto fallback active tab if mode toggled
  useEffect(() => {
    if (activeTab === 'student' && mode !== 'student') {
      setActiveTab('office');
    } else if (activeTab === 'office' && mode !== 'office') {
      setActiveTab('student');
    }
  }, [mode, activeTab]);

  function renderTab() {
    switch (activeTab) {
      case 'home':
        return <HomeTab studySessions={studySessions} workRecords={workRecords} theme={theme} />;
      case 'calendar':
        return <CalendarTab />;
      case 'student':
        return (
          <StudentWidgets 
            timetable={timetable} 
            setTimetable={setTimetable}
            dday={dday}
            setDday={setDday}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
          />
        );
      case 'office':
        return (
          <OfficeWidgets
            eisenhower={eisenhower}
            setEisenhower={setEisenhower}
            kanban={kanban}
            setKanban={setKanban}
            memoText={memoText}
            setMemoText={setMemoText}
          />
        );
      case 'planner':
        return <HierarchicalPlanner plans={plans} setPlans={setPlans} />;
      case 'settings':
        return (
          <SettingsTab
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            showToast={showToast}
            theme={theme}
            setTheme={setTheme}
            font={font}
            setFont={setFont}
            mode={mode}
            setMode={setMode}
          />
        );
      default:
        return null;
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
        activeTabs={activeTabs}
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
        {activeTabs.map(tab => (
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

      {/* Mobile Floating Music Player button */}
      <div className="mobile-only floating-music-btn" onClick={() => setMusicOpen(true)} title="뮤직 플레이어 열기">
        🎵
      </div>

      {/* Mobile Music Player Modal Sheet */}
      <ModalSheet open={musicOpen} onClose={() => setMusicOpen(false)} title="뮤직 플레이어">
        <MusicWidget isMobile={true} />
      </ModalSheet>
    </div>
  );
}
