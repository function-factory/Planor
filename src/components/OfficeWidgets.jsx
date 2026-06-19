import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, CheckCircle, Circle, ArrowLeft, ArrowRight, 
  Briefcase, Copy, FileText, Check, AlertTriangle, Play, Pause, RotateCcw,
  Clock
} from 'lucide-react';

export default function OfficeWidgets({
  eisenhower, setEisenhower,
  kanban, setKanban,
  memoText, setMemoText
}) {
  // 1. Eisenhower Matrix Actions
  const [matrixInputs, setMatrixInputs] = useState({
    iu: '', // Important & Urgent
    inu: '', // Important & Not Urgent
    niu: '', // Not Important & Urgent
    ninu: '' // Not Important & Not Urgent
  });

  const handleAddMatrixItem = (quadrant, e) => {
    e.preventDefault();
    const text = matrixInputs[quadrant];
    if (!text.trim()) return;

    const newItem = {
      id: `matrix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      completed: false
    };

    setEisenhower({
      ...eisenhower,
      [quadrant]: [...(eisenhower[quadrant] || []), newItem]
    });

    setMatrixInputs({
      ...matrixInputs,
      [quadrant]: ''
    });
  };

  const toggleMatrixItem = (quadrant, id) => {
    const updated = eisenhower[quadrant].map(item => {
      if (item.id === id) return { ...item, completed: !item.completed };
      return item;
    });
    setEisenhower({ ...eisenhower, [quadrant]: updated });
  };

  const deleteMatrixItem = (quadrant, id) => {
    const updated = eisenhower[quadrant].filter(item => item.id !== id);
    setEisenhower({ ...eisenhower, [quadrant]: updated });
  };

  // 2. Kanban Board Actions
  const [newKanbanText, setNewKanbanText] = useState('');

  const handleAddKanban = (e) => {
    e.preventDefault();
    if (!newKanbanText.trim()) return;

    const newItem = {
      id: `kanban-${Date.now()}`,
      text: newKanbanText.trim(),
      status: 'todo' // 'todo' | 'progress' | 'done'
    };

    setKanban([...kanban, newItem]);
    setNewKanbanText('');
  };

  const moveKanban = (id, direction) => {
    const statusOrder = ['todo', 'progress', 'done'];
    const updated = kanban.map(item => {
      if (item.id === id) {
        const currentIndex = statusOrder.indexOf(item.status);
        let nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < statusOrder.length) {
          return { ...item, status: statusOrder[nextIndex] };
        }
      }
      return item;
    });
    setKanban(updated);
  };

  const deleteKanban = (id) => {
    setKanban(kanban.filter(item => item.id !== id));
  };

  // 3. Meeting Tracker Timer
  const [meetingLimit, setMeetingLimit] = useState(900); // 15 minutes default (in seconds)
  const [meetingTime, setMeetingTime] = useState(0);
  const [meetingRunning, setMeetingRunning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (meetingRunning) {
      interval = setInterval(() => {
        setMeetingTime(prev => {
          const nextVal = prev + 1;
          if (nextVal >= meetingLimit) {
            setShowWarning(true);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [meetingRunning, meetingLimit]);

  const formatMeetingTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleResetMeeting = () => {
    setMeetingRunning(false);
    setMeetingTime(0);
    setShowWarning(false);
  };

  // 4. Quick Memo Templates & Clipboard Copy
  const [copied, setCopied] = useState(false);

  const applyTemplate = (type) => {
    const templates = {
      meeting: `📅 회의록 (Meeting Notes)\n• 일시: ${new Date().toLocaleDateString()}\n• 참석자: \n• 주제: \n\n✅ 주요 의결 사항:\n1. \n2. \n\n🎯 후속 조치 (Action Items):\n• [ ] 담당자 - 기한: `,
      report: `📊 업무 보고 (Daily Report)\n• 금일 진행 업무:\n  - \n  - \n• 미결 및 이슈 사항:\n  - \n• 익일 예정 업무:\n  - `,
      sketch: `💡 아이디어 브레인스토밍 (Idea Sketch)\n• 핵심 아이디어:\n• 문제 해결 방식:\n• 예상 이점:\n• 고려 사항:`
    };
    setMemoText(templates[type]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const meetingProgress = Math.min((meetingTime / meetingLimit) * 100, 100);

  return (
    <div className="office-dashboard fade-in">
      <div className="desk-title">
        <Briefcase size={24} />
        <h2>오피스 보드 (Office Dashboard)</h2>
      </div>

      <div className="office-grid">
        {/* Eisenhower Matrix Card */}
        <div className="card eisenhower-card">
          <h3 className="widget-title">
            <Briefcase size={18} />
            <span>아이젠하워 우선순위 매트릭스</span>
          </h3>

          <div className="matrix-grid">
            {/* Quadrant 1: Important & Urgent */}
            <div className="quadrant iu">
              <div className="quadrant-header">🔥 1. 긴급 & 중요 (Urgent & Important)</div>
              <div className="quadrant-body">
                <form onSubmit={(e) => handleAddMatrixItem('iu', e)} className="matrix-form">
                  <input
                    type="text"
                    placeholder="우선순위 추가..."
                    value={matrixInputs.iu}
                    onChange={(e) => setMatrixInputs({ ...matrixInputs, iu: e.target.value })}
                    className="input-field matrix-input"
                  />
                  <button type="submit" className="btn btn-sm"><Plus size={14} /></button>
                </form>
                <div className="matrix-list">
                  {(eisenhower.iu || []).map(item => (
                    <div key={item.id} className={`matrix-item ${item.completed ? 'completed' : ''}`}>
                      <button onClick={() => toggleMatrixItem('iu', item.id)} className="icon-btn">
                        {item.completed ? <CheckCircle size={15} className="checked" /> : <Circle size={15} />}
                      </button>
                      <span className="item-text">{item.text}</span>
                      <button onClick={() => deleteMatrixItem('iu', item.id)} className="delete-btn icon-btn">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quadrant 2: Important & Not Urgent */}
            <div className="quadrant inu">
              <div className="quadrant-header">🎯 2. 중요 & 비긴급 (Important & Not Urgent)</div>
              <div className="quadrant-body">
                <form onSubmit={(e) => handleAddMatrixItem('inu', e)} className="matrix-form">
                  <input
                    type="text"
                    placeholder="계획 추가..."
                    value={matrixInputs.inu}
                    onChange={(e) => setMatrixInputs({ ...matrixInputs, inu: e.target.value })}
                    className="input-field matrix-input"
                  />
                  <button type="submit" className="btn btn-sm"><Plus size={14} /></button>
                </form>
                <div className="matrix-list">
                  {(eisenhower.inu || []).map(item => (
                    <div key={item.id} className={`matrix-item ${item.completed ? 'completed' : ''}`}>
                      <button onClick={() => toggleMatrixItem('inu', item.id)} className="icon-btn">
                        {item.completed ? <CheckCircle size={15} className="checked" /> : <Circle size={15} />}
                      </button>
                      <span className="item-text">{item.text}</span>
                      <button onClick={() => deleteMatrixItem('inu', item.id)} className="delete-btn icon-btn">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quadrant 3: Not Important & Urgent */}
            <div className="quadrant niu">
              <div className="quadrant-header">⚡ 3. 긴급 & 비중요 (Urgent & Not Important)</div>
              <div className="quadrant-body">
                <form onSubmit={(e) => handleAddMatrixItem('niu', e)} className="matrix-form">
                  <input
                    type="text"
                    placeholder="위임 업무 추가..."
                    value={matrixInputs.niu}
                    onChange={(e) => setMatrixInputs({ ...matrixInputs, niu: e.target.value })}
                    className="input-field matrix-input"
                  />
                  <button type="submit" className="btn btn-sm"><Plus size={14} /></button>
                </form>
                <div className="matrix-list">
                  {(eisenhower.niu || []).map(item => (
                    <div key={item.id} className={`matrix-item ${item.completed ? 'completed' : ''}`}>
                      <button onClick={() => toggleMatrixItem('niu', item.id)} className="icon-btn">
                        {item.completed ? <CheckCircle size={15} className="checked" /> : <Circle size={15} />}
                      </button>
                      <span className="item-text">{item.text}</span>
                      <button onClick={() => deleteMatrixItem('niu', item.id)} className="delete-btn icon-btn">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quadrant 4: Not Important & Not Urgent */}
            <div className="quadrant ninu">
              <div className="quadrant-header">☕ 4. 비긴급 & 비중요 (Eliminate / Delay)</div>
              <div className="quadrant-body">
                <form onSubmit={(e) => handleAddMatrixItem('ninu', e)} className="matrix-form">
                  <input
                    type="text"
                    placeholder="기타 업무 추가..."
                    value={matrixInputs.ninu}
                    onChange={(e) => setMatrixInputs({ ...matrixInputs, ninu: e.target.value })}
                    className="input-field matrix-input"
                  />
                  <button type="submit" className="btn btn-sm"><Plus size={14} /></button>
                </form>
                <div className="matrix-list">
                  {(eisenhower.ninu || []).map(item => (
                    <div key={item.id} className={`matrix-item ${item.completed ? 'completed' : ''}`}>
                      <button onClick={() => toggleMatrixItem('ninu', item.id)} className="icon-btn">
                        {item.completed ? <CheckCircle size={15} className="checked" /> : <Circle size={15} />}
                      </button>
                      <span className="item-text">{item.text}</span>
                      <button onClick={() => deleteMatrixItem('ninu', item.id)} className="delete-btn icon-btn">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Timer Card */}
        <div className="card meeting-card">
          <h3 className="widget-title">
            <Clock size={18} />
            <span>생산적인 회의 타이머 (시간제한 알람)</span>
          </h3>

          <div className="meeting-timer-box">
            <div className="limit-selector">
              <label>회의 제한시간 설정:</label>
              <select 
                value={meetingLimit} 
                onChange={(e) => {
                  setMeetingLimit(Number(e.target.value));
                  handleResetMeeting();
                }}
                className="input-field select-field"
              >
                <option value={300}>5 분 (브리핑)</option>
                <option value={900}>15 분 (스탠드업)</option>
                <option value={1800}>30 분 (정기 미팅)</option>
                <option value={3600}>60 분 (장기 전략회의)</option>
              </select>
            </div>

            <div className={`meeting-clock ${showWarning ? 'warning-glow' : ''}`}>
              <div className="meeting-time-text">{formatMeetingTime(meetingTime)}</div>
              <div className="meeting-target">목표: {formatMeetingTime(meetingLimit)}</div>
            </div>

            <div className="meeting-progress-bar-wrapper">
              <div 
                className={`meeting-progress-bar-fill ${showWarning ? 'warning-fill' : ''}`}
                style={{ width: `${meetingProgress}%` }}
              ></div>
            </div>

            {showWarning && (
              <div className="meeting-warning-banner">
                <AlertTriangle size={16} />
                <span>시간 초과! 신속히 회의를 정리해 주세요.</span>
              </div>
            )}

            <div className="meeting-controls">
              <button 
                onClick={() => setMeetingRunning(!meetingRunning)} 
                className={`btn ${meetingRunning ? 'btn-danger' : 'btn-primary'}`}
              >
                {meetingRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{meetingRunning ? '중지' : '시작'}</span>
              </button>
              <button onClick={handleResetMeeting} className="btn">
                <RotateCcw size={16} />
                <span>초기화</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board Card */}
        <div className="card kanban-card">
          <h3 className="widget-title">
            <FileText size={18} />
            <span>업무 칸반 보드 (Kanban Board)</span>
          </h3>

          <form onSubmit={handleAddKanban} className="kanban-add-form">
            <input 
              type="text" 
              placeholder="새로운 칸반 카드 추가..." 
              value={newKanbanText}
              onChange={e => setNewKanbanText(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary"><Plus size={16} /></button>
          </form>

          <div className="kanban-columns">
            {/* Column 1: To Do */}
            <div className="kanban-col">
              <div className="col-header todo-col">할 일 (To Do)</div>
              <div className="col-body">
                {kanban.filter(item => item.status === 'todo').map(item => (
                  <div key={item.id} className="kanban-item fade-in">
                    <p className="kanban-item-text">{item.text}</p>
                    <div className="kanban-item-actions">
                      <button onClick={() => deleteKanban(item.id)} className="delete-btn icon-btn"><Trash2 size={12} /></button>
                      <button onClick={() => moveKanban(item.id, 1)} className="move-btn icon-btn"><ArrowRight size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="kanban-col">
              <div className="col-header progress-col">진행 중 (In Progress)</div>
              <div className="col-body">
                {kanban.filter(item => item.status === 'progress').map(item => (
                  <div key={item.id} className="kanban-item fade-in">
                    <p className="kanban-item-text">{item.text}</p>
                    <div className="kanban-item-actions">
                      <button onClick={() => moveKanban(item.id, -1)} className="move-btn icon-btn"><ArrowLeft size={12} /></button>
                      <button onClick={() => deleteKanban(item.id)} className="delete-btn icon-btn"><Trash2 size={12} /></button>
                      <button onClick={() => moveKanban(item.id, 1)} className="move-btn icon-btn"><ArrowRight size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="kanban-col">
              <div className="col-header done-col">완료 (Done)</div>
              <div className="col-body">
                {kanban.filter(item => item.status === 'done').map(item => (
                  <div key={item.id} className="kanban-item completed-item fade-in">
                    <p className="kanban-item-text">{item.text}</p>
                    <div className="kanban-item-actions">
                      <button onClick={() => moveKanban(item.id, -1)} className="move-btn icon-btn"><ArrowLeft size={12} /></button>
                      <button onClick={() => deleteKanban(item.id)} className="delete-btn icon-btn"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Memo / Notes Card */}
        <div className="card memo-card">
          <h3 className="widget-title">
            <FileText size={18} />
            <span>오늘의 간편 회의록 및 메모</span>
          </h3>

          <div className="memo-templates">
            <button onClick={() => applyTemplate('meeting')} className="btn btn-sm">회의록 양식</button>
            <button onClick={() => applyTemplate('report')} className="btn btn-sm">업무보고 양식</button>
            <button onClick={() => applyTemplate('sketch')} className="btn btn-sm">아이디어 양식</button>
          </div>

          <div className="memo-textarea-wrapper">
            <textarea
              className="input-field memo-textarea"
              placeholder="이곳에 빠른 메모나 회의록 내용을 작성하세요. 브라우저 저장소에 자동으로 보관됩니다."
              value={memoText}
              onChange={e => setMemoText(e.target.value)}
              rows={8}
            />
          </div>

          <div className="memo-footer">
            <button onClick={copyToClipboard} className="btn btn-primary btn-copy">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '복사 완료!' : '클립보드 복사'}</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .office-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .desk-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #8b5cf6; /* Office Purple */
          border-bottom: 2px solid rgba(139, 92, 246, 0.2);
          padding-bottom: 0.5rem;
        }

        .office-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .office-grid {
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

        /* Eisenhower Matrix Styles */
        .matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .matrix-grid {
            grid-template-columns: 1fr;
          }
        }

        .quadrant {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .quadrant-header {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 800;
          color: #ffffff;
        }

        .iu .quadrant-header { background: #ef4444; }
        .inu .quadrant-header { background: #3b82f6; }
        .niu .quadrant-header { background: #f59e0b; }
        .ninu .quadrant-header { background: #10b981; }

        .quadrant-body {
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .matrix-form {
          display: flex;
          gap: 0.25rem;
        }

        .matrix-input {
          font-size: 0.8rem;
          padding: 0.35rem 0.6rem;
        }

        .matrix-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-height: 120px;
          overflow-y: auto;
        }

        .matrix-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.4rem;
          background: var(--bg-panel);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .matrix-item.completed {
          opacity: 0.6;
        }

        .matrix-item.completed .item-text {
          text-decoration: line-through;
        }

        .item-text {
          font-size: 0.8rem;
          font-weight: 600;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .checked {
          color: var(--accent);
        }

        .delete-btn {
          color: var(--text-muted);
        }
        .delete-btn:hover {
          color: #ef4444;
        }

        /* Meeting Timer Styles */
        .meeting-timer-box {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .limit-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .limit-selector select {
          width: auto;
        }

        .meeting-clock {
          text-align: center;
          padding: 1rem;
          background: var(--bg-input);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.3s;
        }

        .meeting-time-text {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-mono);
        }

        .meeting-target {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .warning-glow {
          border-color: #ef4444;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
          animation: warning-pulse 1s infinite alternate;
        }

        @keyframes warning-pulse {
          from { opacity: 0.8; }
          to { opacity: 1; }
        }

        .meeting-progress-bar-wrapper {
          width: 100%;
          background: var(--border-color);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .meeting-progress-bar-fill {
          background: var(--accent);
          height: 100%;
          transition: width 1s linear;
        }

        .warning-fill {
          background: #ef4444;
        }

        .meeting-warning-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.4rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .meeting-controls {
          display: flex;
          gap: 0.5rem;
        }

        .meeting-controls button {
          flex: 1;
        }

        /* Kanban Board Styles */
        .kanban-add-form {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.85rem;
        }

        .kanban-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
        }

        @media (max-width: 640px) {
          .kanban-columns {
            grid-template-columns: 1fr;
          }
        }

        .kanban-col {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          min-height: 180px;
          display: flex;
          flex-direction: column;
        }

        .col-header {
          padding: 0.4rem;
          font-size: 0.8rem;
          font-weight: 800;
          text-align: center;
          color: #ffffff;
        }

        .todo-col { background: var(--text-muted); }
        .progress-col { background: var(--accent); }
        .done-col { background: #10b981; }

        .col-body {
          padding: 0.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex-grow: 1;
          overflow-y: auto;
          max-height: 250px;
        }

        .kanban-item {
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .completed-item {
          opacity: 0.7;
          border-left: 3px solid #10b981;
        }

        .completed-item .kanban-item-text {
          text-decoration: line-through;
        }

        .kanban-item-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          word-break: break-all;
        }

        .kanban-item-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.25rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.25rem;
        }

        .kanban-item-actions button {
          padding: 0.15rem;
        }

        /* Memo Styles */
        .memo-templates {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
        }

        .memo-textarea-wrapper {
          width: 100%;
        }

        .memo-textarea {
          resize: vertical;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          line-height: 145%;
        }

        .memo-footer {
          margin-top: 0.6rem;
          display: flex;
          justify-content: flex-end;
        }

        .btn-copy {
          min-width: 130px;
        }

        /* Common Icon Button */
        .icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem;
          border-radius: 4px;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: var(--border-color);
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
