import React, { useState, useEffect, useRef } from 'react';

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
  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&#]+)/);
    if (match) return { source: 'youtube', embedId: match[1] };
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    const id = parts[1]?.split(/[?#]/)[0];
    if (id) return { source: 'youtube', embedId: id };
  }
  if (url.includes('open.spotify.com/')) {
    const parts = url.split('open.spotify.com/')[1]?.split(/[?#]/)[0];
    if (parts) {
      if (parts.startsWith('track/') || parts.startsWith('playlist/') || parts.startsWith('album/')) {
        return { source: 'spotify', embedId: parts };
      }
      return { source: 'spotify', embedId: 'track/' + parts };
    }
  }
  return null;
}

export default function MusicWidget({ isMobile, isOpen, onClose }) {
  const [category, setCategory] = useState('study');
  const [activeTrack, setActiveTrack] = useState(CURATED_PLAYLISTS.study[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [expanded, setExpanded] = useLS('planor-v2-music-expanded', false);
  const [showSettings, setShowSettings] = useState(false);

  // Position for desktop drag-and-drop
  const [pos, setPos] = useLS('planor-v2-music-pos', { x: 260, y: 550 });
  const [dragging, setDragging] = useState(false);
  const relPos = useRef({ x: 0, y: 0 });

  // Spotify Realtime Sync States
  const [spotifyClientId, setSpotifyClientId] = useLS('planor-spotify-client-id', '');
  const [spotifyToken, setSpotifyToken] = useLS('planor-spotify-token', '');
  const [isSpotifySynced, setIsSpotifySynced] = useState(false);

  // Lyrics sync states
  const [lyricsLines, setLyricsLines] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // YouTube API instance
  const ytPlayerRef = useRef(null);

  // Parse Spotify tokens from redirect hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setSpotifyToken(token);
        setIsSpotifySynced(true);
        window.location.hash = ''; // clear hash
      }
    }
  }, [setSpotifyToken]);

  // Sync token state
  useEffect(() => {
    if (spotifyToken) {
      setIsSpotifySynced(true);
    }
  }, [spotifyToken]);

  // Spotify Currently Playing Poller
  useEffect(() => {
    if (!isSpotifySynced || !spotifyToken) return;

    const fetchSpotifyTrack = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        });
        
        if (res.status === 200) {
          const data = await res.json();
          if (data && data.item) {
            const track = {
              id: 'spotify-live',
              title: data.item.name,
              artist: data.item.artists.map(a => a.name).join(', '),
              source: 'spotify',
              embedId: `track/${data.item.id}`,
              cover: data.item.album.images[0]?.url || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&auto=format&fit=crop&q=60',
              lyrics: `[00:00] 🟢 Spotify 앱 재생 실시간 연동 중...\n[00:05] 기기에서 재생 중인 곡: ${data.item.name}\n[00:15] 아티스트: ${data.item.artists.map(a => a.name).join(', ')}\n[00:25] 볼륨이나 재생 상태가 Spotify 앱과 동일하게 연동됩니다.`
            };
            setActiveTrack(track);
            setIsPlaying(data.is_playing);
            setCurrentTime(Math.floor(data.progress_ms / 1000));
          }
        } else if (res.status === 401) {
          // Token expired
          setSpotifyToken('');
          setIsSpotifySynced(false);
        }
      } catch (err) {
        console.error('Spotify fetch error:', err);
      }
    };

    fetchSpotifyTrack();
    const t = setInterval(fetchSpotifyTrack, 3000);
    return () => clearInterval(t);
  }, [isSpotifySynced, spotifyToken, setSpotifyToken]);

  // YouTube Iframe API Integration
  useEffect(() => {
    if (activeTrack.source !== 'youtube') {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }
      return;
    }

    let progressInterval = null;
    let retryInterval = null;

    const initYTPlayer = () => {
      const el = document.getElementById('yt-player-target');
      if (!el || !window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
      }

      ytPlayerRef.current = new window.YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        videoId: activeTrack.embedId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });

      // Poll actual video progress for 100% sync lyrics scroll
      progressInterval = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          try {
            setCurrentTime(Math.floor(ytPlayerRef.current.getCurrentTime()));
          } catch (e) {}
        }
      }, 500);
    };

    // Load API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    } else {
      initYTPlayer();
    }

    // Fallback checker if DOM element loads late
    retryInterval = setInterval(() => {
      if (!ytPlayerRef.current && document.getElementById('yt-player-target') && window.YT && window.YT.Player) {
        initYTPlayer();
      }
    }, 1000);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [activeTrack.embedId]);

  // Parse lyrics
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
    setCurrentLyricIndex(-1);
  }, [activeTrack]);

  // Simulated timer for Spotify iframe or static source if not using YouTube API
  useEffect(() => {
    if (activeTrack.source === 'youtube') return; // Handled by YT Player API
    let t = null;
    if (isPlaying) {
      t = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
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
  }, [isPlaying, lyricsLines, activeTrack.source]);

  // Update current lyric index based on currentTime changes (for YouTube API too)
  useEffect(() => {
    let index = -1;
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        index = i;
      } else {
        break;
      }
    }
    if (index !== -1) {
      setCurrentLyricIndex(index);
    }
  }, [currentTime, lyricsLines]);

  // Scroll active lyric to center
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.childNodes[currentLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (isMobile) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('iframe') || e.target.closest('.track-list') || e.target.closest('.lyrics-lines')) return;
    
    setDragging(true);
    relPos.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      let nextX = e.clientX - relPos.current.x;
      let nextY = e.clientY - relPos.current.y;

      // Bound checking
      nextX = Math.max(10, Math.min(window.innerWidth - 360, nextX));
      nextY = Math.max(10, Math.min(window.innerHeight - 100, nextY));

      setPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, pos, setPos]);

  // Next / Prev controls
  function handlePrev() {
    const list = CURATED_PLAYLISTS[category];
    const idx = list.findIndex(t => t.id === activeTrack.id);
    if (idx > 0) {
      setActiveTrack(list[idx - 1]);
    } else {
      setActiveTrack(list[list.length - 1]);
    }
    setIsPlaying(true);
  }

  function handleNext() {
    const list = CURATED_PLAYLISTS[category];
    const idx = list.findIndex(t => t.id === activeTrack.id);
    if (idx !== -1 && idx < list.length - 1) {
      setActiveTrack(list[idx + 1]);
    } else {
      setActiveTrack(list[0]);
    }
    setIsPlaying(true);
  }

  // Load Custom URLs
  function loadCustomUrl() {
    const parsed = parseMusicUrl(customUrl);
    if (parsed) {
      const newTrack = {
        id: 'custom-' + Date.now(),
        title: parsed.source === 'youtube' ? '사용자 외부 유튜브 음악' : '사용자 외부 스포티파이 음악',
        artist: '개별 음악 연동 완료',
        source: parsed.source,
        embedId: parsed.embedId,
        cover: parsed.source === 'youtube' 
          ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&auto=format&fit=crop&q=60',
        lyrics: '[00:00] 외부 연동 플레이어는 가사가 지원되지 않습니다.\n[00:10] 플레이어 내부의 자막 또는 재생창 컨트롤을 참고해주세요!'
      };
      setActiveTrack(newTrack);
      setCustomUrl('');
      setIsPlaying(true);
    } else {
      alert('올바른 YouTube 영상 주소 혹은 Spotify 공유 주소를 입력하세요.');
    }
  }

  // Spotify Login Redirect
  function connectSpotify() {
    const clientId = spotifyClientId.trim() || 'd30ec09477fb47568c07e0c4a45a198a';
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const scopes = encodeURIComponent('user-read-currently-playing user-read-playback-state');
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = url;
  }

  function disconnectSpotify() {
    setSpotifyToken('');
    setIsSpotifySynced(false);
  }

  const formattedTime = `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`;

  const renderCompact = () => (
    <div className={`music-compact-player ${dragging ? 'dragging' : ''}`} onMouseDown={handleMouseDown}>
      {/* Drag handle dots */}
      {!isMobile && <div className="drag-handle-dots" title="드래그하여 이동">⁝⁝</div>}
      <img src={activeTrack.cover} alt="Cover" className={`album-art ${isPlaying ? 'rotating' : ''}`} />
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
          {expanded ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );

  const renderExpanded = () => (
    <div className={`music-expanded-panel ${expanded || isMobile ? 'show' : ''}`} onMouseDown={handleMouseDown}>
      <div className="expanded-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-title">🎵 실시간 연동 플레이어</span>
          {isSpotifySynced && <span className="sync-badge">Live Sync</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setShowSettings(!showSettings)} className="close-btn" title="설정">⚙️</button>
          {!isMobile && <button onClick={() => setExpanded(false)} className="close-btn" title="창 닫기">✕</button>}
        </div>
      </div>

      {showSettings ? (
        <div className="settings-panel">
          <div className="settings-title">⚙️ API 연동 설정</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
            Spotify에서 실시간 재생 정보를 받아옵니다. 아래 순서대로 연동을 완료해주세요.<br/>
            1. Spotify Developer에서 앱을 생성합니다.<br/>
            2. Redirect URI에 <strong>{window.location.origin}/</strong>을 등록합니다.<br/>
            3. Client ID를 아래에 입력하고 로그인하세요.
          </div>
          <div className="input-wrap" style={{ marginBottom: 8 }}>
            <input 
              placeholder="스포티파이 Client ID 입력 (기본값 제공)"
              value={spotifyClientId}
              onChange={e => setSpotifyClientId(e.target.value)}
              style={{ fontSize: 11, padding: 6 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {isSpotifySynced ? (
              <button className="btn btn-danger btn-sm" onClick={disconnectSpotify} style={{ flex: 1 }}>연동 해제</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={connectSpotify} style={{ flex: 1 }}>🟢 스포티파이 연동</button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(false)}>닫기</button>
          </div>
        </div>
      ) : (
        <>
          {/* Audio Iframe Player Container */}
          <div className="embed-container">
            {activeTrack.source === 'youtube' ? (
              <div id="yt-player-target" style={{ width: '100%', height: '100%' }}></div>
            ) : (
              <iframe
                src={`https://open.spotify.com/embed/${activeTrack.embedId}`}
                title="Spotify Live Link"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              />
            )}
          </div>

          {/* Curated Categorization Tabs */}
          <div className="category-tabs">
            <button onClick={() => setCategory('study')} className={category === 'study' ? 'active' : ''}>📚 공부</button>
            <button onClick={() => setCategory('work')} className={category === 'work' ? 'active' : ''}>💻 업무</button>
            <button onClick={() => setCategory('rest')} className={category === 'rest' ? 'active' : ''}>😴 휴식</button>
          </div>

          {/* Playlist Tracks */}
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

          {/* Paste Custom Link Input */}
          <div className="custom-url-wrap">
            <input
              placeholder="YouTube 영상 또는 Spotify 공유 링크 입력..."
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loadCustomUrl(); }}
            />
            <button onClick={loadCustomUrl}>불러오기</button>
          </div>

          {/* Synchronized Scrolling Lyrics Panel */}
          <div className="lyrics-panel">
            <div className="lyrics-header">
              <span>동기화 가사</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isPlaying && (
                  <div className="equalizer">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                )}
                <span className="timer-badge">{formattedTime}</span>
              </div>
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
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="mobile-music-player">
        {renderExpanded()}
      </div>
    );
  }

  return (
    <div
      className="desktop-music-widget"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 999
      }}
    >
      {renderCompact()}
      {expanded && renderExpanded()}
    </div>
  );
}
