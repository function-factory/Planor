import React, { useState, useEffect, useRef } from 'react';

// Curated playlists grouped by categories (Study, Work, Rest)
const CURATED_PLAYLISTS = {
  study: [
    {
      id: 'study-1',
      title: 'Lofi Hip Hop Radio - Beats to Study/Relax',
      artist: 'Lofi Girl',
      source: 'youtube',
      embedId: 'jfKfPfyJRdk',
      cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (차분한 로파이 비트가 흘러나옵니다)\n[00:10] 공부와 집중을 위한 완벽한 리듬.\n[00:20] Planor와 함께 효율을 높여보세요.\n[00:35] 📚 끝까지 화이팅!'
    },
    {
      id: 'study-2',
      title: 'Deep Focus Ambient Music',
      artist: 'Spotify Study Ambient',
      source: 'spotify',
      embedId: 'playlist/37i9dQZF1DWZeKFBq7444V',
      cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (잔잔한 엠비언트 사운드스케이프)\n[00:15] 마음을 비우고 집중에 몰입하세요.\n[00:30] 복잡한 생각을 지우는 잔잔한 선율.'
    }
  ],
  work: [
    {
      id: 'work-1',
      title: 'Coding & Focus Chill Beats',
      artist: 'Lofi Records',
      source: 'youtube',
      embedId: '5qap5aO4i9A',
      cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (업무용 칠 비트가 재생 중입니다)\n[00:12] 집중해서 코드와 문서를 작성해보세요.\n[00:25] 일의 속도가 붙기 시작합니다.\n[00:40] 💻 오늘의 할 일 끝까지!'
    },
    {
      id: 'work-2',
      title: 'Productive Jazz for Office',
      artist: 'Spotify Jazz Lounge',
      source: 'spotify',
      embedId: 'playlist/37i9dQZF1DWZqJ5F7n658Q',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (부드러운 재즈 선율)\n[00:15] 사무실 백그라운드에 제격인 재즈 피아노.\n[00:40] 차분하게 일에 집중해보세요.'
    }
  ],
  rest: [
    {
      id: 'rest-1',
      title: 'Rainy Night Coffee Shop Ambience',
      artist: 'Cafe Sounds',
      source: 'youtube',
      embedId: 'c0_ejQQcrwI',
      cover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (빗소리와 따뜻한 카페 소음)\n[00:10] 눈을 감고 잠시 호흡을 가다듬으세요.\n[00:20] 커피 한 잔의 온기가 전해집니다.\n[00:40] 😴 편안한 휴식을 누리세요.'
    },
    {
      id: 'rest-2',
      title: 'Chill Melodies for Relaxation',
      artist: 'Acoustic Rain',
      source: 'spotify',
      embedId: 'track/37i9dQZF1DX889p0TUIavA',
      cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (어쿠스틱 감성 멜로디)\n[00:15] 지친 하루의 끝, 마음의 휴식.\n[00:35] 잠시 어깨의 짐을 내려놓으세요.'
    }
  ]
};

