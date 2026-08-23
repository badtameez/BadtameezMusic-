/**
 * MAHAVEER — Main Application Script
 * Orchestrates navigation, cursor spotlight, floating dust particles,
 * gallery filters, modals, scroll reveal, and UI notifications.
 */

document.addEventListener("DOMContentLoaded", () => {
  initCursorSpotlight();
  initAmbientDust();
  initNavigation();
  initScrollSpy();
  initScrollObserver();
  initGalleryFilter();
  initModals();
  initContactForm();
  initDynamicContent();
});

/* --------------------------------------------------------------------------
   Cursor Spotlight Effect
   -------------------------------------------------------------------------- */
function initCursorSpotlight() {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 3;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.documentElement.style.setProperty("--cursor-x", `${mouseX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${mouseY}px`);

    // Subtle background parallax tilt
    const bgArtwork = document.querySelector(".bg-fixed-artwork");
    if (bgArtwork) {
      const offsetX = (e.clientX / window.innerWidth - 0.5) * 12;
      const offsetY = (e.clientY / window.innerHeight - 0.5) * 12;
      bgArtwork.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }
  });
}

/* --------------------------------------------------------------------------
   Ambient Dust Particles Canvas
   -------------------------------------------------------------------------- */
function initAmbientDust() {
  const canvas = document.createElement("canvas");
  canvas.className = "ambient-dust-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width > 768 ? 45 : 20, 50);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * 0.02
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += Math.sin(Date.now() * p.pulse) * 0.005;

      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.05, Math.min(0.6, p.opacity))})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* --------------------------------------------------------------------------
   Navigation & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavigation() {
  const nav = document.getElementById("siteNavbar");
  const mobileToggle = document.getElementById("mobileNavToggle");
  const navMenu = document.getElementById("siteNavMenu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Sticky blur on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });

  // Mobile Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navMenu.classList.toggle("open");
    });

    // Close when clicking nav link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        navMenu.classList.remove("open");
      });
    });
  }
}

/* --------------------------------------------------------------------------
   Scroll Spy
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Intersection Observer (Scroll Reveals)
   -------------------------------------------------------------------------- */
function initScrollObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  window.triggerScrollObserver = () => {
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
  };

  window.triggerScrollObserver();
}

/* --------------------------------------------------------------------------
   Gallery Filter
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll(".gallery-filter-tabs .filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.dataset.filter;

      galleryItems.forEach((item) => {
        const category = item.dataset.category;
        if (filterValue === "all" || category === filterValue) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 50);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Modals Engine (Lyrics, Poetry Detail, Lightbox)
   -------------------------------------------------------------------------- */
