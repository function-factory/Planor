import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, Flame, Snowflake, Coffee, Gamepad2, Monitor } from 'lucide-react';

export default function ClockWidget({ theme }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const hours = formatNumber(time.getHours());
  const minutes = formatNumber(time.getMinutes());
  const seconds = formatNumber(time.getSeconds());
  const year = time.getFullYear();
  const month = formatNumber(time.getMonth() + 1);
  const date = formatNumber(time.getDate());
  
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = weekdays[time.getDay()];

  // Dynamic icon based on selected theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'y2k':
        return <Monitor className="clock-theme-icon neon-glow" size={24} />;
      case 'retro':
        return <Gamepad2 className="clock-theme-icon" size={24} />;
      case 'spring':
        return <Sparkles className="clock-theme-icon" size={24} style={{ color: '#fb7185' }} />;
      case 'summer':
        return <Coffee className="clock-theme-icon" size={24} style={{ color: '#0284c7' }} />;
      case 'winter':
        return <Snowflake className="clock-theme-icon" size={24} style={{ color: '#38bdf8' }} />;
      case 'classic':
        return <Coffee className="clock-theme-icon" size={24} style={{ color: '#8c6239' }} />;
      default:
        return <Clock className="clock-theme-icon" size={24} />;
    }
  };

  // Seconds indicator progress (0 to 1)
  const secondsProgress = time.getSeconds() / 60;
  const strokeDashoffset = 157 - (157 * secondsProgress);

  return (
    <div className="clock-widget card fade-in">
      <div className="clock-header">
        <div className="clock-title">
          {getThemeIcon()}
          <span>현재 시각 (Live Clock)</span>
        </div>
        <span className="live-pill">LIVE</span>
      </div>

      <div className="clock-display-wrapper">
        {/* SVG Circular seconds progress */}
        <div className="clock-progress-svg">
          <svg width="120" height="120" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="25"
              className="clock-track"
            />
            <circle
              cx="30"
              cy="30"
              r="25"
              className="clock-indicator"
              style={{
                strokeDasharray: 157,
                strokeDashoffset: strokeDashoffset
              }}
            />
          </svg>
          <div className="clock-digits">
            <span className="digits-hour">{hours}</span>
            <span className="digits-separator">:</span>
            <span className="digits-min">{minutes}</span>
            <span className="digits-sec-small">{seconds}</span>
          </div>
        </div>
      </div>

      <div className="clock-footer">
        <Calendar size={16} />
        <span className="date-text">
          {year}년 {month}월 {date}일 ({dayName})
        </span>
      </div>

      <style jsx="true">{`
        .clock-widget {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          height: 100%;
          justify-content: space-between;
        }

        .clock-header {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
        }

        .clock-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1rem;
        }

        .live-pill {
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          animation: pulse 1.5s infinite alternate;
          letter-spacing: 0.05rem;
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .clock-display-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0.5rem 0;
        }

        .clock-progress-svg {
          position: relative;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clock-progress-svg svg {
          position: absolute;
          transform: rotate(-90deg);
        }

        .clock-track {
          fill: none;
          stroke: var(--border-color);
          stroke-width: 2.5;
        }

        .clock-indicator {
          fill: none;
          stroke: var(--accent);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.1s linear;
          filter: var(--glow-effect) ? drop-shadow(0 0 3px var(--accent)) : none;
        }

        .clock-digits {
          display: flex;
          align-items: baseline;
          justify-content: center;
          font-weight: 700;
          font-size: 1.6rem;
          z-index: 10;
          letter-spacing: -0.05rem;
        }

        .digits-sec-small {
          font-size: 0.9rem;
          margin-left: 0.2rem;
          color: var(--accent);
          font-weight: 500;
        }

        .digits-separator {
          animation: blink 1s infinite steps(1, start);
          padding: 0 0.1rem;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        .clock-footer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          width: 100%;
          justify-content: center;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        .date-text {
          font-weight: 600;
        }

        /* Theme specific enhancements */
        .theme-y2k .clock-track {
          stroke: rgba(57, 255, 20, 0.1);
        }
        .theme-y2k .clock-indicator {
          stroke: var(--text-main);
        }
        .theme-y2k .digits-sec-small {
          color: var(--text-main);
        }
        .theme-y2k .live-pill {
          background: var(--text-main);
          color: #020204;
          border: 1px solid var(--text-main);
        }
        
        .theme-retro .clock-track {
          stroke: rgba(74, 52, 89, 0.1);
        }
        .theme-retro .clock-indicator {
          stroke: var(--accent);
        }
      `}</style>
    </div>
  );
}