function parseMusicUrl(url) {
  if (!url) return null;
  
  // YouTube watch link
  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&#]+)/);
    if (match) return { source: 'youtube', embedId: match[1] };
  }
  // YouTube share link
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    const id = parts[1]?.split(/[?#]/)[0];
    if (id) return { source: 'youtube', embedId: id };
  }
  // Spotify link
  if (url.includes('open.spotify.com/')) {
    const parts = url.split('open.spotify.com/')[1]?.split(/[?#]/)[0];
    if (parts) {
      if (parts.startsWith('track/') || parts.startsWith('playlist/') || parts.startsWith('album/')) {
        return { source: 'spotify', embedId: parts };
      }
      // If just the ID is pasted, default to track
      return { source: 'spotify', embedId: 'track/' + parts };
    }
  }
  return null;
}

export default function MusicWidget({ isMobile, isOpen, onClose }) {
  const [category, setCategory] = useState('study'); // study | work | rest
  const [activeTrack, setActiveTrack] = useState(CURATED_PLAYLISTS.study[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [lyricsLines, setLyricsLines] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // Parse lyrics when active track changes
  useEffect(() => {
    if (!activeTrack.lyrics) {
      setLyricsLines([]);
      return;
    }
    const lines = activeTrack.lyrics.split('\n').map(line => {
      const match = line.match(/\[(\d+):(\d+)\](.*)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        return { time: min * 60 + sec, text: match[3].trim() };
      }
      return { time: 0, text: line };
    }).sort((a, b) => a.time - b.time);
    setLyricsLines(lines);
    setCurrentTime(0);
    setCurrentLyricIndex(-1);
  }, [activeTrack]);

  // Handle simulated progress and lyrics sync
  useEffect(() => {
    let t = null;
    if (isPlaying) {
      t = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          // Find matching lyric line
          let index = -1;
          for (let i = 0; i < lyricsLines.length; i++) {
            if (next >= lyricsLines[i].time) {
              index = i;
            } else {
              break;
            }
          }
          if (index !== -1) {
            setCurrentLyricIndex(index);
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [isPlaying, lyricsLines]);

  // Scroll active lyric into view
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.childNodes[currentLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  // Handle previous / next
  function handlePrev() {
    const list = CURATED_PLAYLISTS[category];
    const idx = list.findIndex(t => t.id === activeTrack.id);
    if (idx > 0) {
      setActiveTrack(list[idx - 1]);
    } else {
      setActiveTrack(list[list.length - 1]);
    }
  }

  function handleNext() {
    const list = CURATED_PLAYLISTS[category];
    const idx = list.findIndex(t => t.id === activeTrack.id);
    if (idx !== -1 && idx < list.length - 1) {
      setActiveTrack(list[idx + 1]);
    } else {
      setActiveTrack(list[0]);
    }
  }

  // Handle custom URL load
  function loadCustomUrl() {
    const parsed = parseMusicUrl(customUrl);
    if (parsed) {
      const newTrack = {
        id: 'custom-' + Date.now(),
        title: parsed.source === 'youtube' ? '사용자 유튜브 음악' : '사용자 스포티파이 음악',
        artist: '외부 플레이어 연동',
        source: parsed.source,
        embedId: parsed.embedId,
        cover: parsed.source === 'youtube' 
          ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&auto=format&fit=crop&q=60',
        lyrics: '[00:00] 외부 연동 플레이어는 가사가 동기화되지 않습니다.\n[00:10] 플레이어 자체 창을 활용해주세요!'
      };
      setActiveTrack(newTrack);
      setCustomUrl('');
      setIsPlaying(true);
    } else {
      alert('올바른 YouTube 동영상/공유 링크 또는 Spotify 공유 링크를 입력해주세요.');
    }
  }

  const formattedTime = `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`;

  // Mini Compact Player (always rendered)
  const renderCompactPlayer = () => (
    <div className="music-compact-player">
      <img src={activeTrack.cover} alt="Cover" className="album-art" />
      <div className="track-info">
        <div className="title">{activeTrack.title}</div>
        <div className="artist">{activeTrack.artist}</div>
      </div>
      <div className="controls">
        <button onClick={handlePrev} className="ctrl-btn" title="이전 곡">⏮</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="ctrl-btn play-pause" title={isPlaying ? '일시정지' : '재생'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} className="ctrl-btn" title="다음 곡">⏭</button>
        <button onClick={() => setExpanded(!expanded)} className="ctrl-btn size-toggle" title="상세 정보">
          {expanded ? '收' : '展'}
        </button>
      </div>
    </div>
  );

  // Detailed Expanded Overlay
  const renderExpandedPanel = () => {
    const embedSrc = activeTrack.source === 'youtube'
      ? `https://www.youtube.com/embed/${activeTrack.embedId}?enablejsapi=1`
      : `https://open.spotify.com/embed/${activeTrack.embedId}`;

    return (
      <div className={`music-expanded-panel ${expanded || isMobile ? 'show' : ''}`}>
        <div className="expanded-header">
          <span className="panel-title">🎵 뮤직 상세 플레이어</span>
          {!isMobile && <button onClick={() => setExpanded(false)} className="close-btn">✕</button>}
        </div>

        {/* Real Embedded Player */}
        <div className="embed-container">
          {activeTrack.source === 'youtube' ? (
            <iframe
              src={embedSrc}
              title="YouTube Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <iframe
              src={embedSrc}
              title="Spotify Player"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            />
          )}
        </div>

        {/* Classification Categories */}
        <div className="category-tabs">
          <button onClick={() => setCategory('study')} className={category === 'study' ? 'active' : ''}>📚 공부</button>
          <button onClick={() => setCategory('work')} className={category === 'work' ? 'active' : ''}>💻 업무</button>
          <button onClick={() => setCategory('rest')} className={category === 'rest' ? 'active' : ''}>😴 휴식</button>
        </div>

        {/* Track List */}
        <div className="track-list">
          {CURATED_PLAYLISTS[category].map(track => (
            <div
              key={track.id}
              onClick={() => { setActiveTrack(track); setIsPlaying(true); }}
              className={`track-item ${activeTrack.id === track.id ? 'active' : ''}`}
            >
              <span className="source-badge" style={{ background: track.source === 'youtube' ? 'var(--red)' : 'var(--green)' }}>
                {track.source === 'youtube' ? 'YT' : 'SP'}
              </span>
              <div className="info">
                <div className="title">{track.title}</div>
                <div className="artist">{track.artist}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom URL Input */}
        <div className="custom-url-wrap">
          <input
            placeholder="YouTube 또는 Spotify 링크 입력..."
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') loadCustomUrl(); }}
          />
          <button onClick={loadCustomUrl}>불러오기</button>
        </div>

        {/* Progress Bar & Lyrics */}
        <div className="lyrics-panel">
          <div className="lyrics-header">
            <span>가사 동기화</span>
            <span className="timer-badge">{formattedTime}</span>
          </div>
          <div ref={lyricsContainerRef} className="lyrics-lines">
            {lyricsLines.map((line, idx) => (
              <div
                key={idx}
                className={`lyric-line ${currentLyricIndex === idx ? 'active' : ''}`}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    // On mobile, the entire player fits inside the modal sheet
    return (
      <div className="mobile-music-player">
        {renderExpandedPanel()}
      </div>
    );
  }

  // Desktop sidebar container
  return (
    <div className="desktop-music-widget">
      {renderCompactPlayer()}
      {expanded && renderExpandedPanel()}
    </div>
  );
}
