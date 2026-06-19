import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calendar, BookOpen, Clock, Play, Pause, RotateCcw, 
  HelpCircle, Eye, EyeOff, GraduationCap 
} from 'lucide-react';

export default function StudentWidgets({ 
  timetable, setTimetable, 
  dday, setDday, 
  flashcards, setFlashcards 
}) {
  // 1. Study Stopwatch States & Effects
  const [stopwatchSubject, setStopwatchSubject] = useState('프로그래밍');
  const [stopwatchTime, setStopwatchTime] = useState(0); // in seconds
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [subjectsList, setSubjectsList] = useState(['프로그래밍', '영어', '수학', '과학', '역사']);
  const [newSubject, setNewSubject] = useState('');
  const [studyRecords, setStudyRecords] = useState({
    '프로그래밍': 3600, // Pre-populated 1 hour
    '영어': 1800,
    '수학': 0
  });

  useEffect(() => {
    let interval = null;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
        setStudyRecords(prev => ({
          ...prev,
          [stopwatchSubject]: (prev[stopwatchSubject] || 0) + 1
        }));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning, stopwatchSubject]);

  const formatStopwatch = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    if (!subjectsList.includes(newSubject.trim())) {
      setSubjectsList([...subjectsList, newSubject.trim()]);
      setStudyRecords(prev => ({ ...prev, [newSubject.trim()]: 0 }));
    }
    setStopwatchSubject(newSubject.trim());
    setNewSubject('');
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  // 2. D-Day States & Live Countdown
  const [ddayName, setDdayName] = useState(dday.name || '기말고사');
  const [ddayTarget, setDdayTarget] = useState(dday.target || '2026-07-10T09:00');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(ddayTarget);
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, completed: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ddayTarget]);

  const handleSaveDday = (e) => {
    e.preventDefault();
    setDday({ name: ddayName, target: ddayTarget });
  };

  // 3. Timetable Cell Editing
  const [editingCell, setEditingCell] = useState(null); // { day, period }
  const [cellText, setCellText] = useState('');

  const daysOfWeek = ['월요일', '화요일', '수요일', '목요일', '금요일'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const handleEditCell = (day, period) => {
    setEditingCell({ day, period });
    setCellText(timetable[`${day}-${period}`] || '');
  };

  const handleSaveCell = () => {
    if (editingCell) {
      const key = `${editingCell.day}-${editingCell.period}`;
      setTimetable({
        ...timetable,
        [key]: cellText
      });
      setEditingCell(null);
    }
  };

  // 4. Flashcard States & Actions
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardFlipped, setCardFlipped] = useState({}); // { id: boolean }

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      front: cardFront,
      back: cardBack
    };

    setFlashcards([...flashcards, newCard]);
    setCardFront('');
    setCardBack('');
  };

  const toggleFlipCard = (id) => {
    setCardFlipped(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteCard = (id) => {
    setFlashcards(flashcards.filter(c => c.id !== id));
  };

  return (
    <div className="student-dashboard fade-in">
      <div className="desk-title">
        <GraduationCap size={24} />
        <h2>학습 데스크 (Student Desk)</h2>
      </div>

      <div className="student-grid">
        {/* D-Day Countdown Card */}
        <div className="card dday-card">
          <h3 className="widget-title">
            <Calendar size={18} />
            <span>시험 D-Day 카운트다운 (초 단위)</span>
          </h3>
          
          <form onSubmit={handleSaveDday} className="widget-form-inline">
            <input 
              type="text" 
              placeholder="목표명" 
              value={ddayName} 
              onChange={e => setDdayName(e.target.value)}
              className="input-field"
            />
            <input 
              type="datetime-local" 
              value={ddayTarget} 
              onChange={e => setDdayTarget(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary btn-sm">설정</button>
          </form>

          <div className="dday-display">
            <div className="dday-goal">{dday.name || '기말고사'}까지</div>
            {timeRemaining.completed ? (
              <div className="dday-completed neon-pulse">목표일 도래! 🎉</div>
            ) : (
              <div className="dday-countdown">
                <div className="dday-unit">
                  <span className="unit-number">{timeRemaining.days}</span>
                  <span className="unit-label">일 (Days)</span>
                </div>
                <div className="dday-unit">
                  <span className="unit-number">{String(timeRemaining.hours).padStart(2, '0')}</span>
                  <span className="unit-label">시</span>
                </div>
                <div className="dday-unit">
                  <span className="unit-number">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                  <span className="unit-label">분</span>
                </div>
                <div className="dday-unit highlight">
                  <span className="unit-number">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                  <span className="unit-label">초</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Study Stopwatch Card */}
        <div className="card stopwatch-card">
          <h3 className="widget-title">
            <Clock size={18} />
            <span>순공 과목별 스톱워치</span>
          </h3>

          <div className="stopwatch-container">
            <div className="subject-selector-area">
              <select 
                value={stopwatchSubject} 
                onChange={(e) => {
                  setStopwatchSubject(e.target.value);
                  handleResetStopwatch();
                }}
                className="input-field select-field"
              >
                {subjectsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <form onSubmit={handleAddSubject} className="add-subject-form">
                <input 
                  type="text" 
                  placeholder="새 과목" 
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="btn"><Plus size={16} /></button>
              </form>
            </div>

            <div className="stopwatch-timer">
              <div className="timer-text">{formatStopwatch(stopwatchTime)}</div>
              <div className="subject-total">
                오늘 누적: {formatStopwatch(studyRecords[stopwatchSubject] || 0)}
              </div>
            </div>

            <div className="stopwatch-controls">
              <button 
                onClick={() => setStopwatchRunning(!stopwatchRunning)} 
                className={`btn ${stopwatchRunning ? 'btn-danger' : 'btn-primary'}`}
              >
                {stopwatchRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{stopwatchRunning ? '일시정지' : '학습시작'}</span>
              </button>
              <button onClick={handleResetStopwatch} className="btn">
                <RotateCcw size={16} />
                <span>리셋</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Card */}
        <div className="card timetable-card">
          <h3 className="widget-title">
            <BookOpen size={18} />
            <span>나의 주간 시간표</span>
          </h3>
          <div className="timetable-wrapper">
            <table className="timetable">
              <thead>
                <tr>
                  <th>교시</th>
                  {daysOfWeek.map(d => <th key={d}>{d.substring(0,2)}</th>)}
                </tr>
              </thead>
              <tbody>
                {periods.map(period => (
                  <tr key={period}>
                    <td className="period-num">{period}교시</td>
                    {daysOfWeek.map(day => {
                      const cellKey = `${day}-${period}`;
                      const isEditing = editingCell?.day === day && editingCell?.period === period;
                      return (
                        <td 
                          key={day} 
                          onClick={() => !isEditing && handleEditCell(day, period)}
                          className={`timetable-cell ${timetable[cellKey] ? 'has-class' : ''}`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={cellText}
                              onChange={e => setCellText(e.target.value)}
                              onBlur={handleSaveCell}
                              onKeyDown={e => e.key === 'Enter' && handleSaveCell()}
                              className="cell-input"
                              autoFocus
                            />
                          ) : (
                            timetable[cellKey] || '+'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flashcards Card */}
        <div className="card flashcards-card">
          <h3 className="widget-title">
            <HelpCircle size={18} />
            <span>암기용 플래시카드</span>
          </h3>

          <form onSubmit={handleAddCard} className="widget-form-inline">
            <input 
              type="text" 
              placeholder="단어/개념" 
              value={cardFront}
              onChange={e => setCardFront(e.target.value)}
              className="input-field"
            />
            <input 
              type="text" 
              placeholder="설명/뜻" 
              value={cardBack}
              onChange={e => setCardBack(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary"><Plus size={16} /></button>
          </form>

          <div className="flashcards-deck">
            {flashcards.length === 0 ? (
              <div className="empty-deck">등록된 플래시 카드가 없습니다.</div>
            ) : (
              flashcards.map(card => {
                const flipped = cardFlipped[card.id];
                return (
                  <div 
                    key={card.id} 
                    className={`flashcard ${flipped ? 'flipped' : ''}`}
                    onClick={() => toggleFlipCard(card.id)}
                  >
                    <div className="card-inner">
                      <div className="card-front">
                        <span className="card-tag">Q.</span>
                        <p className="card-text">{card.front}</p>
                        <div className="card-hint"><Eye size={12} /> 클릭해서 확인</div>
                      </div>
                      <div className="card-back">
                        <span className="card-tag">A.</span>
                        <p className="card-text">{card.back}</p>
                        <div className="card-hint"><EyeOff size={12} /> 클릭해서 가리기</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(card.id);
                      }} 
                      className="delete-card-btn"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .student-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .desk-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #3b82f6; /* Student Blue */
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
          padding-bottom: 0.5rem;
        }

        .student-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .student-grid {
            grid-template-columns: 1fr;
          }
        }

        .widget-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-main);
        }

        .widget-form-inline {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        /* D-Day Countdown styles */
        .dday-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: var(--bg-input);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .dday-goal {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .dday-countdown {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .dday-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          background: var(--bg-panel);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          min-width: 55px;
        }

        .dday-unit.highlight {
          border-color: var(--accent);
          background: var(--accent-bg);
        }

        .unit-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .dday-unit.highlight .unit-number {
          color: var(--accent);
        }

        .unit-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
          font-weight: 600;
        }

        .dday-completed {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--accent);
        }

        /* Study Stopwatch styles */
        .stopwatch-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .subject-selector-area {
          display: flex;
          gap: 0.5rem;
        }

        .select-field {
          flex: 1;
        }

        .add-subject-form {
          display: flex;
          gap: 0.25rem;
        }

        .stopwatch-timer {
          text-align: center;
          padding: 0.75rem;
          background: var(--bg-input);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .timer-text {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: 0.05rem;
        }

        .subject-total {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          font-weight: 600;
        }

        .stopwatch-controls {
          display: flex;
          gap: 0.5rem;
        }

        .stopwatch-controls button {
          flex: 1;
        }

        /* Timetable styles */
        .timetable-wrapper {
          overflow-x: auto;
        }

        .timetable {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: center;
          border-radius: 8px;
          overflow: hidden;
        }

        .timetable th, .timetable td {
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.25rem;
          min-width: 40px;
        }

        .timetable th {
          background: var(--bg-input);
          font-weight: 700;
          color: var(--text-main);
        }

        .period-num {
          font-weight: 700;
          background: var(--bg-input);
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .timetable-cell {
          cursor: pointer;
          background: var(--bg-panel);
          transition: all 0.2s;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .timetable-cell:hover {
          background: var(--accent-bg);
          color: var(--accent);
        }

        .timetable-cell.has-class {
          background: var(--accent-bg);
          color: var(--accent);
          font-weight: 700;
        }

        .cell-input {
          width: 100%;
          border: none;
          background: transparent;
          text-align: center;
          font-family: inherit;
          font-weight: bold;
          color: var(--accent);
          outline: none;
        }

        /* Flashcard styles */
        .flashcards-deck {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .empty-deck {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .flashcard {
          position: relative;
          height: 70px;
          perspective: 1000px;
          cursor: pointer;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
          transform-style: preserve-3d;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .flashcard.flipped .card-inner {
          transform: rotateX(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          border-radius: 8px;
          background: var(--bg-input);
        }

        .card-back {
          transform: rotateX(180deg);
          background: var(--accent-bg);
          color: var(--accent);
        }

        .card-tag {
          font-weight: 800;
          margin-right: 0.5rem;
          font-size: 1.1rem;
        }

        .card-text {
          font-weight: 700;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 70%;
        }

        .card-hint {
          margin-left: auto;
          font-size: 0.65rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }

        .delete-card-btn {
          position: absolute;
          top: 0.35rem;
          right: 0.35rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
        }

        .flashcard:hover .delete-card-btn {
          opacity: 0.8;
        }

        .delete-card-btn:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
