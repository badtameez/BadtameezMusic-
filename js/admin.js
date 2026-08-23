/**
 * BADTAMEEZ — Admin Dashboard Engine & Content Management Controller
 */

class AdminApp {
  constructor() {
    this.token = localStorage.getItem('badtameez_admin_token') || null;
    this.currentData = null;
    this.activeTab = 'dashboard';
    
    this.initElements();
    this.bindEvents();
    this.checkAuth();
  }

  initElements() {
    this.authScreen = document.getElementById('adminAuthScreen');
    this.loginForm = document.getElementById('adminLoginForm');
    this.logoutBtn = document.getElementById('adminLogoutBtn');
    this.navBtns = document.querySelectorAll('.nav-item-btn');
    this.tabViews = document.querySelectorAll('.tab-view-content');
    
    this.topbarTitle = document.getElementById('topbarSectionTitle');
    this.topbarDesc = document.getElementById('topbarSectionDesc');
    
    this.modalOverlay = document.getElementById('adminModalOverlay');
    this.modalTitle = document.getElementById('adminModalTitle');
    this.modalBody = document.getElementById('adminModalBody');
    this.modalCloseBtn = document.getElementById('adminModalCloseBtn');
    
    this.toast = document.getElementById('adminToast');
    this.toastMsg = document.getElementById('adminToastMsg');
    this.toastIcon = document.getElementById('adminToastIcon');
  }

