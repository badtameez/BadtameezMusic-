/**
 * MAHAVEER JAIN — Official Discography & Audio Engine
 * Complete 11-Track Discography with YouTube & Spotify In-Player Playback
 */

class OfficialMusicEngine {
  constructor() {
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.currentTime = 0;
    this.timerInterval = null;

    // Complete Discography Catalogue
    this.tracks = [
      {
        id: 1,
        title: "1. Shodh",
        subtitle: "Original Philosophical Rap · Mahaveer Jain",
        genre: "Philosophical Poetry & Rap",
        duration: "03:24",
        durationSec: 204,
        artwork: "assets/images/song-shodh.jpg",
        availability: "youtube",
        youtubeId: "bv7Ve8PqPJc",
        youtubeUrl: "https://youtu.be/bv7Ve8PqPJc?si=-r8NfXKP18qP54UW",
        description: "A profound poetic search into identity, truth, existence, and the restless human spirit.",
        quote: "“Khud ki talaash mein jo nikle hain, wahi toh nayi manzil banaate hain!”"
      },
      {
        id: 2,
        title: "2. Tajurbe ft. Sanju",
        subtitle: "Hip-Hop Collaboration",
        genre: "Hip-Hop / Wordplay Collab",
        duration: "03:10",
        durationSec: 190,
        artwork: "assets/images/song-tajurbe.jpg",
        availability: "youtube",
        youtubeId: "HOwq_W8CinY",
        youtubeUrl: "https://youtu.be/HOwq_W8CinY?si=I1yI6ULAB7ByG7vZ",
        description: "Experiences forged in fire. Hard-hitting rhymes and street-smart wisdom.",
        quote: "“Tajurbe hi toh hain jo har mod par chalna sikhate hain.”"
      },
      {
        id: 3,
        title: "3. Jaisa meri maa chahti hain",
        subtitle: "Heartfelt Emotional Spoken Rap",
        genre: "Emotional / Mother Tribute",
        duration: "03:45",
        durationSec: 225,
        artwork: "assets/images/song-jaisa-meri-maa.jpg",
        availability: "youtube",
        youtubeId: "bT2K5c-McCQ",
        youtubeUrl: "https://youtu.be/bT2K5c-McCQ?si=IorBnfuh-lvWpjpO",
        description: "An emotional and intimate ode dedicated to a mother's dreams and maternal blessings.",
        quote: "“Maa ki duaon se badhkar duniya mein koi daulat nahi.”"
      },
      {
        id: 4,
        title: "4. Khwaabo mein",
        subtitle: "Official Single · Spotify Release",
        genre: "Soulful Dream Pop · Naram Dil",
        duration: "03:12",
        durationSec: 192,
        artwork: "assets/images/khwaabo-mein-spotify.jpg",
        availability: "spotify",
        spotifyId: "4CtsdqgQhuUVv4SFxA3cI8",
        spotifyUrl: "https://open.spotify.com/track/4CtsdqgQhuUVv4SFxA3cI8?si=ab2e3d1f35c241ab",
        description: "Drifting through nostalgic midnight reveries and unspoken romantic connections.",
        quote: "“Khwaabon mein hi sahi, tumse mulaqaat toh hoti hai.”"
      },
      {
        id: 5,
        title: "5. Thaam Lo",
        subtitle: "Soulful Ballad · Spotify Release",
        genre: "Acoustic Romantic Ballad",
        duration: "03:28",
        durationSec: 208,
        artwork: "assets/images/khwaabo-mein-spotify.jpg",
        availability: "spotify",
        spotifyId: "2fxy3twNKXZHKcq3paNCTx",
        spotifyUrl: "https://open.spotify.com/track/2fxy3twNKXZHKcq3paNCTx?si=3454d921d62542e8",
        description: "A tender plea for intimacy, togetherness, and holding on through turbulent tides.",
        quote: "“Thaam lo haath mera, safar lamba hi sahi par haseen hoga.”"
      },
      {
        id: 6,
        title: "6. Aao Naa",
        subtitle: "Soulful Romantic Ballad",
        genre: "Soulful Romance · Naram Dil",
        duration: "03:35",
        durationSec: 215,
        artwork: "assets/images/song-aao-naa.jpg",
        availability: "both",
        youtubeId: "QCf7O4lZgGU",
        youtubeUrl: "https://youtu.be/QCf7O4lZgGU?si=dZPQdhgYngkk6wz1",
        spotifyUrl: "https://open.spotify.com/search/Aao%20Naa%20Mahaveer",
        description: "An intimate and tender melodic poetry capturing the depth of romantic longing.",
        quote: "“Faasle mit jaate hain jab dilon ki aawaaz ek ho jaati hai.”"
      },
      {
        id: 7,
        title: "7. Dhoondhta Hoon",
        subtitle: "Introspective Hip-Hop",
        genre: "Introspective Melodic Rap",
        duration: "03:18",
        durationSec: 198,
        artwork: "assets/images/song-dhoondhta-hoon.jpg",
        availability: "both",
        youtubeId: "HuJdIu453u4",
        youtubeUrl: "https://youtu.be/HuJdIu453u4?si=JjEGGpdz-PvmtHPg",
        spotifyUrl: "https://open.spotify.com/search/Dhoondhta%20Hoon%20Mahaveer",
        description: "Searching for meaning and serenity amidst the relentless noise of modern existence.",
        quote: "“Dhoondhta hoon khud ko un raaston pe jahaan koi chal nahi paaya.”"
      },
      {
        id: 8,
        title: "8. Unstable",
        subtitle: "Alternative Hip-Hop",
        genre: "Alternative Dark Rap",
        duration: "02:54",
        durationSec: 174,
        artwork: "assets/images/song-unstable.jpg",
        availability: "both",
        youtubeId: "1WXY_4yWrwQ",
        youtubeUrl: "https://youtu.be/1WXY_4yWrwQ?si=upbFRevkG9FkftcK",
        spotifyUrl: "https://open.spotify.com/search/Unstable%20Mahaveer",
        description: "Raw vulnerability confronting chaos, inner turbulence, and psychological balance.",
        quote: "“Toot kar bhi jo muskuraye, wahi toh asli dastaan likhta hai.”"
      },
      {
        id: 9,
        title: "9. Teri Kasam",
        subtitle: "Acoustic Romantic Melodies",
        genre: "Contemporary Romance",
        duration: "03:40",
        durationSec: 220,
        artwork: "assets/images/song-teri-kasam.jpg",
        availability: "both",
        youtubeId: "JX--i9FWslU",
        youtubeUrl: "https://youtu.be/JX--i9FWslU?si=2mDAA2SCP1PDoUsb",
        spotifyUrl: "https://open.spotify.com/search/Teri%20Kasam%20Mahaveer",
        description: "Sacred promises, gentle melodies, and unwavering commitment of love.",
        quote: "“Har kasam se badhkar hai tera saath.”"
      },
      {
        id: 10,
        title: "10. Shiv-Shiv",
        subtitle: "Devotional Cosmic Energy",
        genre: "Spiritual / Devotional Fusion",
        duration: "03:48",
        durationSec: 228,
        artwork: "assets/images/song-shiv-shiv.jpg",
        availability: "both",
        youtubeId: "6HV8Dp8NAaI",
        youtubeUrl: "https://youtu.be/6HV8Dp8NAaI?si=nLCVc0WrrHyA6R9m",
        spotifyUrl: "https://open.spotify.com/search/Shiv-Shiv%20Mahaveer",
        description: "A powerful ode to the cosmic dancer, vibrating with transcendental chants and divine devotion.",
        quote: "“Har har Mahadev — anant se anant tak goonjta ek hi naam!”"
      },
      {
        id: 11,
        title: "11. Kaalia Freestyle",
        subtitle: "Raw Flow & Aggressive Wordplay",
        genre: "Freestyle Hip-Hop · Garam Alfaaz",
        duration: "02:50",
        durationSec: 170,
        artwork: "assets/images/kaalia-freestyle-spotify.jpg",
        availability: "both",
        youtubeId: "oG0lLpc6FEk",
        youtubeUrl: "https://youtu.be/oG0lLpc6FEk?si=dpbX_2jraPPGm1--",
        spotifyUrl: "https://open.spotify.com/search/Kaalia%20Freestyle%20Mahaveer",
        description: "Unfiltered fire, fearless cadences, and raw lyricism. Mahaveer's 'garam alfaaz' in pure sonic form.",
        quote: "“Jo sach hai woh kahenge, chahe kaanp uthe yeh saaz!”"
      }
    ];

    this.initElements();
    this.initCanvas();
    this.attachEventListeners();
    this.updateTrackUI();
    this.fetchDynamicTracks();
  }