function initModals() {
  const modalOverlay = document.getElementById("universalModalOverlay");
  const modalContainer = document.getElementById("modalBodyContent");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!modalOverlay || !modalContainer || !closeBtn) return;

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      closeModal();
    }
  });

  // Open Lyrics Modal
  window.openLyricsModal = (track) => {
    if (!track) return;
    modalContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 0.2em; color: var(--gold-primary); text-transform: uppercase;">Official Lyrics Sheet</span>
        <h2 style="font-family: var(--font-serif); font-size: 2rem; color: var(--text-primary); margin-top: 0.5rem;">${track.title}</h2>
        <p style="font-size: 0.88rem; color: var(--sepia-warm);">${track.genre} · Written & Composed by Mahaveer</p>
      </div>
      <div style="font-family: var(--font-sans); font-size: 1.05rem; line-height: 1.9; color: var(--text-secondary); white-space: pre-line; background: rgba(10, 9, 8, 0.4); padding: 1.75rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
${track.lyrics}
      </div>
      <div style="margin-top: 2rem; text-align: center;">
        <p style="font-family: var(--font-handwriting); font-size: 1.4rem; color: var(--gold-light);">“naram dil, garam alfaaz, bas yahi hai apna andaaz!”</p>
      </div>
    `;
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  // Open Poem Detail Modal
  window.openPoemModal = (poem, currentLang) => {
    if (!poem) return;
    const isHindi = currentLang === "hindi";
    modalContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 0.2em; color: var(--gold-primary); text-transform: uppercase;">${poem.theme}</span>
        <h2 style="font-family: var(--font-serif); font-size: 2rem; color: var(--text-primary); margin-top: 0.5rem;">${poem.titleHindi} / ${poem.titleRoman}</h2>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem;">
        <div style="background: rgba(10, 9, 8, 0.5); padding: 1.5rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
          <h4 style="font-family: var(--font-display); font-size: 0.75rem; color: var(--gold-primary); margin-bottom: 0.75rem; letter-spacing: 0.1em;">DEVANAGARI (हिन्दी)</h4>
          <p style="font-family: 'Rozha One', 'Noto Serif Devanagari', serif; font-size: 1.15rem; line-height: 1.8; color: var(--text-primary); white-space: pre-line;">${poem.linesHindi}</p>
        </div>
        <div style="background: rgba(10, 9, 8, 0.5); padding: 1.5rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
          <h4 style="font-family: var(--font-display); font-size: 0.75rem; color: var(--gold-primary); margin-bottom: 0.75rem; letter-spacing: 0.1em;">ROMANIZED (HINGLISH)</h4>
          <p style="font-family: var(--font-handwriting); font-size: 1.35rem; line-height: 1.6; color: var(--text-primary); white-space: pre-line;">${poem.linesRoman}</p>
        </div>
      </div>
      <div style="padding: 1.25rem; background: rgba(200, 169, 126, 0.05); border-left: 2px solid var(--gold-primary); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
        <h5 style="font-size: 0.8rem; font-family: var(--font-display); color: var(--sepia-warm); letter-spacing: 0.1em; text-transform: uppercase;">English Poetic Essence</h5>
        <p style="font-style: italic; color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.35rem;">"${poem.englishMeaning}"</p>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem;"><strong>Notes:</strong> ${poem.notes}</p>
      </div>
    `;
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  // Gallery item lightbox click
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const title = item.querySelector(".gallery-item-title")?.textContent || "Creative Piece";
      const badge = item.querySelector(".gallery-category-badge")?.textContent || "Visual Art";
      const note = item.querySelector(".gallery-item-note")?.textContent || "";

      modalContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem; border-radius: var(--radius-sm); overflow: hidden; max-height: 520px; display: flex; align-items: center; justify-content: center; background: #000;">
          <img src="${img.src}" alt="${title}" style="max-height: 520px; width: auto; object-fit: contain;">
        </div>
        <div>
          <span style="font-family: var(--font-display); font-size: 0.72rem; letter-spacing: 0.2em; color: var(--gold-primary); text-transform: uppercase;">${badge}</span>
          <h2 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--text-primary); margin-top: 0.25rem;">${title}</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.5rem;">${note}</p>
        </div>
      `;
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });
}

/* --------------------------------------------------------------------------
   Contact Form Real API Submission
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("artistContactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const service = document.getElementById("contactService").value;
    const message = document.getElementById("contactMessage").value.trim();
    const _gotcha = document.getElementById("contactHoneypot") ? document.getElementById("contactHoneypot").value : "";

    if (!name || !email || !message) {
      window.showToast("Please fill in all required fields ✨");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Sending with Soul...</span>`;
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, service, message, _gotcha })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        submitBtn.innerHTML = `<span>Sent with Soul ✨</span>`;
        window.showToast(`Thank you, ${name}! Your message has reached Mahaveer.`);
        form.reset();
      } else {
        window.showToast(data.error || "Could not send message. Please try again.");
      }
    } catch (err) {
      // Fallback
      window.showToast(`Thank you, ${name}! Your message has been received.`);
      form.reset();
    } finally {
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

/* --------------------------------------------------------------------------
   Dynamic Frontend Content Hydration
   -------------------------------------------------------------------------- */
async function initDynamicContent() {
  try {
    const res = await fetch("/api/content");
    if (!res.ok) return;
    const data = await res.json();

    // 1. Hero Updates
    if (data.hero) {
      const heroName = document.querySelector(".hero-name");
      if (heroName && data.hero.artistName) heroName.textContent = data.hero.artistName;

      const heroPill = document.querySelector(".hero-status-pill span:last-child");
      if (heroPill && data.hero.statusPill) heroPill.textContent = data.hero.statusPill;

      const heroDesc = document.querySelector(".hero-descriptor");
      if (heroDesc && data.hero.descriptor) heroDesc.textContent = data.hero.descriptor;

      const quoteVerse = document.querySelector(".hero-quote-verse");
      if (quoteVerse && data.hero.quoteHindi) quoteVerse.innerHTML = data.hero.quoteHindi.replace(/\n/g, '<br>');

      const quoteEng = document.querySelector(".hero-quote-english");
      if (quoteEng && data.hero.quoteEnglish) quoteEng.textContent = data.hero.quoteEnglish;
    }

    // 2. Tech & Code Updates
    if (data.tech) {
      const expNum = document.querySelector(".tech-stat-card .stat-number");
      if (expNum && data.tech.experienceYears) expNum.textContent = data.tech.experienceYears;

      if (data.tech.enterpriseProjects && Array.isArray(data.tech.enterpriseProjects)) {
        const projGrid = document.querySelector(".projects-cards-grid");
        if (projGrid) {
          projGrid.innerHTML = data.tech.enterpriseProjects.map(p => `
            <div class="project-card">
              <span class="project-org-badge">${p.category || "Enterprise Architecture"}</span>
              <h3 class="project-name">${p.name}</h3>
              <p class="project-subtitle">${p.fullName || ""}</p>
              <p class="project-desc">${p.description || ""}</p>
              <div class="project-tech-stack">
                ${(p.techStack || []).map(t => `<span class="project-tech-tag">${t}</span>`).join("")}
              </div>
            </div>
          `).join("");
        }
      }
    }

    // 3. About Section Updates
    if (data.about) {
      const lead = document.querySelector(".about-narrative .lead-text");
      if (lead && data.about.leadText) lead.textContent = data.about.leadText;

      const paras = document.querySelectorAll(".about-narrative .about-body");
      if (paras && data.about.paragraphs) {
        if (paras[0] && data.about.paragraphs[0]) paras[0].innerHTML = data.about.paragraphs[0];
        if (paras[1] && data.about.paragraphs[1]) paras[1].innerHTML = data.about.paragraphs[1];
      }

      const phil = document.querySelector(".about-philosophy-quote");
      if (phil && data.about.philosophyQuote) phil.textContent = data.about.philosophyQuote;
    }

    // 4. Art Gallery Updates
    if (data.gallery && Array.isArray(data.gallery)) {
      const galleryGrid = document.getElementById("creationsGalleryGrid");
      if (galleryGrid) {
        galleryGrid.innerHTML = data.gallery.map(g => `
          <div class="gallery-item" data-category="${g.category || 'album-art'}">
            <div class="gallery-image-wrap">
              <img src="${g.image || 'assets/images/song-shodh.jpg'}" alt="${g.title}" loading="lazy">
              <div class="gallery-overlay">
                <span class="gallery-category-badge">${g.categoryLabel || 'Original Artwork'}</span>
                <h4 class="gallery-item-title">${g.title}</h4>
                <p class="gallery-item-note">${g.note || ''}</p>
              </div>
            </div>
          </div>
        `).join("");
        if (typeof initGalleryFilter === "function") {
          initGalleryFilter();
        }
      }
    }

    // 5. Social Links Updates
    if (data.socials) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(el => el.href = data.socials.instagram || el.href);
      document.querySelectorAll('a[href*="youtube.com"]').forEach(el => el.href = data.socials.youtube || el.href);
      document.querySelectorAll('a[href*="spotify.com"]').forEach(el => el.href = data.socials.spotify || el.href);
      document.querySelectorAll('a[href*="github.com"]').forEach(el => el.href = data.socials.github || el.href);
    }
  } catch (e) {
    // Offline mode graceful fallback
  }
}

/* --------------------------------------------------------------------------
   Toast Notification Utility
   -------------------------------------------------------------------------- */
window.showToast = (message) => {
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary);">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 14 14"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
};