  bindEvents() {
    // Login form submission
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    
    // Logout
    this.logoutBtn.addEventListener('click', () => this.handleLogout());

    // Tab Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Close Modal
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    // Section Save Buttons
    document.getElementById('saveHeroBtn')?.addEventListener('click', () => this.saveHero());
    document.getElementById('saveTechBtn')?.addEventListener('click', () => this.saveTech());
    document.getElementById('saveAboutBtn')?.addEventListener('click', () => this.saveAbout());
    document.getElementById('saveSocialsBtn')?.addEventListener('click', () => this.saveSocials());

    // Add Item Buttons
    document.getElementById('addNewSongBtn')?.addEventListener('click', () => this.openSongModal());
    document.getElementById('addNewPoetryBtn')?.addEventListener('click', () => this.openPoetryModal());
    document.getElementById('addNewPoetryCatBtn')?.addEventListener('click', () => this.openPoetryCategoryModal());
    document.getElementById('addNewRecitalBtn')?.addEventListener('click', () => this.openRecitalModal());
    document.getElementById('addNewGalleryBtn')?.addEventListener('click', () => this.openGalleryModal());
    document.getElementById('addNewProjectBtn')?.addEventListener('click', () => this.openProjectModal());
    document.getElementById('refreshMessagesBtn')?.addEventListener('click', () => this.loadMessages());

    // Change Password
    document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => this.handleChangePassword(e));
  }

  /* --------------------------------------------------------------------------
     Authentication & API Helpers
     -------------------------------------------------------------------------- */
  async apiRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(endpoint, { ...options, headers });
      if (res.status === 401 || res.status === 403) {
        this.handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
      return await res.json();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  async checkAuth() {
    if (!this.token) {
      this.showAuthScreen();
      return;
    }

    try {
      const res = await this.apiRequest('/api/admin/check-auth');
      if (res.authenticated) {
        this.hideAuthScreen();
        this.loadAllContent();
      } else {
        this.showAuthScreen();
      }
    } catch (e) {
      this.showAuthScreen();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success && data.token) {
        this.token = data.token;
        localStorage.setItem('badtameez_admin_token', data.token);
        this.hideAuthScreen();
        this.showToast('✨ Welcome to Badtameez Studio Portal!');
        this.loadAllContent();
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      alert('Login error. Please verify the server is running.');
    }
  }

  handleLogout() {
    this.token = null;
    localStorage.removeItem('badtameez_admin_token');
    this.showAuthScreen();
    this.showToast('🚪 Logged out successfully');
  }

  showAuthScreen() {
    this.authScreen.classList.remove('hidden');
  }

  hideAuthScreen() {
    this.authScreen.classList.add('hidden');
  }

  showToast(msg, icon = '✨') {
    this.toastMsg.textContent = msg;
    this.toastIcon.textContent = icon;
    this.toast.classList.add('show');
    setTimeout(() => this.toast.classList.remove('show'), 3500);
  }

  /* --------------------------------------------------------------------------
     Navigation & Tab Switching
     -------------------------------------------------------------------------- */
  switchTab(tabId) {
    this.activeTab = tabId;
    
    // Update nav buttons
    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update views
    this.tabViews.forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabId}`);
    });

    // Update topbar descriptions
    const titles = {
      dashboard: { title: 'Executive Overview', desc: 'Real-time studio statistics and quick shortcuts' },
      hero: { title: 'Hero & Identity', desc: 'Manage artist headline, tagline, quote, and hero actions' },
      tech: { title: 'Tech & Skills Architecture', desc: 'Manage frameworks, databases, tools, and enterprise projects' },
      songs: { title: 'Songs & Discography Manager', desc: 'Manage catalogue, featured releases, audio & streaming links' },
      poetry: { title: 'Poetry & Recitals Manager', desc: 'Manage dual-language verses and spoken video performances' },
      gallery: { title: 'Art & Visual Gallery', desc: 'Manage cover artworks and visual aesthetics' },
      about: { title: 'About & Soul Pillars', desc: 'Edit background bio and creative foundation' },
      messages: { title: 'Inquiries Inbox', desc: 'Visitor messages submitted through the website' },
      settings: { title: 'Settings & Security', desc: 'Manage social media channels and admin password' }
    };

    if (titles[tabId]) {
      this.topbarTitle.textContent = titles[tabId].title;
      this.topbarDesc.textContent = titles[tabId].desc;
    }

    if (tabId === 'messages') {
      this.loadMessages();
    }
  }

  /* --------------------------------------------------------------------------
     Load & Hydrate Content
     -------------------------------------------------------------------------- */
  async loadAllContent() {
    try {
      const data = await this.apiRequest('/api/content');
      this.currentData = data;
      this.populateDashboardStats();
      this.populateHeroForm();
      this.populateTechForm();
      this.populateSongsTable();
      this.populatePoetryTables();
      this.populateGalleryTable();
      this.populateAboutForm();
      this.populateSocialsForm();
      this.loadMessages();
    } catch (e) {
      console.error('Failed to load content:', e);
    }
  }

  populateDashboardStats() {
    const songs = this.currentData.songs || [];
    const written = (this.currentData.poetry && this.currentData.poetry.written) || [];
    const recitals = (this.currentData.poetry && this.currentData.poetry.recitedVideos) || [];
    
    document.getElementById('dashTotalSongs').textContent = songs.length;
    document.getElementById('dashTotalPoetry').textContent = written.length;
    document.getElementById('dashTotalRecitals').textContent = recitals.length;
    document.getElementById('badgeSongCount').textContent = songs.length;
  }

  /* --------------------------------------------------------------------------
     Hero Section
     -------------------------------------------------------------------------- */
  populateHeroForm() {
    const hero = this.currentData.hero || {};
    document.getElementById('heroArtistName').value = hero.artistName || 'Mahaveer Jain';
    document.getElementById('heroBrandName').value = hero.brandName || 'BADTAMEEZ';
    document.getElementById('heroStatusPill').value = hero.statusPill || '';
    document.getElementById('heroDescriptor').value = hero.descriptor || '';
    document.getElementById('heroQuoteHindi').value = hero.quoteHindi || '';
    document.getElementById('heroQuoteEnglish').value = hero.quoteEnglish || '';
    document.getElementById('heroCta1Text').value = (hero.ctaPrimary && hero.ctaPrimary.text) || '';
    document.getElementById('heroCta2Text').value = (hero.ctaSecondary && hero.ctaSecondary.text) || '';
  }

  async saveHero() {
    const payload = {
      artistName: document.getElementById('heroArtistName').value.trim(),
      brandName: document.getElementById('heroBrandName').value.trim(),
      statusPill: document.getElementById('heroStatusPill').value.trim(),
      descriptor: document.getElementById('heroDescriptor').value.trim(),
      quoteHindi: document.getElementById('heroQuoteHindi').value.trim(),
      quoteEnglish: document.getElementById('heroQuoteEnglish').value.trim(),
      ctaPrimary: { text: document.getElementById('heroCta1Text').value.trim(), link: '#engineer' },
      ctaSecondary: { text: document.getElementById('heroCta2Text').value.trim(), link: '#music' }
    };

    try {
      const res = await this.apiRequest('/api/admin/hero', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        this.currentData.hero = res.data;
        this.showToast('✅ Hero Section updated successfully!');
      }
    } catch (e) {
      alert('Failed to save Hero section');
    }
  }

  /* --------------------------------------------------------------------------
     Tech & Skills Section
     -------------------------------------------------------------------------- */
  populateTechForm() {
    const tech = this.currentData.tech || {};
    document.getElementById('techExpYears').value = tech.experienceYears || '7+';
    document.getElementById('techExpLabel').value = tech.experienceLabel || '';
    
    const skills = tech.skills || {};
    document.getElementById('techFrameworks').value = (skills.frameworks_languages || []).join(', ');
    document.getElementById('techDatabases').value = (skills.databases || []).join(', ');
    document.getElementById('techIdes').value = (skills.ides_tools || []).join(', ');
    document.getElementById('techAiTools').value = (skills.ai_tools || []).join(', ');

    this.renderEnterpriseProjects();
  }

  renderEnterpriseProjects() {
    const container = document.getElementById('adminProjectsListContainer');
    const projects = (this.currentData.tech && this.currentData.tech.enterpriseProjects) || [];
    
    container.innerHTML = projects.map(p => `
      <div style="background: rgba(14,12,10,0.6); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="badge-status both" style="margin-bottom: 0.35rem;">${p.category || 'Enterprise'}</span>
          <h4 style="font-size: 1.15rem; color: var(--gold-light);">${p.name} — <span style="font-size: 0.9rem; color: var(--text-secondary);">${p.fullName}</span></h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.4rem 0;">${p.description}</p>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            ${(p.techStack || []).map(t => `<span style="font-size: 0.72rem; font-family: var(--font-mono); background: rgba(200,169,126,0.12); padding: 0.1rem 0.45rem; border-radius: 4px; color: var(--sepia-warm);">${t}</span>`).join('')}
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-action-icon" title="Edit Project" onclick="window.adminApp.openProjectModal(${p.id})">✏️</button>
          <button class="btn-action-icon danger" title="Delete Project" onclick="window.adminApp.deleteProject(${p.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  openProjectModal(projectId = null) {
    const projects = (this.currentData.tech && this.currentData.tech.enterpriseProjects) || [];
    const project = projectId
      ? projects.find(p => p.id === projectId)
      : { name: '', fullName: '', category: 'State Enterprise Architecture', description: '', techStack: [] };

    this.modalTitle.textContent = projectId ? 'Edit Enterprise Project' : 'Add Enterprise Project';
    this.modalBody.innerHTML = `
      <form id="projectModalForm">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Project Acronym / Short Name</label>
            <input type="text" id="mProjName" class="form-input" value="${project.name}" required placeholder="e.g. RSMML">
          </div>
          <div class="form-group">
            <label class="form-label">Category Badge</label>
            <input type="text" id="mProjCat" class="form-input" value="${project.category}" placeholder="e.g. State Enterprise Architecture">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Full Organization / Client Name</label>
          <input type="text" id="mProjFullName" class="form-input" value="${project.fullName}" placeholder="e.g. Rajasthan State Mines and Minerals Limited">
        </div>

        <div class="form-group">
          <label class="form-label">Description of Architecture & Impact</label>
          <textarea id="mProjDesc" class="form-textarea" rows="3" placeholder="Engineered robust enterprise software solutions...">${project.description}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Tech Stack (Comma-separated)</label>
          <input type="text" id="mProjStack" class="form-input" value="${(project.techStack || []).join(', ')}" placeholder="C#, ASP.Net, IBM DB2, SQL Server">
        </div>

        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Project</button>
      </form>
    `;

    document.getElementById('projectModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const parseList = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: document.getElementById('mProjName').value.trim(),
        fullName: document.getElementById('mProjFullName').value.trim(),
        category: document.getElementById('mProjCat').value.trim(),
        description: document.getElementById('mProjDesc').value.trim(),
        techStack: parseList(document.getElementById('mProjStack').value)
      };

      try {
        const endpoint = projectId ? `/api/admin/projects/${projectId}` : '/api/admin/projects';
        const method = projectId ? 'PUT' : 'POST';
        const res = await this.apiRequest(endpoint, {
          method,
          body: JSON.stringify(payload)
        });

        if (res.success) {
          this.closeModal();
          this.showToast(projectId ? '✅ Project updated!' : '✨ New project added!');
          this.loadAllContent();
        }
      } catch (err) {
        alert('Failed to save enterprise project');
      }
    });

    this.openModal();
  }

  async deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this enterprise project?')) return;
    try {
      const res = await this.apiRequest(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Project deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete project');
    }
  }

  async saveTech() {
    const parseList = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      experienceYears: document.getElementById('techExpYears').value.trim(),
      experienceLabel: document.getElementById('techExpLabel').value.trim(),
      skills: {
        frameworks_languages: parseList(document.getElementById('techFrameworks').value),
        databases: parseList(document.getElementById('techDatabases').value),
        ides_tools: parseList(document.getElementById('techIdes').value),
        ai_tools: parseList(document.getElementById('techAiTools').value)
      }
    };

    try {
      const res = await this.apiRequest('/api/admin/tech', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        this.currentData.tech = { ...this.currentData.tech, ...res.data };
        this.showToast('✅ Tech & Skills updated successfully!');
      }
    } catch (e) {
      alert('Failed to save Tech section');
    }
  }

  /* --------------------------------------------------------------------------
     Songs & Discography CRUD
     -------------------------------------------------------------------------- */
  populateSongsTable() {
    const tbody = document.getElementById('adminSongsTableBody');
    const songs = this.currentData.songs || [];

    tbody.innerHTML = songs.map((s, idx) => `
      <tr>
        <td>
          <img src="${s.artwork || 'assets/images/song-shodh.jpg'}" alt="${s.title}" class="table-thumb">
        </td>
        <td>
          <strong style="color: var(--text-primary); font-size: 0.95rem;">${s.title}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${s.subtitle || ''}</div>
        </td>
        <td>
          <div>${s.genre || 'Single'}</div>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--sepia-warm);">${s.duration || '03:00'}</span>
        </td>
        <td>
          <span class="badge-status ${s.availability === 'youtube' ? 'yt' : s.availability === 'spotify' ? 'spotify' : 'both'}">
            ${s.availability.toUpperCase()}
          </span>
        </td>
        <td>
          ${s.isFeatured ? '<span class="badge-featured">⭐ Featured</span>' : '<span style="color: var(--text-muted); font-size: 0.75rem;">Catalogue</span>'}
        </td>
        <td style="text-align: right;">
          <button class="btn-action-icon" title="Edit Song" onclick="window.adminApp.openSongModal(${s.id})">✏️</button>
          <button class="btn-action-icon danger" title="Delete Song" onclick="window.adminApp.deleteSong(${s.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  openSongModal(songId = null) {
    const song = songId 
      ? (this.currentData.songs || []).find(s => s.id === songId)
      : { title: '', subtitle: '', genre: 'Philosophical Rap', duration: '03:20', artwork: 'assets/images/song-shodh.jpg', availability: 'youtube', youtubeUrl: '', spotifyUrl: '', isFeatured: true, description: '', lyrics: '' };

    this.modalTitle.textContent = songId ? 'Edit Song Release' : 'Add New Song Release';
    
    this.modalBody.innerHTML = `
      <form id="songModalForm">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Song Title</label>
            <input type="text" id="mSongTitle" class="form-input" value="${song.title}" required placeholder="e.g. 1. Shodh">
          </div>
          <div class="form-group">
            <label class="form-label">Subtitle / Artist Credit</label>
            <input type="text" id="mSongSubtitle" class="form-input" value="${song.subtitle}" placeholder="Original Release · Mahaveer Jain">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Genre</label>
            <input type="text" id="mSongGenre" class="form-input" value="${song.genre}">
          </div>
          <div class="form-group">
            <label class="form-label">Duration (MM:SS)</label>
            <input type="text" id="mSongDuration" class="form-input" value="${song.duration}">
          </div>
          <div class="form-group">
            <label class="form-label">Platform Availability</label>
            <select id="mSongPlatform" class="form-select">
              <option value="youtube" ${song.availability === 'youtube' ? 'selected' : ''}>YouTube Only</option>
              <option value="spotify" ${song.availability === 'spotify' ? 'selected' : ''}>Spotify Only</option>
              <option value="both" ${song.availability === 'both' ? 'selected' : ''}>Both (YouTube & Spotify)</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">YouTube URL / Video ID</label>
            <input type="text" id="mSongYoutube" class="form-input" value="${song.youtubeUrl || song.youtubeId || ''}" placeholder="https://youtu.be/...">
          </div>
          <div class="form-group">
            <label class="form-label">Spotify Track URL</label>
            <input type="text" id="mSongSpotify" class="form-input" value="${song.spotifyUrl || ''}" placeholder="https://open.spotify.com/track/...">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Artwork Image Path or Upload</label>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <input type="text" id="mSongArtwork" class="form-input" value="${song.artwork}" placeholder="assets/images/...">
            <label class="btn-add" style="white-space: nowrap; cursor: pointer;">
              Upload
              <input type="file" id="mSongArtworkFile" accept="image/*" style="display: none;" onchange="window.adminApp.handleFileUpload(this, 'mSongArtwork')">
            </label>
          </div>
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--gold-light); font-size: 0.88rem;">
            <input type="checkbox" id="mSongFeatured" ${song.isFeatured ? 'checked' : ''}>
            <span>Show in Featured Top 4 Songs on homepage</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Short Description</label>
          <input type="text" id="mSongDesc" class="form-input" value="${song.description || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Song Lyrics</label>
          <textarea id="mSongLyrics" class="form-textarea" rows="4" placeholder="Enter lyrics...">${song.lyrics || ''}</textarea>
        </div>

        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Song</button>
      </form>
    `;

    document.getElementById('songModalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSongData(songId);
    });

    this.openModal();
  }

  async saveSongData(songId) {
    const ytInput = document.getElementById('mSongYoutube').value.trim();
    let ytId = '';
    if (ytInput.includes('youtu.be/')) {
      ytId = ytInput.split('youtu.be/')[1].split('?')[0];
    } else if (ytInput.includes('v=')) {
      ytId = ytInput.split('v=')[1].split('&')[0];
    } else {
      ytId = ytInput;
    }

    const spInput = document.getElementById('mSongSpotify').value.trim();
    let spId = '';
    if (spInput.includes('/track/')) {
      spId = spInput.split('/track/')[1].split('?')[0];
    }

    const payload = {
      title: document.getElementById('mSongTitle').value.trim(),
      subtitle: document.getElementById('mSongSubtitle').value.trim(),
      genre: document.getElementById('mSongGenre').value.trim(),
      duration: document.getElementById('mSongDuration').value.trim(),
      availability: document.getElementById('mSongPlatform').value,
      youtubeUrl: ytInput,
      youtubeId: ytId,
      spotifyUrl: spInput,
      spotifyId: spId,
      artwork: document.getElementById('mSongArtwork').value.trim() || 'assets/images/song-shodh.jpg',
      isFeatured: document.getElementById('mSongFeatured').checked,
      description: document.getElementById('mSongDesc').value.trim(),
      lyrics: document.getElementById('mSongLyrics').value.trim()
    };

    try {
      const endpoint = songId ? `/api/admin/songs/${songId}` : '/api/admin/songs';
      const method = songId ? 'PUT' : 'POST';
      
      const res = await this.apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        this.closeModal();
        this.showToast(songId ? '✅ Song updated!' : '✨ New song added!');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to save song');
    }
  }

  async deleteSong(id) {
    if (!confirm('Are you sure you want to remove this song?')) return;
    try {
      const res = await this.apiRequest(`/api/admin/songs/${id}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Song deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete song');
    }
  }

  /* --------------------------------------------------------------------------
     Poetry & Video Recitals CRUD
     -------------------------------------------------------------------------- */
  populatePoetryTables() {
    this.populatePoetryCategories();

    const written = (this.currentData.poetry && this.currentData.poetry.written) || [];
    const recitals = (this.currentData.poetry && this.currentData.poetry.recitedVideos) || [];

    // Written verses table
    document.getElementById('adminPoetryTableBody').innerHTML = written.map(p => `
      <tr>
        <td>
          <strong style="color: var(--gold-light);">${p.titleHindi}</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">${p.titleRoman}</div>
        </td>
        <td>
          <span class="badge-status both">${p.theme || p.category}</span>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${p.linesRoman ? p.linesRoman.split('\n')[0] : ''}
        </td>
        <td style="text-align: right;">
          <button class="btn-action-icon" onclick="window.adminApp.openPoetryModal(${p.id})">✏️</button>
          <button class="btn-action-icon danger" onclick="window.adminApp.deletePoetry(${p.id})">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Recitals table
    document.getElementById('adminRecitalsTableBody').innerHTML = recitals.map(v => `
      <tr>
        <td>
          <img src="${v.thumbnail || 'assets/images/poetry-fir-tum-aazaad-ho.jpg'}" alt="${v.title}" class="table-thumb">
        </td>
        <td>
          <strong style="color: var(--text-primary);">${v.title}</strong>
        </td>
        <td>
          <span class="badge-status both">${v.tag || v.category}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--sepia-warm);">
          ${v.youtubeId}
        </td>
        <td style="text-align: right;">
          <button class="btn-action-icon" onclick="window.adminApp.openRecitalModal(${v.id})">✏️</button>
          <button class="btn-action-icon danger" onclick="window.adminApp.deleteRecital(${v.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  populatePoetryCategories() {
    const container = document.getElementById('adminPoetryCategoriesList');
    if (!container) return;

    const categories = (this.currentData.poetry && this.currentData.poetry.categories) || [
      { id: "ishq", label: "Ishq & Jazbaat" },
      { id: "inquilaab", label: "Inquilaab & Alfaaz" },
      { id: "dard", label: "Dard & Tanhai" },
      { id: "sufiyana", label: "Sufiyana & Sukoon" }
    ];

    container.innerHTML = categories.map(c => `
      <div style="background: rgba(200,169,126,0.08); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.45rem 0.85rem; display: inline-flex; align-items: center; gap: 0.65rem;">
        <span style="font-weight: 600; color: var(--gold-light); font-size: 0.88rem;">${c.label}</span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">(${c.id})</span>
        <button class="btn-action-icon" style="width: 26px; height: 26px; font-size: 0.75rem;" title="Edit Category" onclick="window.adminApp.openPoetryCategoryModal('${c.id}')">✏️</button>
        <button class="btn-action-icon danger" style="width: 26px; height: 26px; font-size: 0.75rem;" title="Delete Category" onclick="window.adminApp.deletePoetryCategory('${c.id}')">🗑️</button>
      </div>
    `).join('');
  }

  openPoetryCategoryModal(catId = null) {
    const categories = (this.currentData.poetry && this.currentData.poetry.categories) || [];
    const cat = catId ? categories.find(c => c.id === catId) : { id: '', label: '' };

    this.modalTitle.textContent = catId ? 'Edit Category' : 'Add New Category';
    this.modalBody.innerHTML = `
      <form id="poetryCatModalForm">
        <div class="form-group">
          <label class="form-label">Category Display Label (Shown on Tabs)</label>
          <input type="text" id="mCatLabel" class="form-input" value="${cat.label}" required placeholder="e.g. Jazbaat & Ehsaas">
        </div>
        ${!catId ? `
        <div class="form-group">
          <label class="form-label">Category Identifier (Slug / ID)</label>
          <input type="text" id="mCatId" class="form-input" placeholder="e.g. jazbaat (auto-generated if empty)">
        </div>
        ` : ''}
        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Category</button>
      </form>
    `;

    document.getElementById('poetryCatModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const label = document.getElementById('mCatLabel').value.trim();
      const id = !catId ? (document.getElementById('mCatId').value.trim() || label.toLowerCase().replace(/[^a-z0-9]/g, '-')) : catId;

      try {
        const endpoint = catId ? `/api/admin/poetry/categories/${catId}` : '/api/admin/poetry/categories';
        const method = catId ? 'PUT' : 'POST';
        const res = await this.apiRequest(endpoint, {
          method,
          body: JSON.stringify({ id, label })
        });
        if (res.success) {
          this.closeModal();
          this.showToast('✅ Category saved!');
          this.loadAllContent();
        }
      } catch (err) {
        alert('Failed to save category');
      }
    });

    this.openModal();
  }

  async deletePoetryCategory(catId) {
    if (!confirm(`Delete category "${catId}"?`)) return;
    try {
      const res = await this.apiRequest(`/api/admin/poetry/categories/${catId}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Category deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete category');
    }
  }

  openPoetryModal(poetryId = null) {
    const poem = poetryId
      ? (this.currentData.poetry.written || []).find(p => p.id === poetryId)
      : { category: 'ishq', theme: 'Ishq & Jazbaat', titleHindi: '', titleRoman: '', linesHindi: '', linesRoman: '', englishMeaning: '', notes: '' };

    const categories = (this.currentData.poetry && this.currentData.poetry.categories) || [
      { id: "ishq", label: "Ishq & Jazbaat" },
      { id: "inquilaab", label: "Inquilaab & Alfaaz" },
      { id: "dard", label: "Dard & Tanhai" },
      { id: "sufiyana", label: "Sufiyana & Sukoon" }
    ];

    const catOptions = categories.map(c => `
      <option value="${c.id}" ${poem.category === c.id ? 'selected' : ''}>${c.label}</option>
    `).join('');

    this.modalTitle.textContent = poetryId ? 'Edit Poetry Verse' : 'Add New Written Poem';
    this.modalBody.innerHTML = `
      <form id="poetryModalForm">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Title (Hindi Devanagari)</label>
            <input type="text" id="mPoemTitleHindi" class="form-input" value="${poem.titleHindi}" placeholder="e.g. क्या करूँ!">
          </div>
          <div class="form-group">
            <label class="form-label">Title (Roman / English)</label>
            <input type="text" id="mPoemTitleRoman" class="form-input" value="${poem.titleRoman}" placeholder="e.g. Kya Karun!">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="mPoemCategory" class="form-select">
              ${catOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Theme Label</label>
            <input type="text" id="mPoemTheme" class="form-input" value="${poem.theme}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Poem Lines (Hindi Devanagari)</label>
          <textarea id="mPoemLinesHindi" class="form-textarea" rows="4" placeholder="दर्द की दो दवा बहर का क्या करूँ...">${poem.linesHindi}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Poem Lines (Romanized Hinglish)</label>
          <textarea id="mPoemLinesRoman" class="form-textarea" rows="4" placeholder="Dard ki do dawa bahar ka kya karun...">${poem.linesRoman}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">English Translation / Meaning</label>
          <textarea id="mPoemMeaning" class="form-textarea" rows="2">${poem.englishMeaning}</textarea>
        </div>

        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Poem</button>
      </form>
    `;

    document.getElementById('poetryModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const catSelect = document.getElementById('mPoemCategory');
      const selectedCatId = catSelect.value;
      const selectedCatObj = categories.find(c => c.id === selectedCatId);

      const payload = {
        titleHindi: document.getElementById('mPoemTitleHindi').value.trim(),
        titleRoman: document.getElementById('mPoemTitleRoman').value.trim(),
        category: selectedCatId,
        theme: document.getElementById('mPoemTheme').value.trim() || (selectedCatObj ? selectedCatObj.label : selectedCatId),
        linesHindi: document.getElementById('mPoemLinesHindi').value.trim(),
        linesRoman: document.getElementById('mPoemLinesRoman').value.trim(),
        englishMeaning: document.getElementById('mPoemMeaning').value.trim()
      };

      try {
        const endpoint = poetryId ? `/api/admin/poetry/${poetryId}` : '/api/admin/poetry';
        const method = poetryId ? 'PUT' : 'POST';
        const res = await this.apiRequest(endpoint, { method, body: JSON.stringify(payload) });
        if (res.success) {
          this.closeModal();
          this.showToast('✅ Poetry verse saved!');
          this.loadAllContent();
        }
      } catch (err) {
        alert('Failed to save poetry');
      }
    });

    this.openModal();
  }

  async deletePoetry(id) {
    if (!confirm('Are you sure you want to remove this poem?')) return;
    try {
      const res = await this.apiRequest(`/api/admin/poetry/${id}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Poem deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete poem');
    }
  }

  openRecitalModal(recitalId = null) {
    const recital = recitalId
      ? (this.currentData.poetry.recitedVideos || []).find(v => v.id === recitalId)
      : { title: '', category: 'Recited Poetry', tag: 'Recited Video', youtubeUrl: '', thumbnail: 'assets/images/poetry-fir-tum-aazaad-ho.jpg' };

    this.modalTitle.textContent = recitalId ? 'Edit Recited Video' : 'Add Recited Video';
    this.modalBody.innerHTML = `
      <form id="recitalModalForm">
        <div class="form-group">
          <label class="form-label">Video Title</label>
          <input type="text" id="mRecitalTitle" class="form-input" value="${recital.title}" required placeholder="e.g. Fir tum aazaad ho">
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="mRecitalCat" class="form-input" value="${recital.category}">
          </div>
          <div class="form-group">
            <label class="form-label">Tag Badge</label>
            <input type="text" id="mRecitalTag" class="form-input" value="${recital.tag}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">YouTube URL or ID</label>
          <input type="text" id="mRecitalYt" class="form-input" value="${recital.youtubeUrl || recital.youtubeId || ''}" required placeholder="https://youtu.be/...">
        </div>

        <div class="form-group">
          <label class="form-label">Thumbnail Image Path or Upload</label>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <input type="text" id="mRecitalThumb" class="form-input" value="${recital.thumbnail}">
            <label class="btn-add" style="white-space: nowrap; cursor: pointer;">
              Upload
              <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleFileUpload(this, 'mRecitalThumb')">
            </label>
          </div>
        </div>

        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Recited Video</button>
      </form>
    `;

    document.getElementById('recitalModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const ytInput = document.getElementById('mRecitalYt').value.trim();
      let ytId = '';
      if (ytInput.includes('youtu.be/')) {
        ytId = ytInput.split('youtu.be/')[1].split('?')[0];
      } else if (ytInput.includes('shorts/')) {
        ytId = ytInput.split('shorts/')[1].split('?')[0];
      } else if (ytInput.includes('v=')) {
        ytId = ytInput.split('v=')[1].split('&')[0];
      } else {
        ytId = ytInput;
      }

      const payload = {
        title: document.getElementById('mRecitalTitle').value.trim(),
        category: document.getElementById('mRecitalCat').value.trim(),
        tag: document.getElementById('mRecitalTag').value.trim(),
        youtubeUrl: ytInput,
        youtubeId: ytId,
        thumbnail: document.getElementById('mRecitalThumb').value.trim()
      };

      try {
        const endpoint = recitalId ? `/api/admin/poetry-videos/${recitalId}` : '/api/admin/poetry-videos';
        const method = recitalId ? 'PUT' : 'POST';
        const res = await this.apiRequest(endpoint, { method, body: JSON.stringify(payload) });
        if (res.success) {
          this.closeModal();
          this.showToast('✅ Recited video saved!');
          this.loadAllContent();
        }
      } catch (err) {
        alert('Failed to save recited video');
      }
    });

    this.openModal();
  }

  async deleteRecital(id) {
    if (!confirm('Are you sure you want to remove this video recital?')) return;
    try {
      const res = await this.apiRequest(`/api/admin/poetry-videos/${id}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Recited video deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete video recital');
    }
  }

  /* --------------------------------------------------------------------------
     Art & Visual Gallery CRUD
     -------------------------------------------------------------------------- */
  populateGalleryTable() {
    const gallery = this.currentData.gallery || [];
    document.getElementById('adminGalleryTableBody').innerHTML = gallery.map(g => `
      <tr>
        <td>
          <img src="${g.image || 'assets/images/song-shodh.jpg'}" alt="${g.title}" class="table-thumb">
        </td>
        <td>
          <strong style="color: var(--text-primary);">${g.title}</strong>
        </td>
        <td>
          <span class="badge-status both">${g.categoryLabel || g.category}</span>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">
          ${g.note || ''}
        </td>
        <td style="text-align: right;">
          <button class="btn-action-icon" onclick="window.adminApp.openGalleryModal(${g.id})">✏️</button>
          <button class="btn-action-icon danger" onclick="window.adminApp.deleteGallery(${g.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  openGalleryModal(galleryId = null) {
    const art = galleryId
      ? (this.currentData.gallery || []).find(g => g.id === galleryId)
      : { title: '', categoryLabel: 'Original Release Artwork', note: '', image: 'assets/images/song-shodh.jpg' };

    this.modalTitle.textContent = galleryId ? 'Edit Artwork' : 'Add New Artwork';
    this.modalBody.innerHTML = `
      <form id="galleryModalForm">
        <div class="form-group">
          <label class="form-label">Artwork Title</label>
          <input type="text" id="mGalleryTitle" class="form-input" value="${art.title}" required placeholder="e.g. Shodh — Official Cover">
        </div>

        <div class="form-group">
          <label class="form-label">Category Label</label>
          <input type="text" id="mGalleryCat" class="form-input" value="${art.categoryLabel}" placeholder="Original Release Artwork">
        </div>

        <div class="form-group">
          <label class="form-label">Artwork Image Path or Upload</label>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <input type="text" id="mGalleryImage" class="form-input" value="${art.image}" required>
            <label class="btn-add" style="white-space: nowrap; cursor: pointer;">
              Upload
              <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleFileUpload(this, 'mGalleryImage')">
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes / Description</label>
          <input type="text" id="mGalleryNote" class="form-input" value="${art.note || ''}">
        </div>

        <button type="submit" class="btn-save" style="width: 100%; justify-content: center;">Save Artwork</button>
      </form>
    `;

    document.getElementById('galleryModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('mGalleryTitle').value.trim(),
        categoryLabel: document.getElementById('mGalleryCat').value.trim(),
        image: document.getElementById('mGalleryImage').value.trim(),
        note: document.getElementById('mGalleryNote').value.trim()
      };

      try {
        const endpoint = galleryId ? `/api/admin/gallery/${galleryId}` : '/api/admin/gallery';
        const method = galleryId ? 'PUT' : 'POST';
        const res = await this.apiRequest(endpoint, { method, body: JSON.stringify(payload) });
        if (res.success) {
          this.closeModal();
          this.showToast('✅ Artwork saved!');
          this.loadAllContent();
        }
      } catch (err) {
        alert('Failed to save artwork');
      }
    });

    this.openModal();
  }

  async deleteGallery(id) {
    if (!confirm('Are you sure you want to remove this artwork?')) return;
    try {
      const res = await this.apiRequest(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.success) {
        this.showToast('🗑️ Artwork deleted');
        this.loadAllContent();
      }
    } catch (e) {
      alert('Failed to delete artwork');
    }
  }

  /* --------------------------------------------------------------------------
     About & Soul Pillars
     -------------------------------------------------------------------------- */
  populateAboutForm() {
    const about = this.currentData.about || {};
    document.getElementById('aboutLeadText').value = about.leadText || '';
    document.getElementById('aboutPara1').value = (about.paragraphs && about.paragraphs[0]) || '';
    document.getElementById('aboutPara2').value = (about.paragraphs && about.paragraphs[1]) || '';
    document.getElementById('aboutPhilosophy').value = about.philosophyQuote || '';
  }

  async saveAbout() {
    const payload = {
      leadText: document.getElementById('aboutLeadText').value.trim(),
      paragraphs: [
        document.getElementById('aboutPara1').value.trim(),
        document.getElementById('aboutPara2').value.trim()
      ],
      philosophyQuote: document.getElementById('aboutPhilosophy').value.trim()
    };

    try {
      const res = await this.apiRequest('/api/admin/about', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        this.currentData.about = { ...this.currentData.about, ...res.data };
        this.showToast('✅ About narrative updated!');
      }
    } catch (e) {
      alert('Failed to save About section');
    }
  }

  /* --------------------------------------------------------------------------
     Socials & Settings
     -------------------------------------------------------------------------- */
  populateSocialsForm() {
    const socials = this.currentData.socials || {};
    document.getElementById('socialInstagram').value = socials.instagram || '';
    document.getElementById('socialYoutube').value = socials.youtube || '';
    document.getElementById('socialSpotify').value = socials.spotify || '';
    document.getElementById('socialGithub').value = socials.github || '';
  }

  async saveSocials() {
    const payload = {
      instagram: document.getElementById('socialInstagram').value.trim(),
      youtube: document.getElementById('socialYoutube').value.trim(),
      spotify: document.getElementById('socialSpotify').value.trim(),
      github: document.getElementById('socialGithub').value.trim()
    };

    try {
      const res = await this.apiRequest('/api/admin/socials', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        this.currentData.socials = res.data;
        this.showToast('✅ Social media links updated!');
      }
    } catch (e) {
      alert('Failed to save social links');
    }
  }

  async handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassInput').value;
    const newPassword = document.getElementById('newPassInput').value;

    try {
      const res = await this.apiRequest('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.success) {
        this.showToast('🔑 Password changed successfully!');
        document.getElementById('changePasswordForm').reset();
      } else {
        alert(res.error || 'Failed to change password');
      }
    } catch (err) {
      alert(err.message || 'Error changing password');
    }
  }

  /* --------------------------------------------------------------------------
     Inquiries Inbox
     -------------------------------------------------------------------------- */
  async loadMessages() {
    try {
      const messages = await this.apiRequest('/api/admin/messages');
      const tbody = document.getElementById('adminMessagesTableBody');
      const badge = document.getElementById('badgeMsgCount');
      
      const unreadCount = messages.filter(m => !m.isRead).length;
      if (unreadCount > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = unreadCount;
      } else {
        badge.style.display = 'none';
      }

      document.getElementById('dashTotalInquiries').textContent = messages.length;

      if (!messages.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No visitor inquiries received yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = messages.map(m => `
        <tr style="${!m.isRead ? 'background: rgba(212,175,55,0.06); font-weight: 500;' : ''}">
          <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--sepia-warm);">
            ${new Date(m.timestamp).toLocaleDateString()} ${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td><strong style="color: var(--text-primary);">${m.name}</strong></td>
          <td><a href="mailto:${m.email}" style="color: var(--gold-primary); text-decoration: none;">${m.email}</a></td>
          <td><span class="badge-status both">${m.service}</span></td>
          <td style="max-width: 320px; font-size: 0.85rem; color: var(--text-secondary);">${m.message}</td>
          <td style="text-align: right;">
            ${!m.isRead ? `<button class="btn-action-icon" title="Mark Read" onclick="window.adminApp.markMsgRead(${m.id})">👁️</button>` : ''}
            <button class="btn-action-icon danger" title="Delete Message" onclick="window.adminApp.deleteMessage(${m.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  }

  async markMsgRead(id) {
    await this.apiRequest(`/api/admin/messages/${id}/read`, { method: 'PUT' });
    this.loadMessages();
  }

  async deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    await this.apiRequest(`/api/admin/messages/${id}`, { method: 'DELETE' });
    this.showToast('🗑️ Message deleted');
    this.loadMessages();
  }

  /* --------------------------------------------------------------------------
     File Upload Handler
     -------------------------------------------------------------------------- */
  async handleFileUpload(inputElement, targetFieldId) {
    const file = inputElement.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      this.showToast('⏳ Uploading asset...', '☁️');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById(targetFieldId).value = data.filePath;
        this.showToast('✅ Upload complete!', '🖼️');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('File upload error');
    }
  }

  /* --------------------------------------------------------------------------
     Modal Helpers
     -------------------------------------------------------------------------- */
  openModal() {
    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    this.modalOverlay.classList.remove('active');
  }
}

// Instantiate Admin App
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});