  async fetchDynamicTracks() {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        if (data.songs && data.songs.length > 0) {
          this.tracks = data.songs;
          this.updateTrackUI();
          this.renderFeaturedList();
        }
      }
    } catch (e) {
      // offline fallback
    }
  }

  renderFeaturedList() {
    const listContainer = document.getElementById('discographyTrackList');
    if (!listContainer) return;

    const featured = this.tracks.filter(t => t.isFeatured !== false);
    const displayTracks = featured.length > 0 ? featured.slice(0, 4) : this.tracks.slice(0, 4);

    const tracksHtml = displayTracks.map(t => {
      const trackIdx = this.tracks.findIndex(s => s.id === t.id);
      const isPlayingCurrent = trackIdx === this.currentTrackIndex;
      const isYt = t.availability === 'youtube';
      const isSp = t.availability === 'spotify';

      return `
        <div class="track-item ${isPlayingCurrent ? 'playing' : ''}" onclick="window.creativeAudioEngine.selectTrack(${trackIdx})">
          <div class="track-thumb">
            <img src="${t.artwork || 'assets/images/song-shodh.jpg'}" alt="${t.title}">
            <div class="track-play-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="track-details">
            <h4 class="track-title">${t.title}</h4>
            <p class="track-subtitle">
              <span class="badge-${isYt ? 'yt-only' : isSp ? 'spotify-only' : 'both'}">${isYt ? 'YouTube' : isSp ? 'Spotify' : 'YouTube & Spotify'}</span>
              ${t.genre || 'Single'} · ${t.duration || '03:20'}
            </p>
            <p class="track-description">${t.description || ''}</p>
          </div>
          <div class="track-links">
            <button class="track-ext-btn track-play-inline-btn" onclick="window.creativeAudioEngine.selectTrack(${trackIdx}); event.stopPropagation();" title="Play inside website player">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>Play</span>
            </button>
            ${t.youtubeUrl ? `
              <a href="${t.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="track-ext-btn" onclick="event.stopPropagation()" title="Open on YouTube">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            ` : ''}
            ${t.spotifyUrl ? `
              <a href="${t.spotifyUrl}" target="_blank" rel="noopener noreferrer" class="track-ext-btn" onclick="event.stopPropagation()" title="Open on Spotify">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.5-3.3c-.3.4-.8.5-1.2.3-3-1.8-7.5-2.4-11-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 4-1.2 9-.6 12.4 1.5.4.2.5.7.2 1.1zm.1-3.4C15.5 8.4 9.5 8.2 6 9.3c-.5.2-1.1-.1-1.3-.7-.2-.5.1-1.1.7-1.3 4.1-1.2 10.8-1 14.8 1.4.5.3.7.9.4 1.4-.3.5-.9.7-1.5.5z"/></svg>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    const btnHtml = `
      <button class="btn-see-all-songs" id="seeAllSongsBtn" onclick="window.creativeAudioEngine.openCatalogueModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>See All Original Songs (${this.tracks.length} Releases)</span>
      </button>
    `;

    listContainer.innerHTML = tracksHtml + btnHtml;
  }

  initElements() {
    this.playBtn = document.getElementById("masterPlayBtn");
    this.prevBtn = document.getElementById("masterPrevBtn");
    this.nextBtn = document.getElementById("masterNextBtn");
    this.progressBar = document.getElementById("playerProgressBar");
    this.progressFill = document.getElementById("playerProgressFill");
    this.currentTimeEl = document.getElementById("playerCurrentTime");
    this.totalTimeEl = document.getElementById("playerTotalTime");
    this.volumeSlider = document.getElementById("playerVolumeSlider");
    this.artworkImg = document.getElementById("masterArtworkImg");
    this.trackTitleEl = document.getElementById("masterTrackTitle");
    this.trackMetaEl = document.getElementById("masterTrackMeta");
    this.lyricsModalBtn = document.getElementById("viewLyricsModalBtn");
    this.watchYtBtn = document.getElementById("watchYoutubeBtn");
    this.spotifyBtn = document.getElementById("listenSpotifyBtn");
    this.videoEmbedContainer = document.getElementById("playerVideoEmbedContainer");
    this.artworkWrap = document.querySelector(".player-artwork-wrap");
    this.canvas = document.getElementById("audioVisualizerCanvas");
    this.seeAllBtn = document.getElementById("seeAllSongsBtn");
  }

  initCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.drawVisualizer();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio || 600;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio || 64;
  }

  embedMedia(autoPlay = true) {
    const track = this.tracks[this.currentTrackIndex];
    if (!this.videoEmbedContainer) return;

    if (track.youtubeId) {
      // Embed YouTube
      this.videoEmbedContainer.innerHTML = `
        <iframe 
          id="ytPlayerIframe"
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/${track.youtubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}" 
          title="${track.title} - Mahaveer Jain" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen
          style="border-radius: var(--radius-md); width:100%; height:100%; border:0; display:block;"
        ></iframe>
      `;
      this.videoEmbedContainer.style.display = "block";
    } else if (track.spotifyId) {
      // Embed Spotify
      this.videoEmbedContainer.innerHTML = `
        <iframe 
          style="border-radius:12px" 
          src="https://open.spotify.com/embed/track/${track.spotifyId}?utm_source=generator&theme=0" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy">
        </iframe>
      `;
      this.videoEmbedContainer.style.display = "block";
    }
  }

  removeMedia() {
    if (this.videoEmbedContainer) {
      this.videoEmbedContainer.innerHTML = "";
      this.videoEmbedContainer.style.display = "none";
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.embedMedia(true);

    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      this.playBtn.setAttribute("title", "Pause");
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTime++;
      const currentTrack = this.tracks[this.currentTrackIndex];
      if (this.currentTime >= currentTrack.durationSec) {
        this.nextTrack();
      } else {
        this.updateProgressUI();
      }
    }, 1000);

    this.highlightActiveTrackItem();
  }

  pause() {
    this.isPlaying = false;
    this.removeMedia();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      this.playBtn.setAttribute("title", "Play");
    }

    this.highlightActiveTrackItem();
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.currentTime = 0;
    this.updateTrackUI();
    this.play();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.currentTime = 0;
    this.updateTrackUI();
    this.play();
  }

  selectTrack(index) {
    this.currentTrackIndex = index;
    this.currentTime = 0;
    this.updateTrackUI();
    this.play();

    // Scroll player smoothly into view
    const masterCard = document.querySelector(".master-player-card");
    if (masterCard) {
      masterCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  updateTrackUI() {
    const track = this.tracks[this.currentTrackIndex];
    if (!track) return;

    if (this.artworkImg) {
      this.artworkImg.src = track.artwork;
      this.artworkImg.alt = `${track.title} - Mahaveer Jain`;
    }

    if (this.trackTitleEl) {
      this.trackTitleEl.textContent = track.title;
    }

    if (this.trackMetaEl) {
      let badgeHtml = '';
      if (track.availability === 'youtube') {
        badgeHtml = '<span class="badge-yt-only">YouTube Only</span>';
      } else if (track.availability === 'spotify') {
        badgeHtml = '<span class="badge-spotify-only">Spotify Only</span>';
      } else {
        badgeHtml = '<span class="badge-both">YouTube & Spotify</span>';
      }

      this.trackMetaEl.innerHTML = `
        <span class="player-genre-tag">${track.genre}</span>
        ${badgeHtml}
        <span>${track.subtitle}</span>
      `;
    }

    if (this.totalTimeEl) {
      this.totalTimeEl.textContent = track.duration;
    }

    // Dynamic streaming buttons
    if (this.watchYtBtn) {
      if (track.youtubeUrl) {
        this.watchYtBtn.href = track.youtubeUrl;
        this.watchYtBtn.style.display = "inline-flex";
      } else {
        this.watchYtBtn.style.display = "none";
      }
    }

    if (this.spotifyBtn) {
      if (track.spotifyUrl) {
        this.spotifyBtn.href = track.spotifyUrl;
        this.spotifyBtn.style.display = "inline-flex";
      } else {
        this.spotifyBtn.style.display = "none";
      }
    }

    this.updateProgressUI();
    this.highlightActiveTrackItem();
  }

  updateProgressUI() {
    const track = this.tracks[this.currentTrackIndex];
    if (!track) return;

    const percent = (this.currentTime / track.durationSec) * 100;
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }
  }

  highlightActiveTrackItem() {
    const items = document.querySelectorAll(".track-item");
    items.forEach((item, idx) => {
      if (idx === this.currentTrackIndex) {
        item.classList.add("playing");
      } else {
        item.classList.remove("playing");
      }
    });
  }

  attachEventListeners() {
    if (this.playBtn) this.playBtn.addEventListener("click", () => this.togglePlay());
    if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.nextTrack());
    if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.prevTrack());

    if (this.artworkWrap) {
      this.artworkWrap.addEventListener("click", () => {
        if (!this.isPlaying) this.play();
      });
    }

    if (this.progressBar) {
      this.progressBar.addEventListener("click", (e) => {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        const track = this.tracks[this.currentTrackIndex];
        this.currentTime = Math.floor(percent * track.durationSec);
        this.updateProgressUI();
      });
    }

    if (this.seeAllBtn) {
      this.seeAllBtn.addEventListener("click", () => this.openCatalogueModal());
    }
  }

  openCatalogueModal() {
    const modalOverlay = document.getElementById("universalModalOverlay");
    const modalBody = document.getElementById("modalBodyContent");
    if (!modalOverlay || !modalBody) return;

    const renderList = (filter = 'all') => {
      let filteredTracks = this.tracks;
      if (filter !== 'all') {
        filteredTracks = this.tracks.filter(t => t.availability === filter);
      }

      return filteredTracks.map((t, originalIndex) => {
        const actualIndex = this.tracks.findIndex(item => item.id === t.id);
        let badge = '';
        if (t.availability === 'youtube') badge = '<span class="badge-yt-only">YouTube</span>';
        else if (t.availability === 'spotify') badge = '<span class="badge-spotify-only">Spotify</span>';
        else badge = '<span class="badge-both">YouTube & Spotify</span>';

        return `
          <div class="catalogue-item" onclick="window.creativeAudioEngine.selectTrackAndCloseModal(${actualIndex})">
            <img src="${t.artwork}" alt="${t.title}" class="catalogue-item-thumb">
            <div class="catalogue-item-info">
              <h4 class="catalogue-item-title">${t.title}</h4>
              <p class="catalogue-item-meta">${t.genre} · ${t.duration}</p>
            </div>
            <div class="catalogue-badges">
              ${badge}
              <button class="track-ext-btn track-play-inline-btn" style="padding: 0.35rem 0.75rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span>Play</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    };

    modalBody.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="section-tag" style="margin-bottom: 0.35rem;">Complete Discography</span>
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--gold-light);">Original Songs (${this.tracks.length} Releases)</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Click any song to play directly in the master player.</p>
      </div>

      <div class="catalogue-modal-filters">
        <button class="catalogue-filter-btn active" data-cat="all">All Tracks (${this.tracks.length})</button>
        <button class="catalogue-filter-btn" data-cat="youtube">YouTube Only</button>
        <button class="catalogue-filter-btn" data-cat="spotify">Spotify Only</button>
        <button class="catalogue-filter-btn" data-cat="both">Both Available</button>
      </div>

      <div class="catalogue-modal-list" id="catalogueTracksContainer">
        ${renderList('all')}
      </div>
    `;

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Attach filter click events
    const filterBtns = modalBody.querySelectorAll(".catalogue-filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        document.getElementById("catalogueTracksContainer").innerHTML = renderList(cat);
      });
    });
  }

  selectTrackAndCloseModal(index) {
    this.selectTrack(index);
    const modalOverlay = document.getElementById("universalModalOverlay");
    if (modalOverlay) {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  drawVisualizer() {
    requestAnimationFrame(() => this.drawVisualizer());
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    const time = Date.now() * 0.003;

    if (this.isPlaying) {
      const bars = 48;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const freq = Math.sin(i * 0.25 + time * 2) * 0.5 + Math.cos(i * 0.15 - time * 3) * 0.5;
        const barHeight = Math.max(6, Math.abs(freq) * height * 0.85);

        const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "rgba(200, 169, 126, 0.2)");
        gradient.addColorStop(0.5, "rgba(212, 175, 55, 0.8)");
        gradient.addColorStop(1, "rgba(243, 229, 171, 0.98)");

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
      }
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(0, height / 2);

      for (let x = 0; x < width; x += 4) {
        const y = height / 2 + Math.sin(x * 0.015 + time) * 3 + Math.cos(x * 0.008 - time) * 2;
        this.ctx.lineTo(x, y);
      }

      this.ctx.strokeStyle = "rgba(200, 169, 126, 0.35)";
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
  }
}

// Global instance initialization
window.creativeAudioEngine = null;
document.addEventListener("DOMContentLoaded", () => {
  window.creativeAudioEngine = new OfficialMusicEngine();
});

// Helper for opening poetry videos in universal modal
window.openPoetryVideoModal = (youtubeId, title, category) => {
  const modalOverlay = document.getElementById("universalModalOverlay");
  const modalBody = document.getElementById("modalBodyContent");
  if (!modalOverlay || !modalBody) return;

  modalBody.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <span class="section-tag" style="margin-bottom: 0.25rem;">${category || 'Poetry Recital'}</span>
      <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--gold-light);">${title}</h3>
      <p style="color: var(--sepia-warm); font-size: 0.85rem;">Recited by Mahaveer Jain (@BadtameezMusic)</p>
    </div>
    <div style="position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: var(--radius-md); overflow: hidden; background: #000;">
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" 
        title="${title} - Mahaveer Jain" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen
        style="border:0; position: absolute; top:0; left:0; width:100%; height:100%;"
      ></iframe>
    </div>
  `;

  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
};
