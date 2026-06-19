import React, { useState, useEffect } from 'react';
import ClockWidget from './components/ClockWidget';
import ThemeSelector from './components/ThemeSelector';
import HierarchicalPlanner from './components/HierarchicalPlanner';
import StudentWidgets from './components/StudentWidgets';
import OfficeWidgets from './components/OfficeWidgets';
import { CalendarRange, ShieldAlert, Sparkles } from 'lucide-react';

// --- Premium Pre-populated Demo Data ---
const demoPlans = [
  {
    id: 'demo-plan-y',
    text: '2026년 목표: 자기계발 및 고부가가치 플래너 웹 프로젝트 완성',
    level: 0,
    completed: false,
    expanded: true,
    children: [
      {
        id: 'demo-plan-m',
        text: '6월 목표: 초정밀 다차원 테마 플래너 개발 완료',
        level: 1,
        completed: false,
        expanded: true,
        children: [
          {
            id: 'demo-plan-w',
            text: '3주차: 코어 컴포넌트 설계, 테마 시스템 및 위젯 통합',
            level: 2,
            completed: false,
            expanded: true,
            children: [
              {
                id: 'demo-plan-d',
                text: '6월 19일: 플래너 완성 및 실시간 기능 검증',
                level: 3,
                completed: false,
                expanded: true,
                children: [
                  {
                    id: 'demo-plan-h',
                    text: '16:00 ~ 18:00: 레이아웃 고도화 및 CSS 테마 보완',
                    level: 4,
                    completed: false,
                    expanded: true,
                    children: [
                      {
                        id: 'demo-plan-mi',
                        text: '12분: 뽀모도로 타이머 작동 및 암기 카드 테스트',
                        level: 5,
                        completed: false,
                        expanded: true,
                        children: [
                          {
                            id: 'demo-plan-s',
                            text: '30초: D-Day 초 단위 카운트다운 잔여 시간 오차 점검',
                            level: 6,
                            completed: true,
                            expanded: true,
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const demoTimetable = {
  '월요일-1': '국어',
  '월요일-2': '수학',
  '화요일-3': '영어',
  '수요일-4': '과학',
  '금요일-1': '프로그래밍'
};

const demoDday = {
  name: '2학기 중간고사',
  target: '2026-09-25T09:00'
};

const demoFlashcards = [
  { id: 'fc-1', front: 'Vite', back: '빠른 빌드를 지원하는 차세대 프론트엔드 도구' },
  { id: 'fc-2', front: 'Vanilla CSS', back: '라이브러리 없이 테마 변수와 CSS Grid/Flex를 활용한 스타일링' }
];

const demoEisenhower = {
  iu: [{ id: 'es-1', text: '기획서 초안 발송', completed: false }],
  inu: [{ id: 'es-2', text: '제품 메뉴얼 보완', completed: false }],
  niu: [{ id: 'es-3', text: '메일 보관함 정리', completed: true }],
  ninu: [{ id: 'es-4', text: '바탕화면 불필요 파일 삭제', completed: false }]
};

const demoKanban = [
  { id: 'kb-1', text: '보고서 최종 검수', status: 'todo' },
  { id: 'kb-2', text: '디자인 피드백 반영', status: 'progress' },
  { id: 'kb-3', text: '서버 빌드 확인', status: 'done' }
];

const demoMemo = `💡 오늘의 업무 브리핑\n• 오전: 다차원 플래너 레이아웃 및 폰트 연동 테스트\n• 오후: 피드백 반영 및 디버깅\n\n📌 알림: 초 단위 D-Day 카운트다운의 동기화 상태 다시 한번 검증할 것.`;


export default function App() {
  // Load initial state from LocalStorage or fallback to Demo Data
  const [theme, setTheme] = useState(() => localStorage.getItem('planor-theme') || 'modern-light');
  const [font, setFont] = useState(() => localStorage.getItem('planor-font') || 'sans');
  const [mode, setMode] = useState(() => localStorage.getItem('planor-mode') || 'student');
  
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('planor-plans');
    return saved ? JSON.parse(saved) : demoPlans;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('planor-timetable');
    return saved ? JSON.parse(saved) : demoTimetable;
  });

  const [dday, setDday] = useState(() => {
    const saved = localStorage.getItem('planor-dday');
    return saved ? JSON.parse(saved) : demoDday;
  });

  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('planor-flashcards');
    return saved ? JSON.parse(saved) : demoFlashcards;
  });

  const [eisenhower, setEisenhower] = useState(() => {
    const saved = localStorage.getItem('planor-eisenhower');
    return saved ? JSON.parse(saved) : demoEisenhower;
  });

  const [kanban, setKanban] = useState(() => {
    const saved = localStorage.getItem('planor-kanban');
    return saved ? JSON.parse(saved) : demoKanban;
  });

  const [memoText, setMemoText] = useState(() => {
    return localStorage.getItem('planor-memo') || demoMemo;
  });

  // Sync state changes with LocalStorage
  useEffect(() => {
    localStorage.setItem('planor-theme', theme);
    localStorage.setItem('planor-font', font);
    localStorage.setItem('planor-mode', mode);
    localStorage.setItem('planor-plans', JSON.stringify(plans));
    localStorage.setItem('planor-timetable', JSON.stringify(timetable));
    localStorage.setItem('planor-dday', JSON.stringify(dday));
    localStorage.setItem('planor-flashcards', JSON.stringify(flashcards));
    localStorage.setItem('planor-eisenhower', JSON.stringify(eisenhower));
    localStorage.setItem('planor-kanban', JSON.stringify(kanban));
    localStorage.setItem('planor-memo', memoText);
  }, [theme, font, mode, plans, timetable, dday, flashcards, eisenhower, kanban, memoText]);

  // Apply Theme and Font classes directly to HTML body
  useEffect(() => {
    // Clear previous theme and font classes
    document.body.className = '';
    
    // Add current theme class
    const themeClass = `theme-${theme}`;
    document.body.classList.add(themeClass);
    
    // Add current font class
    const fontClass = `font-class-${font}`;
    document.body.classList.add(fontClass);
  }, [theme, font]);

  const handleClearAll = () => {
    if (window.confirm("정말로 모든 계획 데이터를 초기화하시겠습니까? (테마/모드는 유지됩니다)")) {
      setPlans([]);
      setTimetable({});
      setDday({ name: '', target: '' });
      setFlashcards([]);
      setEisenhower({ iu: [], inu: [], niu: [], ninu: [] });
      setKanban([]);
      setMemoText('');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header Panel */}
      <header className="header-panel fade-in">
        <div className="brand-section">
          <div className="logo-wrapper">
            <CalendarRange size={28} className="logo-icon animate-bounce-slow" />
            <h1>Planor</h1>
          </div>
          <p>연-월-주-일-시-분-초 단계별 정밀 다차원 플래너</p>
        </div>
        
        <div className="header-controls">
          <div className="mode-indicator">
            <span className={`indicator-dot ${mode === 'student' ? 'student' : 'office'}`}></span>
            <span className="indicator-text">
              {mode === 'student' ? 'STUDENT DESK' : 'OFFICE BOARD'}
            </span>
          </div>
          <button onClick={handleClearAll} className="btn btn-danger">
            데이터 전체 초기화
          </button>
        </div>
      </header>

      {/* Grid containing Clock Widget and Theme Selector */}
      <section className="top-widgets-row">
        <div className="clock-col">
          <ClockWidget theme={theme} />
        </div>
        <div className="selector-col">
          <ThemeSelector 
            theme={theme} 
            setTheme={setTheme}
            font={font} 
            setFont={setFont}
            mode={mode} 
            setMode={setMode}
          />
        </div>
      </section>

      {/* Main planner and sub-widgets grid layout */}
      <main className="widgets-grid">
        <div className="main-planner-area">
          <HierarchicalPlanner plans={plans} setPlans={setPlans} />
        </div>
        
        <div className="sub-widgets-area">
          {mode === 'student' ? (
            <StudentWidgets 
              timetable={timetable} 
              setTimetable={setTimetable}
              dday={dday} 
              setDday={setDday}
              flashcards={flashcards} 
              setFlashcards={setFlashcards}
            />
          ) : (
            <OfficeWidgets 
              eisenhower={eisenhower} 
              setEisenhower={setEisenhower}
              kanban={kanban} 
              setKanban={setKanban}
              memoText={memoText} 
              setMemoText={setMemoText}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 Planor Planner. Built with premium web aesthetics.</p>
      </footer>

      <style jsx="true">{`
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .logo-icon {
          color: var(--accent);
        }

        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mode-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-input);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.05rem;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .indicator-dot.student {
          background-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }

        .indicator-dot.office {
          background-color: #8b5cf6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
        }

        .indicator-text {
          color: var(--text-main);
        }

        .top-widgets-row {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .top-widgets-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .app-footer {
          text-align: center;
          padding: 2rem 0 1rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          border-top: 1px solid var(--border-color);
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
