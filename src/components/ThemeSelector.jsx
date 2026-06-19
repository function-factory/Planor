import React from 'react';
import { Palette, Type, Users, Award, Briefcase, GraduationCap } from 'lucide-react';

export default function ThemeSelector({
  theme,
  setTheme,
  font,
  setFont,
  mode,
  setMode
}) {
  const themes = [
    { id: 'modern-light', name: '모던 라이트', class: 'theme-modern-light', color: '#f8fafc' },
    { id: 'modern-dark', name: '모던 다크', class: 'theme-modern-dark', color: '#0f172a' },
    { id: 'y2k', name: 'Y2K 사이버', class: 'theme-y2k', color: '#020204' },
    { id: 'retro', name: '레트로 픽셀', class: 'theme-retro', color: '#ecdcb9' },
    { id: 'spring', name: '봄날의 벚꽃', class: 'theme-spring', color: '#fff1f2' },
    { id: 'summer', name: '여름 해변', class: 'theme-summer', color: '#e0f2fe' },
    { id: 'winter', name: '포근한 겨울', class: 'theme-winter', color: '#1e293b' },
    { id: 'classic', name: '클래식 서재', class: 'theme-classic', color: '#f4ecd8' },
  ];

  const fonts = [
    { id: 'sans', name: '고딕 (Outfit)', class: 'font-class-sans' },
    { id: 'serif', name: '명조 (Lora)', class: 'font-class-serif' },
    { id: 'mono', name: '픽셀 (VT323)', class: 'font-class-mono' },
    { id: 'hand', name: '손글씨 (Gaegu)', class: 'font-class-hand' },
  ];

  return (
    <div className="theme-selector card fade-in">
      <div className="selector-section">
        <h3 className="section-title">
          <Palette size={18} />
          <span>테마 설정 (Themes)</span>
        </h3>
        <div className="themes-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`theme-btn ${theme === t.id ? 'active' : ''}`}
              title={t.name}
            >
              <span className="color-preview" style={{ backgroundColor: t.color }}></span>
              <span className="theme-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="selector-row">
        <div className="selector-section flex-1">
          <h3 className="section-title">
            <Type size={18} />
            <span>폰트 설정 (Fonts)</span>
          </h3>
          <div className="fonts-list">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                className={`font-btn ${font === f.id ? 'active' : ''} ${f.class}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="selector-section mode-section">
          <h3 className="section-title">
            <Users size={18} />
            <span>데스크 모드 (Desk Mode)</span>
          </h3>
          <div className="mode-toggle">
            <button
              onClick={() => setMode('student')}
              className={`mode-btn ${mode === 'student' ? 'active student-active' : ''}`}
            >
              <GraduationCap size={16} />
              <span>학생 모드</span>
            </button>
            <button
              onClick={() => setMode('office')}
              className={`mode-btn ${mode === 'office' ? 'active office-active' : ''}`}
            >
              <Briefcase size={16} />
              <span>직장인 모드</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .theme-selector {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .selector-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .selector-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .flex-1 {
          flex: 1;
          min-width: 200px;
        }

        .mode-section {
          min-width: 220px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        @media (max-width: 640px) {
          .themes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .theme-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .theme-btn:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        .theme-btn.active {
          border-color: var(--accent);
          background: var(--accent-bg);
          font-weight: 700;
          box-shadow: 0 0 0 2px var(--accent-bg);
        }

        .color-preview {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .theme-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fonts-list {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .font-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-main);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .font-btn:hover {
          border-color: var(--accent);
        }

        .font-btn.active {
          border-color: var(--accent);
          background: var(--accent-bg);
          font-weight: 700;
        }

        .mode-toggle {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-input);
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn.active {
          color: #ffffff;
        }

        .mode-btn.active.student-active {
          background: #3b82f6; /* Student Blue */
        }

        .mode-btn.active.office-active {
          background: #8b5cf6; /* Office Purple */
        }
      `}</style>
    </div>
  );
}
