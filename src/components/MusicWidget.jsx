import React, { useState, useEffect, useRef } from 'react';

// Premium SVG Icon set
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);
const PrevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
);
const NextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z"/></svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
);
const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const YouTubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, color: '#ff0000' }}><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const SpotifyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, color: '#1db954' }}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.894-.978-.335.077-.67-.133-.746-.47-.077-.335.133-.67.47-.746 3.847-.88 7.143-.51 9.823 1.13.295.18.387.563.207.857zm1.226-2.724c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.673-1.114 8.243-.57 11.35 1.343.366.226.486.707.258 1.071zm.106-2.833C14.392 8.81 8.57 8.618 5.176 9.648a1.002 1.002 0 1 1-.58-1.916c3.896-1.182 10.32-.957 14.374 1.45 1.012.6 1.336 1.91.737 2.922-.6 1.01-1.91 1.335-2.92 1.05z"/></svg>
);

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

const YOUTUBE_PLAYLISTS = {
  study: [
    {
      id: 'yt-study-1',
      title: 'Lofi Hip Hop Radio - Beats to Study/Relax',
      artist: 'Lofi Girl',
      source: 'youtube',
      embedId: 'jfKfPfyJRdk',
      cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (차분한 로파이 비트가 흘러나옵니다)\n[00:10] 공부와 집중을 위한 완벽한 리듬.\n[00:20] Planor와 함께 효율을 높여보세요.\n[00:35] 📚 끝까지 화이팅!'
    },
    {
      id: 'yt-study-2',
      title: 'Deep Focus Ambient Music',
      artist: 'Study Ambient',
      source: 'youtube',
      embedId: '5qap5aO4i9A',
      cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (잔잔한 엠비언트 사운드스케이프)\n[00:15] 마음을 비우고 집중에 몰입하세요.\n[00:30] 복잡한 생각을 지우는 잔잔한 선율.'
    }
  ],
  work: [
    {
      id: 'yt-work-1',
      title: 'Productive Jazz for Office Focus',
      artist: 'Cafe Music BGM',
      source: 'youtube',
      embedId: 'c0_ejQQcrwI',
      cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (차분하고 세련된 카페 재즈 비지엠)\n[00:15] 창밖을 바라보며 깊은 사색과 코딩.\n[00:40] 업무 효율을 극대화하는 연주곡.'
    }
  ],
  rest: [
    {
      id: 'yt-rest-1',
      title: 'Cozy Rain Cafe Ambience',
      artist: 'Acoustic Lounge',
      source: 'youtube',
      embedId: 'c0_ejQQcrwI',
      cover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=60',
      lyrics: '[00:00] (카페 빗소리와 은은한 백색소음)\n[00:12] 잠시 긴장을 풀고 가만히 귀를 기울이세요.\n[00:30] 따뜻한 커피 한 잔의 여유를 느낍니다.'
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
      return { source: 'spotify', embedId: parts };
    }
  }
  return null;
}

