/**
 * MAHAVEER — Poetry & Lyrics Notebook Engine (Kalam & Kagaz)
 * Features dual-language script switcher (Devanagari / Romanized Hinglish),
 * dynamic category tabs & database hydration, thematic categorization, copy-to-clipboard, and poem expand modal.
 */

// Initial fallback seed
let poetryCollection = [];

class PoetryNotebookEngine {
  constructor() {
    this.currentLanguage = "hinglish"; // 'hindi' or 'hinglish'
    this.currentCategory = "all";
    this.container = document.getElementById("poetryGridContainer");
    this.tabsContainer = document.querySelector(".poetry-category-tabs");
    this.poetryCollection = poetryCollection;
    this.categories = [
      { id: "ishq", label: "Ishq & Jazbaat" },
      { id: "inquilaab", label: "Inquilaab & Alfaaz" },
      { id: "dard", label: "Dard & Tanhai" },
      { id: "sufiyana", label: "Sufiyana & Sukoon" }
    ];
    this.recitedVideos = [];
    
    this.initControls();
    this.render();
    this.fetchDynamicPoetry();
  }

  async fetchDynamicPoetry() {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        if (data.poetry) {
          if (Array.isArray(data.poetry.categories) && data.poetry.categories.length > 0) {
            this.categories = data.poetry.categories;
            this.renderCategories();
          }
          if (Array.isArray(data.poetry.written)) {
            this.poetryCollection = data.poetry.written;
            poetryCollection = data.poetry.written;
            this.render();
          }
          if (Array.isArray(data.poetry.recitedVideos)) {
            this.recitedVideos = data.poetry.recitedVideos;
            this.renderRecitedVideos();
          }
        }
      }
    } catch (e) {
      // Graceful offline fallback
    }
  }

  renderCategories() {
    if (!this.tabsContainer) return;

    const allBtnHtml = `<button class="poetry-tab-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">All Verses</button>`;
    const catBtnsHtml = this.categories.map(c => `
      <button class="poetry-tab-btn ${this.currentCategory === c.id ? 'active' : ''}" data-category="${c.id}">${c.label}</button>
    `).join('');

    this.tabsContainer.innerHTML = allBtnHtml + catBtnsHtml;
    this.bindCategoryButtons();
  }

  bindCategoryButtons() {
    const catBtns = this.tabsContainer.querySelectorAll(".poetry-tab-btn");
    catBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        catBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCategory = btn.dataset.category;
        this.render();
      });
    });
  }

  initControls() {
    // Language buttons
    const langBtns = document.querySelectorAll(".lang-btn");
    langBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        langBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentLanguage = btn.dataset.lang;
        this.render();
      });
    });

    this.bindCategoryButtons();
  }

  render() {
    if (!this.container) return;

    const filtered = this.poetryCollection.filter(item => {
      if (this.currentCategory === "all") return true;
      return item.category === this.currentCategory;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--sepia-warm);">No verses found in this category.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = filtered.map(item => {
      const isHindi = this.currentLanguage === "hindi";
      const title = (isHindi ? item.titleHindi : item.titleRoman) || item.titleRoman || item.titleHindi || "Verse";
      const lines = (isHindi ? item.linesHindi : item.linesRoman) || item.linesRoman || item.linesHindi || "";
      const formattedLines = lines.replace(/\n/g, "<br>");

      return `
        <div class="poetry-card reveal-on-scroll">
          <div class="poetry-card-top">
            <span class="poetry-theme-tag">${item.theme || item.category}</span>
            <h3 class="poetry-title">${title}</h3>
            <div class="poetry-lines ${isHindi ? 'hindi' : ''}">${formattedLines}</div>
          </div>
          <div class="poetry-card-footer">
            <span class="poetry-source">Mahaveer — Badtameez Music</span>
            <div class="poetry-actions">
              <button class="poetry-action-btn copy-verse-btn" data-id="${item.id}" title="Copy Verse">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="poetry-action-btn expand-verse-btn" data-id="${item.id}" title="View Meaning & Details">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.attachCardEvents();
    if (window.triggerScrollObserver) {
      window.triggerScrollObserver();
    }
  }

  renderRecitedVideos() {
    const grid = document.querySelector(".poetry-recitals-grid");
    if (!grid || !this.recitedVideos.length) return;

    grid.innerHTML = this.recitedVideos.map(v => `
      <div class="poetry-video-card" onclick="window.openPoetryVideoModal('${v.youtubeId}', '${v.title.replace(/'/g, "\\'")}', '${v.category || v.tag || "Recited Poetry"}')">
        <div class="poetry-video-thumb-wrap">
          <img src="${v.thumbnail || 'assets/images/poetry-fir-tum-aazaad-ho.jpg'}" alt="${v.title}" class="poetry-video-thumb">
          <div class="poetry-video-play-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="poetry-video-body">
          <span class="poetry-video-tag">${v.tag || v.category || "Recited Video"}</span>
          <h4 class="poetry-video-title">${v.title}</h4>
        </div>
      </div>
    `).join("");
  }

  attachCardEvents() {
    // Copy Verse
    document.querySelectorAll(".copy-verse-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const item = this.poetryCollection.find(p => p.id === id);
        if (!item) return;

        const textToCopy = this.currentLanguage === "hindi" 
          ? `${item.titleHindi}\n\n${item.linesHindi}\n\n— Mahaveer\n“naram dil, garam alfaaz, bas yahi hai apna andaaz!”`
          : `${item.titleRoman}\n\n${item.linesRoman}\n\n— Mahaveer\n“naram dil, garam alfaaz, bas yahi hai apna andaaz!”`;

        navigator.clipboard.writeText(textToCopy).then(() => {
          if (window.showToast) {
            window.showToast("Verse copied to clipboard with love ✨");
          }
        }).catch(() => {
          if (window.showToast) {
            window.showToast("Verse copied!");
          }
        });
      });
    });

    // Expand Poem Modal
    document.querySelectorAll(".expand-verse-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const item = this.poetryCollection.find(p => p.id === id);
        if (item && window.openPoemModal) {
          window.openPoemModal(item, this.currentLanguage);
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.poetryNotebook = new PoetryNotebookEngine();
});
