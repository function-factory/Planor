import React, { useState, useEffect, useRef } from 'react';

// ── Utility ──────────────────────────────────────────────
const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function padZ(n) { return String(n).padStart(2, '0'); }
function fmtSec(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${padZ(h)}:${padZ(m)}:${padZ(s)}`;
  return `${padZ(m)}:${padZ(s)}`;
}
function fmtHM(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  if (m > 0) return `${m}분`;
  return `${secs}초`;
}
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  const set = (v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [val, set];
}

// ── Toast ─────────────────────────────────────────────────
// ── Toss-style Divider ───────────────────────────────────
export function TossDivider({ color }) {
  return (
    <div className="toss-divider">
      <div className="toss-div-main" style={color ? { background: color } : {}} />
      <div className="toss-div-sub" style={color ? { background: color } : {}} />
    </div>
  );
}

export function Toast({ msg }) {
  return <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>;
}
export function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };
  return [msg, show];
}

// ── Modal Sheet ───────────────────────────────────────────
export function ModalSheet({ open, onClose, title, children }) {
  return (
    <>
      <div className={`modal-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <div className={`modal-sheet ${open ? 'show' : ''}`}>
        <div className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </>
  );
}

// ── HOME TAB ─────────────────────────────────────────────
export function HomeTab({ studySessions, workRecords }) {
  const now = useNow();
  const dayName = DAYS_KR[now.getDay()];
  const dateStr = `${now.getFullYear()}년 ${MONTHS_KR[now.getMonth()]} ${now.getDate()}일 (${dayName})`;
  const timeStr = `${padZ(now.getHours())}:${padZ(now.getMinutes())}`;
  const secStr = padZ(now.getSeconds());

  // Compute today's study/rest/work totals
  const todayKey = now.toLocaleDateString('sv');
  const todaySessions = studySessions.filter(s => s.date === todayKey);
  const totalStudy = todaySessions.reduce((a, s) => a + (s.studyTime || 0), 0);
  const totalRest = todaySessions.reduce((a, s) => a + (s.restTime || 0), 0);

  const todayWork = workRecords.filter(w => w.date === todayKey);
  const totalWork = todayWork.reduce((a, w) => a + (w.duration || 0), 0);

  const totalAll = totalStudy + totalRest + totalWork;
  const studyPct = totalAll ? Math.round((totalStudy / totalAll) * 100) : 0;
  const restPct = totalAll ? Math.round((totalRest / totalAll) * 100) : 0;
  const workPct = totalAll ? Math.round((totalWork / totalAll) * 100) : 0;

  // Time segments for color timeline (simplified 24-hour view)
  const segments = [];
  todaySessions.forEach(s => {
    if (s.startEpoch) {
      const startMin = Math.floor((s.startEpoch - new Date(todayKey).getTime()) / 60000);
      const studyMin = Math.floor(s.studyTime / 60);
      const restMin = Math.floor(s.restTime / 60);
      segments.push({ start: startMin, dur: studyMin, color: 'var(--accent)' });
      if (restMin > 0) segments.push({ start: startMin + studyMin, dur: restMin, color: 'var(--green)' });
    }
  });

  return (
    <div className="fade-up">
      {/* Big Clock */}
      <div className="section" style={{ paddingTop: 16 }}>
        <div className="card clock-display" style={{ padding: '28px 20px 20px' }}>
          <div className="clock-time">
            {timeStr}<span className="clock-sec">:{secStr}</span>
          </div>
          <div className="clock-date">{dateStr}</div>
        </div>
      </div>

      {/* Today summary */}
      <div className="section">
        <div className="section-title">오늘 활동 요약 <TossDivider /></div>
        <div className="stat-row">
          <div className="stat-pill">
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{fmtHM(totalStudy)}</div>
            <div className="stat-label">📚 순공 시간</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{fmtHM(totalRest)}</div>
            <div className="stat-label">😴 휴식 시간</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: 'var(--purple)' }}>{fmtHM(totalWork)}</div>
            <div className="stat-label">💼 근무 시간</div>
          </div>
        </div>
      </div>

      {/* Color Timeline */}
      <div className="section">
        <div className="section-title">오늘의 타임라인 <TossDivider /></div>
        <div className="card">
          {/* 24-hour proportional bar */}
          <div style={{ display: 'flex', gap: 4, height: 12, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)', marginBottom: 12 }}>
            {studyPct > 0 && <div style={{ width: `${studyPct}%`, background: 'var(--accent)', borderRadius: '4px 0 0 4px', transition: 'width 0.6s' }} />}
            {restPct > 0 && <div style={{ width: `${restPct}%`, background: 'var(--green)', transition: 'width 0.6s' }} />}
            {workPct > 0 && <div style={{ width: `${workPct}%`, background: 'var(--purple)', transition: 'width 0.6s' }} />}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />공부 {studyPct}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} />휴식 {restPct}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--purple)', display: 'inline-block' }} />근무 {workPct}%
            </span>
          </div>
          {totalAll === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 8, paddingTop: 8 }}>
              아직 오늘의 활동이 기록되지 않았어요 🌱
            </div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      {todaySessions.length > 0 && (
        <div className="section">
          <div className="section-title">오늘의 세션</div>
          <div className="card" style={{ padding: '8px 16px' }}>
            {todaySessions.slice(-3).reverse().map((s, i) => (
              <div key={i} className="event-item">
                <div className="event-color-bar" style={{ background: 'var(--accent)' }} />
                <div className="event-content">
                  <div className="event-title">{s.subject || '과목 미지정'}</div>
                  <div className="event-time">공부 {fmtHM(s.studyTime || 0)} · 휴식 {fmtHM(s.restTime || 0)}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtHM((s.studyTime || 0) + (s.restTime || 0))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CALENDAR TAB ──────────────────────────────────────────
const EVENT_COLORS = ['#3182F6','#0DC07B','#F04452','#FF8A00','#7B5CF0','#FFD600','#00BCD4','#E91E63'];

export function CalendarTab() {
  const [events, setEvents] = useLS('planor-v2-events', []);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  // form state
  const [fTitle, setFTitle] = useState('');
  const [fColor, setFColor] = useState(EVENT_COLORS[0]);
  const [fStartTime, setFStartTime] = useState('09:00');
  const [fEndTime, setFEndTime] = useState('10:00');
  const [fMemo, setFMemo] = useState('');

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = now.toLocaleDateString('sv');

  function dateKey(y, m, d) {
    return `${y}-${padZ(m + 1)}-${padZ(d)}`;
  }

  function eventsOn(y, m, d) {
    const k = dateKey(y, m, d);
    return events.filter(e => e.date === k);
  }

  const selectedEvents = selectedDate ? eventsOn(viewYear, viewMonth, selectedDate) : [];

  function openAdd() {
    setEditEvent(null);
    setFTitle(''); setFColor(EVENT_COLORS[0]);
    setFStartTime('09:00'); setFEndTime('10:00'); setFMemo('');
    setModalOpen(true);
  }

  function openEdit(ev) {
    setEditEvent(ev);
    setFTitle(ev.title); setFColor(ev.color);
    setFStartTime(ev.startTime || '09:00');
    setFEndTime(ev.endTime || '10:00');
    setFMemo(ev.memo || '');
    setModalOpen(true);
  }

  function saveEvent() {
    if (!fTitle.trim() || !selectedDate) return;
    const ev = {
      id: editEvent?.id || Date.now(),
      date: dateKey(viewYear, viewMonth, selectedDate),
      title: fTitle.trim(),
      color: fColor,
      startTime: fStartTime,
      endTime: fEndTime,
      memo: fMemo.trim(),
    };
    if (editEvent) {
      setEvents(events.map(e => e.id === editEvent.id ? ev : e));
    } else {
      setEvents([...events, ev]);
    }
    setModalOpen(false);
  }

  function deleteEvent(id) {
    setEvents(events.filter(e => e.id !== id));
    setModalOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevDays - firstDay + 1 + i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });

  return (
    <div className="fade-up">
      <div className="section" style={{ paddingTop: 16 }}>
        {/* Month nav */}
        <div className="cal-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <div className="cal-month">{viewYear}년 {MONTHS_KR[viewMonth]}</div>
          <button className="cal-nav" onClick={nextMonth}>›</button>
        </div>

        {/* Weekday headers */}
        <div className="cal-grid">
          {['일','월','화','수','목','금','토'].map(d => (
            <div key={d} className="cal-weekday" style={{ color: d === '일' ? 'var(--red)' : d === '토' ? 'var(--accent)' : undefined }}>{d}</div>
          ))}
          {cells.map((c, i) => {
            const evs = c.cur ? eventsOn(viewYear, viewMonth, c.day) : [];
            const k = c.cur ? dateKey(viewYear, viewMonth, c.day) : '';
            const isToday = k === todayStr;
            const isSel = c.cur && selectedDate === c.day;
            const col = i % 7;
            return (
              <div
                key={i}
                className={`cal-day ${!c.cur ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSel && !isToday ? 'selected' : ''} ${col === 0 ? 'sun' : ''} ${col === 6 ? 'sat' : ''}`}
                onClick={() => { if (c.cur) setSelectedDate(c.day); }}
              >
                <div className="cal-day-num">{c.day}</div>
                <div className="cal-dots">
                  {evs.slice(0, 3).map((e, j) => (
                    <div key={j} className="cal-dot" style={{ background: e.color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              {viewMonth + 1}월 {selectedDate}일 일정
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ 추가</button>
          </div>
          <div className="card" style={{ padding: selectedEvents.length ? '8px 16px' : '20px' }}>
            {selectedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                등록된 일정이 없어요. + 추가를 눌러보세요!
              </div>
            ) : selectedEvents.sort((a,b) => a.startTime?.localeCompare(b.startTime)).map(ev => (
              <div key={ev.id} className="event-item" onClick={() => openEdit(ev)} style={{ cursor: 'pointer' }}>
                <div className="event-color-bar" style={{ background: ev.color }} />
                <div className="event-content">
                  <div className="event-title">{ev.title}</div>
                  <div className="event-time">{ev.startTime} ~ {ev.endTime} {ev.memo && `· ${ev.memo}`}</div>
                </div>
                <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <ModalSheet open={modalOpen} onClose={() => setModalOpen(false)} title={editEvent ? '일정 수정' : '일정 추가'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="input-label">일정 제목 *</div>
            <div className="input-wrap">
              <input placeholder="예: 수학 시험, 팀 미팅" value={fTitle} onChange={e => setFTitle(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="input-label">시작</div>
              <div className="input-wrap"><input type="time" value={fStartTime} onChange={e => setFStartTime(e.target.value)} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="input-label">종료</div>
              <div className="input-wrap"><input type="time" value={fEndTime} onChange={e => setFEndTime(e.target.value)} /></div>
            </div>
          </div>
          <div>
            <div className="input-label">메모</div>
            <div className="input-wrap">
              <input placeholder="선택 사항" value={fMemo} onChange={e => setFMemo(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="input-label">색상</div>
            <div className="color-picker" style={{ marginTop: 6 }}>
              {EVENT_COLORS.map(c => (
                <div key={c} className={`color-dot ${fColor === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setFColor(c)} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {editEvent && (
              <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(editEvent.id)}>삭제</button>
            )}
            <button className="btn btn-primary btn-full" onClick={saveEvent}>
              {editEvent ? '수정 완료' : '추가하기'}
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}

// ── STUDY TAB ─────────────────────────────────────────────
const TRACK_FIELDS = [
  { id: 'subject', label: '과목명', emoji: '📚', required: true },
  { id: 'studyTime', label: '공부 시간 (타이머)', emoji: '⏱️', required: true },
  { id: 'restTime', label: '휴식 시간', emoji: '😴' },
  { id: 'place', label: '장소', emoji: '📍' },
  { id: 'focus', label: '집중도 (별점)', emoji: '⭐' },
  { id: 'memo', label: '메모', emoji: '📝' },
];

const TIMER_MODES = [
  { id: 'stopwatch', label: '스톱워치' },
  { id: 'pomodoro', label: '뽀모도로 (25+5)' },
  { id: 'custom', label: '커스텀' },
];

const SUBJECT_COLORS = ['var(--accent)', 'var(--green)', 'var(--orange)', 'var(--purple)', 'var(--red)', 'var(--teal, #00BCD4)'];
const SUBJECTS_DEFAULT = ['수학', '영어', '국어', '과학', '역사'];

export function StudyTab({ onSessionSaved }) {
  const [sessions, setSessions] = useLS('planor-v2-study', []);
  const [fields, setFields] = useLS('planor-v2-study-fields', ['subject','studyTime','restTime','focus']);
  const [timerMode, setTimerMode] = useLS('planor-v2-timer-mode', 'stopwatch');
  const [subjects, setSubjects] = useLS('planor-v2-subjects', SUBJECTS_DEFAULT);

  // Active session state
  const [phase, setPhase] = useState('idle'); // idle | study | rest | done
  const [studyElapsed, setStudyElapsed] = useState(0);
  const [restElapsed, setRestElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  // Form values
  const [selSubject, setSelSubject] = useState('수학');
  const [newSubject, setNewSubject] = useState('');
  const [customMin, setCustomMin] = useState(30);
  const [place, setPlace] = useState('');
  const [focus, setFocus] = useState(3);
  const [memo, setMemo] = useState('');
  const [sessionStart, setSessionStart] = useState(null);

  const [configOpen, setConfigOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [toastMsg, showToast] = useToast();

  // Pomodoro durations
  const POMO_STUDY = 25 * 60;
  const POMO_REST = 5 * 60;
  const CUSTOM_DUR = customMin * 60;

  const timerDuration = timerMode === 'pomodoro' ? POMO_STUDY : timerMode === 'custom' ? CUSTOM_DUR : null;
  const restDuration = timerMode === 'pomodoro' ? POMO_REST : null;

  const studyProgress = timerDuration ? Math.min(studyElapsed / timerDuration, 1) : null;
  const restProgress = restDuration ? Math.min(restElapsed / restDuration, 1) : null;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (phase === 'study') {
          setStudyElapsed(e => {
            const next = e + 1;
            if (timerDuration && next >= timerDuration) {
              // auto switch to rest
              setPhase('rest');
              setRunning(timerMode === 'pomodoro');
            }
            return next;
          });
        } else if (phase === 'rest') {
          setRestElapsed(e => {
            const next = e + 1;
            if (restDuration && next >= restDuration) {
              setRunning(false);
              setPhase('done');
            }
            return next;
          });
        }
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase, timerDuration, restDuration, timerMode]);

  function startStudy() {
    setPhase('study');
    setStudyElapsed(0);
    setRestElapsed(0);
    setRunning(true);
    setSessionStart(Date.now());
  }

  function togglePause() { setRunning(r => !r); }

  function switchToRest() {
    setPhase('rest');
    setRunning(true);
  }

  function saveSession() {
    const now = new Date();
    const session = {
      id: Date.now(),
      date: now.toLocaleDateString('sv'),
      startEpoch: sessionStart,
      subject: fields.includes('subject') ? selSubject : undefined,
      studyTime: studyElapsed,
      restTime: fields.includes('restTime') ? restElapsed : 0,
      place: fields.includes('place') ? place : undefined,
      focus: fields.includes('focus') ? focus : undefined,
      memo: fields.includes('memo') ? memo : undefined,
    };
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    onSessionSaved(newSessions);
    setPhase('idle');
    setRunning(false);
    setStudyElapsed(0);
    setRestElapsed(0);
    setMemo('');
    showToast(`✅ ${fmtHM(session.studyTime)} 세션 저장 완료!`);
  }

  function resetSession() {
    setPhase('idle');
    setRunning(false);
    setStudyElapsed(0);
    setRestElapsed(0);
  }

  function deleteSession(id) {
    setSessions(s => s.filter(x => x.id !== id));
  }

  function toggleField(fid) {
    if (TRACK_FIELDS.find(f => f.id === fid)?.required) return;
    setFields(f => f.includes(fid) ? f.filter(x => x !== fid) : [...f, fid]);
  }

  // Subject stats
  const todayKey = new Date().toLocaleDateString('sv');
  const todaySessions = sessions.filter(s => s.date === todayKey);
  const subjectStats = {};
  todaySessions.forEach(s => {
    if (!s.subject) return;
    subjectStats[s.subject] = (subjectStats[s.subject] || 0) + (s.studyTime || 0);
  });
  const maxSubjectTime = Math.max(...Object.values(subjectStats), 1);

  // Pomodoro ring
  const ringR = 80;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="fade-up">
      {/* Config bar */}
      <div className="section" style={{ paddingTop: 16 }}>
        {/* Section Header with settings button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>타이머 설정 <TossDivider /></div>
          <button
            className="study-cfg-btn"
            onClick={() => setConfigOpen(true)}
            title="기록 항목 설정"
          >
            🎛️ 기록 설정
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {TIMER_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setTimerMode(m.id); resetSession(); }}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                background: timerMode === m.id ? 'var(--accent)' : 'var(--bg-input)',
                color: timerMode === m.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
              }}
            >{m.label}</button>
          ))}
        </div>

        {timerMode === 'custom' && phase === 'idle' && (
          <div style={{ marginBottom: 12 }}>
            <div className="input-label">목표 시간 (분)</div>
            <div className="input-wrap">
              <input type="number" min={1} max={480} value={customMin}
                onChange={e => setCustomMin(Number(e.target.value))} />
            </div>
          </div>
        )}

        {/* Subject selector */}
        {fields.includes('subject') && phase === 'idle' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div className="input-label" style={{ marginBottom: 0 }}>과목 선택</div>
              <button className="btn btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => setSubjectOpen(true)}>관리</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {subjects.map(s => (
                <button key={s} onClick={() => setSelSubject(s)} style={{
                  padding: '8px 16px', borderRadius: 100,
                  background: selSubject === s ? 'var(--accent)' : 'var(--bg-input)',
                  color: selSubject === s ? '#fff' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Place */}
        {fields.includes('place') && phase === 'idle' && (
          <div style={{ marginBottom: 12 }}>
            <div className="input-label">장소</div>
            <div className="input-wrap">
              <input placeholder="도서관, 카페, 집..." value={place} onChange={e => setPlace(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="section">
        <div className="card" style={{ padding: '28px 20px 20px' }}>
          {/* Pomodoro ring or simple display */}
          {(timerMode === 'pomodoro' || timerMode === 'custom') && phase !== 'idle' ? (
            <div className="pomo-ring-container" style={{ height: 200 }}>
              <svg width={200} height={200} viewBox="0 0 200 200">
                <circle cx={100} cy={100} r={ringR} fill="none" stroke="var(--bg-input)" strokeWidth={10} />
                <circle cx={100} cy={100} r={ringR} fill="none"
                  stroke={phase === 'rest' ? 'var(--green)' : 'var(--accent)'}
                  strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringC * (1 - (phase === 'rest' ? (restProgress ?? 0) : (studyProgress ?? 0)))}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <div className="pomo-center">
                <div style={{ fontSize: 11, fontWeight: 700, color: phase === 'rest' ? 'var(--green)' : 'var(--accent)', marginBottom: 4 }}>
                  {phase === 'rest' ? '휴식 중' : '집중 중'}
                </div>
                <div className="study-timer-big" style={{ fontSize: 36 }}>
                  {fmtSec(phase === 'rest' ? restElapsed : studyElapsed)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {phase === 'rest'
                    ? (restDuration ? `/ ${fmtSec(restDuration)}` : '자유 휴식')
                    : (timerDuration ? `/ ${fmtSec(timerDuration)}` : '')
                  }
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: phase === 'rest' ? 'var(--green)' : phase === 'done' ? 'var(--orange)' : 'var(--text-muted)' }}>
                {phase === 'idle' ? '준비' : phase === 'study' ? '⏱ 집중 중' : phase === 'rest' ? '😴 휴식 중' : '✅ 세션 완료'}
              </div>
              <div className="study-timer-big">
                {phase === 'idle' ? '00:00' : phase === 'rest' ? fmtSec(restElapsed) : fmtSec(studyElapsed)}
              </div>
              {phase === 'study' && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                  총 공부: {fmtHM(studyElapsed)}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {phase === 'idle' && (
              <button className="btn btn-primary btn-full" onClick={startStudy}>🚀 공부 시작</button>
            )}
            {(phase === 'study' || phase === 'rest') && (
              <>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={togglePause}>
                  {running ? '⏸ 일시정지' : '▶ 재개'}
                </button>
                {phase === 'study' && (
                  <button className="btn btn-sm" style={{ background: 'var(--green-light)', color: 'var(--green)' }} onClick={switchToRest}>
                    😴 휴식
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={resetSession}>✕</button>
              </>
            )}
            {phase === 'done' && (
              <button className="btn btn-primary btn-full" onClick={saveSession}>💾 세션 저장</button>
            )}
          </div>

          {/* If study phase, show save button too */}
          {(phase === 'study' || phase === 'rest') && studyElapsed > 0 && (
            <button className="btn btn-secondary btn-full" style={{ marginTop: 8 }} onClick={saveSession}>
              💾 지금 저장하기
            </button>
          )}

          {/* Focus & memo after study started */}
          {(phase === 'study' || phase === 'rest' || phase === 'done') && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.includes('focus') && (
                <div>
                  <div className="input-label">집중도</div>
                  <div className="stars">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className="star" onClick={() => setFocus(n)}
                        style={{ opacity: n <= focus ? 1 : 0.3 }}>⭐</span>
                    ))}
                  </div>
                </div>
              )}
              {fields.includes('memo') && (
                <div>
                  <div className="input-label">메모</div>
                  <div className="input-wrap">
                    <input placeholder="오늘의 학습 메모..." value={memo} onChange={e => setMemo(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subject stats */}
      {Object.keys(subjectStats).length > 0 && (
        <div className="section">
          <div className="section-title">과목별 순공시간 <TossDivider color="var(--green)" /></div>
          <div className="card">
            {Object.entries(subjectStats).sort((a,b) => b[1]-a[1]).map(([sub, secs], i) => (
              <div key={sub} className="subject-bar-row">
                <div className="subject-bar-label">{sub}</div>
                <div className="subject-bar-track">
                  <div className="subject-bar-fill"
                    style={{ width: `${Math.round((secs/maxSubjectTime)*100)}%`, background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                </div>
                <div className="subject-bar-time">{fmtHM(secs)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="section">
          <div className="section-title">최근 세션 기록 <TossDivider /></div>
          {sessions.slice(0, 10).map(s => (
            <div key={s.id} className="session-card">
              <div className="icon-card-sm ic-blue">📚</div>
              <div className="session-info">
                <div className="session-subject">{s.subject || '과목 미지정'}</div>
                <div className="session-meta">
                  <span>📅 {s.date}</span>
                  {s.place && <span>📍 {s.place}</span>}
                  {s.focus && <span>{'⭐'.repeat(s.focus)}</span>}
                  {s.memo && <span>📝 {s.memo}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="session-time-big">{fmtHM(s.studyTime || 0)}</div>
                {s.restTime > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>휴식 {fmtHM(s.restTime)}</div>}
                <button onClick={() => deleteSession(s.id)} style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Field config modal */}
      <ModalSheet open={configOpen} onClose={() => setConfigOpen(false)} title="기록할 항목 설정">
        <div className="check-list">
          {TRACK_FIELDS.map(f => (
            <div key={f.id} className="check-item" onClick={() => toggleField(f.id)}>
              <div className={`check-box ${fields.includes(f.id) ? 'checked' : ''}`}>
                {fields.includes(f.id) && '✓'}
              </div>
              <span className="check-text">{f.emoji} {f.label}</span>
              {f.required && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>필수</span>}
            </div>
          ))}
        </div>
      </ModalSheet>

      {/* Subject manage modal */}
      <ModalSheet open={subjectOpen} onClose={() => setSubjectOpen(false)} title="과목 관리">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="input-wrap">
            <input placeholder="새 과목 추가..." value={newSubject} onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newSubject.trim()) {
                setSubjects([...subjects, newSubject.trim()]); setNewSubject('');
              }}}
            />
            <button onClick={() => { if (newSubject.trim()) { setSubjects([...subjects, newSubject.trim()]); setNewSubject(''); } }}
              style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15, background: 'none', border: 'none', cursor: 'pointer' }}>추가</button>
          </div>
          {subjects.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>{s}</span>
              <button onClick={() => setSubjects(subjects.filter((_, j) => j !== i))}
                style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>삭제</button>
            </div>
          ))}
        </div>
      </ModalSheet>

      <Toast msg={toastMsg} />
    </div>
  );
}

// ── WORK TAB ──────────────────────────────────────────────
export function WorkTab() {
  const now = useNow();
  const todayKey = now.toLocaleDateString('sv');
  const [workLogs, setWorkLogs] = useLS('planor-v2-work', []);
  const [clockedIn, setClockedIn] = useLS('planor-v2-clockin', null); // epoch ms
  const [workElapsed, setWorkElapsed] = useState(0);
  const [toastMsg, showToast] = useToast();
  const [projectModal, setProjectModal] = useState(false);
  const [projects, setProjects] = useLS('planor-v2-projects', ['개발', '기획', '디자인', '회의', '기타']);
  const [selProject, setSelProject] = useState('개발');
  const [newProject, setNewProject] = useState('');
  const [workMemo, setWorkMemo] = useState('');

  useEffect(() => {
    if (!clockedIn) return;
    const t = setInterval(() => {
      setWorkElapsed(Math.floor((Date.now() - clockedIn) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [clockedIn]);

  // Initialize elapsed from clockedIn on mount
  useEffect(() => {
    if (clockedIn) setWorkElapsed(Math.floor((Date.now() - clockedIn) / 1000));
  }, []);

  function clockIn() {
    setClockedIn(Date.now());
    setWorkElapsed(0);
    showToast('🏢 출근 기록 완료!');
  }

  function clockOut() {
    if (!clockedIn) return;
    const duration = Math.floor((Date.now() - clockedIn) / 1000);
    const inDate = new Date(clockedIn);
    const log = {
      id: Date.now(),
      date: todayKey,
      inTime: `${padZ(inDate.getHours())}:${padZ(inDate.getMinutes())}`,
      outTime: `${padZ(now.getHours())}:${padZ(now.getMinutes())}`,
      duration,
      project: selProject,
      memo: workMemo.trim(),
    };
    setWorkLogs([log, ...workLogs]);
    setClockedIn(null);
    setWorkElapsed(0);
    setWorkMemo('');
    showToast(`👋 퇴근! 근무 ${fmtHM(duration)} 기록 완료`);
  }

  const todayLogs = workLogs.filter(l => l.date === todayKey);
  const totalToday = todayLogs.reduce((a, l) => a + l.duration, 0);
  const WORK_STANDARD = 8 * 3600;
  const overTime = Math.max(totalToday - WORK_STANDARD, 0);

  // Monthly summary
  const thisMonth = now.toLocaleDateString('sv').slice(0, 7);
  const monthLogs = workLogs.filter(l => l.date.startsWith(thisMonth));
  const monthTotal = monthLogs.reduce((a, l) => a + l.duration, 0);
  const workDays = new Set(monthLogs.map(l => l.date)).size;

  // Project stats
  const projStats = {};
  todayLogs.forEach(l => { projStats[l.project] = (projStats[l.project] || 0) + l.duration; });

  return (
    <div className="fade-up">
      {/* Status card */}
      <div className="section" style={{ paddingTop: 16 }}>
        <div className="work-status-card">
          <div className="label">{clockedIn ? '🟢 근무 중' : '⚪ 오늘 총 근무'}</div>
          <div className="value">
            {clockedIn ? fmtSec(workElapsed) : fmtHM(totalToday)}
          </div>
          <div className="sublabel">
            {clockedIn
              ? `출근: ${new Date(clockedIn).toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })}`
              : overTime > 0 ? `초과근무 ${fmtHM(overTime)}` : '8시간 기준'
            }
          </div>
        </div>

        {/* Project selector */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="input-label" style={{ marginBottom: 0 }}>업무 프로젝트</div>
            <button className="btn btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setProjectModal(true)}>관리</button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {projects.map(p => (
              <button key={p} onClick={() => setSelProject(p)} style={{
                padding: '6px 14px', borderRadius: 100,
                background: selProject === p ? 'var(--purple)' : 'var(--bg-input)',
                color: selProject === p ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div className="input-wrap" style={{ marginBottom: 12 }}>
          <input placeholder="업무 메모 (선택)" value={workMemo} onChange={e => setWorkMemo(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!clockedIn ? (
            <button className="btn btn-green btn-full" style={{ fontSize: 16, padding: '16px' }} onClick={clockIn}>
              🏢 출근 기록
            </button>
          ) : (
            <button className="btn btn-danger btn-full" style={{ fontSize: 16, padding: '16px' }} onClick={clockOut}>
              🏠 퇴근 기록
            </button>
          )}
        </div>
      </div>

      {/* Today stats */}
      <div className="section">
        <div className="section-title">오늘 근무 현황 <TossDivider color="var(--purple)" /></div>
        <div className="stat-row">
          <div className="stat-pill">
            <div className="stat-value">{fmtHM(totalToday)}</div>
            <div className="stat-label">총 근무</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: overTime ? 'var(--red)' : 'var(--green)' }}>
              {overTime ? `+${fmtHM(overTime)}` : fmtHM(Math.max(WORK_STANDARD - totalToday, 0))}
            </div>
            <div className="stat-label">{overTime ? '초과근무' : '잔여근무'}</div>
          </div>
        </div>

        {Object.keys(projStats).length > 0 && (
          <div className="card" style={{ padding: '14px 16px' }}>
            {Object.entries(projStats).sort((a,b)=>b[1]-a[1]).map(([p,secs]) => (
              <div key={p} className="subject-bar-row">
                <div className="subject-bar-label">{p}</div>
                <div className="subject-bar-track">
                  <div className="subject-bar-fill" style={{ width: `${Math.round((secs/totalToday)*100)}%`, background: 'var(--purple)' }} />
                </div>
                <div className="subject-bar-time">{fmtHM(secs)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly stats */}
      <div className="section">
        <div className="section-title">{now.getMonth() + 1}월 근무 요약</div>
        <div className="stat-row">
          <div className="stat-pill">
            <div className="stat-value">{workDays}일</div>
            <div className="stat-label">출근일</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value">{fmtHM(monthTotal)}</div>
            <div className="stat-label">총 근무시간</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value">{workDays ? fmtHM(Math.floor(monthTotal / workDays)) : '-'}</div>
            <div className="stat-label">일 평균</div>
          </div>
        </div>
      </div>

      {/* Log table */}
      {todayLogs.length > 0 && (
        <div className="section">
          <div className="section-title">오늘 근무 로그</div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="work-table">
              <thead>
                <tr>
                  <th>출근</th><th>퇴근</th><th>시간</th><th>프로젝트</th>
                </tr>
              </thead>
              <tbody>
                {todayLogs.map(l => (
                  <tr key={l.id}>
                    <td>{l.inTime}</td>
                    <td>{l.outTime}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmtHM(l.duration)}</td>
                    <td>
                      <span className="tag" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>{l.project}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project manage modal */}
      <ModalSheet open={projectModal} onClose={() => setProjectModal(false)} title="프로젝트 관리">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="input-wrap">
            <input placeholder="새 프로젝트 추가..." value={newProject} onChange={e => setNewProject(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newProject.trim()) {
                setProjects([...projects, newProject.trim()]); setNewProject('');
              }}}
            />
            <button onClick={() => { if (newProject.trim()) { setProjects([...projects, newProject.trim()]); setNewProject(''); } }}
              style={{ color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>추가</button>
          </div>
          {projects.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>{p}</span>
              <button onClick={() => setProjects(projects.filter((_, j) => j !== i))}
                style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>삭제</button>
            </div>
          ))}
        </div>
      </ModalSheet>

      <Toast msg={toastMsg} />
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────────
export function SettingsTab({ darkMode, setDarkMode, showToast }) {
  const keys = [
    'planor-v2-events','planor-v2-study','planor-v2-work',
    'planor-v2-subjects','planor-v2-projects','planor-v2-study-fields',
    'planor-v2-timer-mode','planor-v2-clockin',
  ];

  function clearCache() {
    if (!window.confirm('모든 데이터를 초기화하시겠습니까?\n(일정, 순공 기록, 근무 기록이 모두 삭제됩니다)')) return;
    keys.forEach(k => localStorage.removeItem(k));
    showToast('🗑️ 캐시 및 데이터 초기화 완료');
    setTimeout(() => window.location.reload(), 800);
  }

  const version = '2.0.0';

  return (
    <div className="fade-up">
      <div className="section" style={{ paddingTop: 16 }}>
        <div className="section-title">외관 <TossDivider /></div>
        <div className="card">
          <div className="setting-row">
            <div>
              <div className="setting-label">🌙 다크 모드</div>
              <div className="setting-desc">어두운 배경으로 눈을 보호해요</div>
            </div>
            <div className={`toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(d => !d)} />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">데이터 <TossDivider color="var(--red)" /></div>
        <div className="card">
          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div className="setting-label">🗑️ 전체 데이터 초기화</div>
              <div className="setting-desc">모든 일정·순공·근무 기록이 삭제됩니다. 되돌릴 수 없어요.</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={clearCache}>초기화 실행</button>
          </div>
          <div className="setting-row">
            <div>
              <div className="setting-label">💾 LocalStorage 사용</div>
              <div className="setting-desc">브라우저 저장소에 자동 보관</div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>활성화</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">앱 정보 <TossDivider color="var(--text-muted)" /></div>
        <div className="card">
          <div className="setting-row">
            <div className="setting-label">버전</div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>v{version}</span>
          </div>
          <div className="setting-row">
            <div className="setting-label">도메인</div>
            <a href="https://planor.kro.kr" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>planor.kro.kr</a>
          </div>
          <div className="setting-row" style={{ borderBottom: 'none' }}>
            <div className="setting-label">GitHub</div>
            <a href="https://github.com/function-factory/Planor" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>function-factory/Planor</a>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>Planor</div>
        <div>© 2025 Planor · function-factory. All rights reserved.</div>
        <div style={{ marginTop: 4, opacity: 0.6 }}>planor.kro.kr</div>
      </div>
    </div>
  );
}