export default function MusicWidget({ isMobile, isOpen, onClose }) {
  // Player Mode: youtube | spotify
  const [playerMode, setPlayerMode] = useLS('planor-v2-player-mode', 'youtube');
  
  // YouTube states
  const [category, setCategory] = useState('study');
  const [activeTrack, setActiveTrack] = useState(YOUTUBE_PLAYLISTS.study[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [expanded, setExpanded] = useLS('planor-v2-music-expanded', false);

  // Spotify states
  const [spotifyClientId, setSpotifyClientId] = useLS('planor-spotify-client-id', '');
  const [spotifyToken, setSpotifyToken] = useLS('planor-spotify-token', '');
  const [isSpotifySynced, setIsSpotifySynced] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState({
    title: '연동 대기 중',
    artist: 'Spotify 앱 연동이 필요합니다',
    cover: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&auto=format&fit=crop&q=60',
    progress: 0,
    duration: 0,
    isPlaying: false
  });

  // Widget Position & Size states
  const [pos, setPos] = useLS('planor-v2-music-pos', { x: window.innerWidth - 340, y: 24 });
  const [userDimensions, setUserDimensions] = useLS('planor-v2-music-user-dim', { width: 320, height: 480 });
  const [dimensions, setDimensions] = useState({ width: 320, height: 480 });
  
  const [dragging, setDragging] = useState(false);
  const relPos = useRef({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  // Sync dimensions with userDimensions by default
  useEffect(() => {
    setDimensions(userDimensions);
  }, [userDimensions]);

  // Lyrics sync states (for YouTube)
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
        setPlayerMode('spotify');
        window.location.hash = ''; // clear hash
      }
    }
  }, [setSpotifyToken, setPlayerMode]);

  // Sync token state
  useEffect(() => {
    if (spotifyToken) {
      setIsSpotifySynced(true);
    }
  }, [spotifyToken]);

  // Spotify Currently Playing Poller
  useEffect(() => {
    if (playerMode !== 'spotify' || !isSpotifySynced || !spotifyToken) return;

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
            setSpotifyTrack({
              title: data.item.name,
              artist: data.item.artists.map(a => a.name).join(', '),
              cover: data.item.album.images[0]?.url || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&auto=format&fit=crop&q=60',
              progress: Math.floor(data.progress_ms / 1000),
              duration: Math.floor(data.item.duration_ms / 1000),
              isPlaying: data.is_playing
            });
          }
        } else if (res.status === 401) {
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
  }, [playerMode, isSpotifySynced, spotifyToken, setSpotifyToken]);

  // YouTube Iframe API Integration
  useEffect(() => {
    if (playerMode !== 'youtube' || activeTrack.source !== 'youtube') {
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

      progressInterval = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          try {
            setCurrentTime(Math.floor(ytPlayerRef.current.getCurrentTime()));
          } catch (e) {}
        }
      }, 500);
    };

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

    retryInterval = setInterval(() => {
      if (!ytPlayerRef.current && document.getElementById('yt-player-target') && window.YT && window.YT.Player) {
        initYTPlayer();
      }
    }, 1000);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [playerMode, activeTrack.embedId]);

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

  // Update current lyric index
  useEffect(() => {
    if (playerMode !== 'youtube') return;
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
  }, [currentTime, lyricsLines, playerMode]);

  // Scroll lyric to center
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.childNodes[currentLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  // Drag handlers (Position Move with Snapping)
  const handleMouseDown = (e) => {
    if (isMobile) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('iframe') || e.target.closest('.track-list') || e.target.closest('.lyrics-lines') || e.target.closest('.player-mode-tabs') || e.target.closest('.music-resize-handle')) return;
    
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

      // Restrict to screen bounds
      nextX = Math.max(10, Math.min(window.innerWidth - dimensions.width - 10, nextX));
      nextY = Math.max(10, Math.min(window.innerHeight - (expanded ? dimensions.height : 60) - 10, nextY));

      // Snapping points: Top-Right (Snap 1), Below Top Navigation (Snap 2), Left Sidebar Bottom (Snap 3)
      const snapPoints = [
        { x: window.innerWidth - dimensions.width - 24, y: 24, w: 300, h: 420, label: 'top-right' },
        { x: window.innerWidth - dimensions.width - 24, y: 120, w: 320, h: 460, label: 'right-subtop' },
        { x: 24, y: window.innerHeight - (expanded ? 400 : 60) - 24, w: 280, h: 380, label: 'left-bottom' }
      ];

      let activeSnap = null;
      for (const pt of snapPoints) {
        const dist = Math.hypot(nextX - pt.x, nextY - pt.y);
        if (dist < 40) {
          nextX = pt.x;
          nextY = pt.y;
          activeSnap = pt;
          break;
        }
      }

      if (activeSnap) {
        setDimensions({ width: activeSnap.w, height: activeSnap.h });
      } else {
        setDimensions(userDimensions);
      }
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
  }, [dragging, pos, dimensions, expanded, userDimensions, setPos]);

  // Drag handler (Size Resize)
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const newWidth = Math.max(280, Math.min(640, startWidth + dx));
      const newHeight = Math.max(260, Math.min(650, startHeight + dy));
      
      setUserDimensions({ width: newWidth, height: newHeight });
      setDimensions({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // YouTube Next / Prev
  function handlePrev() {
    if (playerMode !== 'youtube') return;
    const list = YOUTUBE_PLAYLISTS[category];
    const idx = list.findIndex(t => t.id === activeTrack.id);
    if (idx > 0) {
      setActiveTrack(list[idx - 1]);
    } else {
      setActiveTrack(list[list.length - 1]);
    }
    setIsPlaying(true);
  }

  function handleNext() {
    if (playerMode !== 'youtube') return;
    const list = YOUTUBE_PLAYLISTS[category];
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
    if (parsed && parsed.source === 'youtube') {
      const newTrack = {
        id: 'custom-' + Date.now(),
        title: '사용자 외부 유튜브 음악',
        artist: '유튜브 재생 연동 완료',
        source: 'youtube',
        embedId: parsed.embedId,
        cover: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&auto=format&fit=crop&q=60',
        lyrics: '[00:00] 외부 연동 플레이어는 가사가 지원되지 않습니다.\n[00:10] 플레이어 자체 자막 또는 진행 바를 이용해 감상하세요.'
      };
      setActiveTrack(newTrack);
      setCustomUrl('');
      setIsPlaying(true);
    } else {
      alert('올바른 YouTube 영상 주소(링크)를 입력하세요.');
    }
  }

  // Spotify OAuth Redirect
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

  const isYT = playerMode === 'youtube';
  const displayTitle = isYT ? activeTrack.title : spotifyTrack.title;
  const displayArtist = isYT ? activeTrack.artist : spotifyTrack.artist;
  const displayCover = isYT ? activeTrack.cover : spotifyTrack.cover;
  const displayIsPlaying = isYT ? isPlaying : spotifyTrack.isPlaying;

  const fmtMinSec = (sec) => {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  const renderCompact = () => (
    <div className={`music-compact-player ${dragging ? 'dragging' : ''}`} onMouseDown={handleMouseDown}>
      {!isMobile && (
        <div className="drag-handle-dots" title="드래그하여 이동 (특정 모서리 부근 스냅)">
          ⁝⁝
        </div>
      )}
      <img src={displayCover} alt="Cover" className="album-art" />
      <div className="track-info">
        <div className="title">{displayTitle}</div>
        <div className="artist">{displayArtist}</div>
      </div>
      <div className="controls">
        {isYT && (
          <>
            <button onClick={handlePrev} className="ctrl-btn" title="이전 곡"><PrevIcon /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="ctrl-btn play-pause" title={isPlaying ? '일시정지' : '재생'}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={handleNext} className="ctrl-btn" title="다음 곡"><NextIcon /></button>
          </>
        )}
        {!isYT && (
          <span className="sync-badge-pill" style={{ color: displayIsPlaying ? 'var(--green)' : 'var(--text-muted)' }}>
            {displayIsPlaying ? '🟢 Live' : '⏸ Pause'}
          </span>
        )}
        <button onClick={() => setExpanded(!expanded)} className="ctrl-btn size-toggle" title="상세 조절">
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {/* Tiny timeline progress bar */}
      {isYT && isPlaying && (
        <div className="compact-progress-bar" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--border)',
          overflow: 'hidden',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)'
        }}>
          <div style={{
            width: `${activeTrack.lyrics ? (currentTime % 60) * 1.66 : 0}%`,
            height: '100%',
            background: 'var(--accent)'
          }} />
        </div>
      )}
    </div>
  );

  const renderExpanded = () => {
    const isWide = !isMobile && dimensions.width >= 480;

    const renderYoutubePanel = () => {
      if (isWide) {
        return (
          <div className="music-expanded-wide">
            {/* Left Column */}
            <div className="left-column">
              <div className="embed-container" style={{ flex: 'none' }}>
                <div id="yt-player-target" style={{ width: '100%', height: '100%' }}></div>
              </div>
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeTrack.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {activeTrack.artist}
                </div>
              </div>
              
              <div className="lyrics-panel" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
                    <span className="timer-badge">{fmtMinSec(currentTime)}</span>
                  </div>
                </div>
                <div ref={lyricsContainerRef} className="lyrics-lines" style={{ flex: 1 }}>
                  {lyricsLines.map((line, idx) => (
                    <div key={idx} className={`lyric-line ${currentLyricIndex === idx ? 'active' : ''}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              <div className="category-tabs" style={{ flex: 'none' }}>
                <button onClick={() => setCategory('study')} className={category === 'study' ? 'active' : ''}>📚 공부</button>
                <button onClick={() => setCategory('work')} className={category === 'work' ? 'active' : ''}>💻 업무</button>
                <button onClick={() => setCategory('rest')} className={category === 'rest' ? 'active' : ''}>😴 휴식</button>
              </div>

              <div className="track-list">
                {YOUTUBE_PLAYLISTS[category].map(track => (
                  <div
                    key={track.id}
                    onClick={() => { setActiveTrack(track); setIsPlaying(true); }}
                    className={`track-item ${activeTrack.id === track.id ? 'active' : ''}`}
                  >
                    <span className="source-badge" style={{ background: 'var(--red)' }}>YT</span>
                    <div className="info">
                      <div className="title">{track.title}</div>
                      <div className="artist">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="custom-url-wrap" style={{ flex: 'none' }}>
                <input
                  placeholder="YouTube URL 입력..."
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') loadCustomUrl(); }}
                />
                <button onClick={loadCustomUrl}>불러오기</button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <>
          <div className="embed-container">
            <div id="yt-player-target" style={{ width: '100%', height: '100%' }}></div>
          </div>

          <div className="category-tabs">
            <button onClick={() => setCategory('study')} className={category === 'study' ? 'active' : ''}>📚 공부</button>
            <button onClick={() => setCategory('work')} className={category === 'work' ? 'active' : ''}>💻 업무</button>
            <button onClick={() => setCategory('rest')} className={category === 'rest' ? 'active' : ''}>😴 휴식</button>
          </div>

          <div className="track-list">
            {YOUTUBE_PLAYLISTS[category].map(track => (
              <div
                key={track.id}
                onClick={() => { setActiveTrack(track); setIsPlaying(true); }}
                className={`track-item ${activeTrack.id === track.id ? 'active' : ''}`}
              >
                <span className="source-badge" style={{ background: 'var(--red)' }}>YT</span>
                <div className="info">
                  <div className="title">{track.title}</div>
                  <div className="artist">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="custom-url-wrap">
            <input
              placeholder="YouTube 동영상 주소 입력..."
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loadCustomUrl(); }}
            />
            <button onClick={loadCustomUrl}>불러오기</button>
          </div>

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
                <span className="timer-badge">{fmtMinSec(currentTime)}</span>
              </div>
            </div>
            <div ref={lyricsContainerRef} className="lyrics-lines">
              {lyricsLines.map((line, idx) => (
                <div key={idx} className={`lyric-line ${currentLyricIndex === idx ? 'active' : ''}`}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </>
      );
    };

    return (
      <div 
        className="music-expanded-panel"
        style={isMobile ? {} : { height: dimensions.height - 60 }}
      >
        {/* Mode Selector Tabs with Premium SVGs */}
        <div className="player-mode-tabs">
          <button onClick={() => { setPlayerMode('youtube'); setShowSettings(false); }} className={isYT ? 'active' : ''}>
            <YouTubeIcon /> YouTube
          </button>
          <button onClick={() => { setPlayerMode('spotify'); setShowSettings(false); }} className={!isYT ? 'active' : ''}>
            <SpotifyIcon /> Spotify
          </button>
        </div>

        {showSettings ? (
          <div className="settings-panel">
            <div className="settings-title"><SettingsIcon /> API 연동 설정</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
              Spotify에서 실시간 재생 정보를 받아옵니다. 아래 순서대로 연동을 완료해주세요.<br/>
              1. Spotify Developer에서 앱을 생성합니다.<br/>
              2. Redirect URI에 <strong>{window.location.origin}/</strong>을 등록합니다.<br/>
              3. Client ID를 아래에 입력하고 로그인하세요.
            </div>
            <div className="input-wrap" style={{ marginBottom: 8 }}>
              <input 
                placeholder="스포티파이 Client ID 입력"
                value={spotifyClientId}
                onChange={e => setSpotifyClientId(e.target.value)}
                style={{ fontSize: 11, padding: 6 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {isSpotifySynced ? (
                <button className="btn btn-danger btn-sm" onClick={disconnectSpotify} style={{ flex: 1 }}>연동 해제</button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={connectSpotify} style={{ flex: 1 }}>로그인 연동</button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(false)}>닫기</button>
            </div>
          </div>
        ) : (
          <>
            {isYT ? (
              renderYoutubePanel()
            ) : (
              /* Spotify Panel */
              <div className="spotify-sync-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>스포티파이 연동 상태</span>
                  <button onClick={() => setShowSettings(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 8px' }}>
                    <SettingsIcon /> 설정
                  </button>
                </div>
                {isSpotifySynced ? (
                  <>
                    <div style={{ textAlign: 'center', padding: '12px 8px' }}>
                      <img 
                        src={spotifyTrack.cover} 
                        alt="Spotify Cover" 
                        style={{ width: 120, height: 120, borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', marginBottom: 12 }} 
                      />
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {spotifyTrack.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{spotifyTrack.artist}</div>
                    </div>

                    {spotifyTrack.duration > 0 && (
                      <div style={{ padding: '0 4px', marginBottom: 12 }}>
                        <div className="spotify-progress-wrap">
                          <div 
                            className="spotify-progress-fill" 
                            style={{ width: `${(spotifyTrack.progress / spotifyTrack.duration) * 100}%` }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                          <span>{fmtMinSec(spotifyTrack.progress)}</span>
                          <span>{fmtMinSec(spotifyTrack.duration)}</span>
                        </div>
                      </div>
                    )}

                    <div className="sync-status-msg" style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, textAlign: 'center', background: 'var(--green-light)', padding: '6px 12px', borderRadius: 4 }}>
                      🟢 기기에서 실시간 재생 연동 중
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '12px 6px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>🟢 Spotify 라이브 연동 안내</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                      휴대폰이나 PC의 Spotify 앱에서 지금 재생 중인 음악 정보를 Planor에 실시간으로 동기화합니다.
                      우측 상단 ⚙️ 설정을 클릭해 연동을 완료해주세요.
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Resizing drag handle (Only for desktop) */}
        {!isMobile && (
          <div 
            className="music-resize-handle" 
            onMouseDown={handleResizeMouseDown}
          >
            ◢
          </div>
        )}
      </div>
    );
  };

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
        width: dimensions.width,
        height: expanded ? dimensions.height : 'auto',
        zIndex: 2147483647
      }}
    >
      {renderCompact()}
      {expanded && renderExpanded()}
    </div>
  );
}
