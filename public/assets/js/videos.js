/**
 * Video Library Slider & Popup Module
 * - 6 videos per slide
 * - Slider navigation arrows & dots pagination
 * - Touch swipe support
 * - Dynamic YouTube thumbnail extraction & embeds
 * - Modal popup supporting both Landscape (16:9) and Portrait (9:16 Shorts)
 */
const Videos = {
  videos: [],
  currentSlide: 0,
  totalSlides: 0,
  touchStartX: 0,
  touchEndX: 0,

  async init() {
    this.bindGlobalEvents();
    await this.loadVideos();
  },

  bindGlobalEvents() {
    // Prev / Next button listeners
    const prevBtn = document.getElementById('videoPrevBtn');
    const nextBtn = document.getElementById('videoNextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }

    // Touch swipe support on slider
    const container = document.getElementById('videoSliderContainer');
    if (container) {
      container.addEventListener(
        'touchstart',
        (e) => {
          this.touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      container.addEventListener(
        'touchend',
        (e) => {
          this.touchEndX = e.changedTouches[0].screenX;
          this.handleSwipe();
        },
        { passive: true }
      );
    }

    // Clean up iframe when modal closes
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close-modal="videoPopupModal"]');
      if (closeBtn || (e.target.classList.contains('modal-overlay') && e.target.id === 'videoPopupModal')) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('videoPopupModal');
        if (modal && modal.classList.contains('is-active')) {
          this.closeModal();
        }
      }
    });
  },

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 40;
    if (diff > threshold) {
      // Swiped left -> next
      this.next();
    } else if (diff < -threshold) {
      // Swiped right -> prev
      this.prev();
    }
  },

  async loadVideos() {
    const track = document.getElementById('videoSliderTrack');
    if (!track) return;

    try {
      const res = await API.get('/videos');
      if (res.success && res.data && res.data.length > 0) {
        this.videos = res.data;
        this.renderSlider();
      } else {
        track.innerHTML = `
          <div class="video-slide-item">
            <div class="empty-state-box" style="padding: 40px 20px; text-align: center; width: 100%;">
              <p style="color: var(--text-secondary);">Chưa có video nổi bật nào được đăng tải.</p>
            </div>
          </div>
        `;
        this.updateControlsVisibility(false);
      }
    } catch (err) {
      console.error('[Videos] Load error:', err);
      track.innerHTML = `
        <div class="video-slide-item">
          <div class="empty-state-box" style="padding: 40px 20px; text-align: center; width: 100%;">
            <p style="color: #ef4444;">Lỗi khi tải danh sách video.</p>
          </div>
        </div>
      `;
      this.updateControlsVisibility(false);
    }
  },

  renderSlider() {
    const track = document.getElementById('videoSliderTrack');
    const dotsContainer = document.getElementById('videoSliderDots');
    if (!track) return;

    const VIDEOS_PER_SLIDE = 6;
    const slides = [];

    for (let i = 0; i < this.videos.length; i += VIDEOS_PER_SLIDE) {
      slides.push(this.videos.slice(i, i + VIDEOS_PER_SLIDE));
    }

    this.totalSlides = slides.length;
    this.currentSlide = 0;

    // Render slide items
    track.innerHTML = slides
      .map(
        (slideVideos, slideIndex) => `
        <div class="video-slide-item" data-slide-index="${slideIndex}">
          <div class="video-slide-grid">
            ${slideVideos.map((v) => this.renderVideoCard(v)).join('')}
          </div>
        </div>
      `
      )
      .join('');

    // Render pagination dots
    if (dotsContainer) {
      if (this.totalSlides > 1) {
        dotsContainer.innerHTML = Array.from({ length: this.totalSlides })
          .map(
            (_, i) => `
            <button class="slider-dot ${i === 0 ? 'active' : ''}" 
              type="button" 
              aria-label="Chuyển đến Slide ${i + 1}"
              onclick="Videos.goToSlide(${i})">
            </button>
          `
          )
          .join('');
        dotsContainer.style.display = 'flex';
      } else {
        dotsContainer.innerHTML = '';
        dotsContainer.style.display = 'none';
      }
    }

    this.updateControlsVisibility(this.totalSlides > 1);
    this.goToSlide(0);
  },

  renderVideoCard(v) {
    const isShort = v.isVertical || (v.videoUrl && v.videoUrl.includes('/shorts/'));
    const thumb =
      v.thumbnail ||
      this.getYouTubeThumb(v.videoUrl) ||
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80';

    const safeTitle = this.escapeHTML(v.title);
    const safeDesc = v.description ? this.escapeHTML(v.description) : '';

    const playIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
    const badgeIconSVG = isShort
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Shorts`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>HD`;

    return `
      <div class="video-card" onclick="Videos.openModalById('${v._id}')" title="${safeTitle}">
        <div class="video-thumb-container">
          <img src="${thumb}" alt="${safeTitle}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600'">
          <div class="video-play-btn" aria-label="Phát video">${playIconSVG}</div>
          <span class="video-badge-tag ${isShort ? 'shorts' : ''}">
            ${badgeIconSVG}
          </span>
        </div>
        <div class="video-body">
          <h3 class="video-title">${safeTitle}</h3>
          ${safeDesc ? `<p class="video-desc">${safeDesc}</p>` : ''}
        </div>
      </div>
    `;
  },

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;
    this.currentSlide = index;

    const track = document.getElementById('videoSliderTrack');
    if (track) {
      track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }

    // Update dots
    const dots = document.querySelectorAll('#videoSliderDots .slider-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSlide);
    });

    // Update arrow states
    const prevBtn = document.getElementById('videoPrevBtn');
    const nextBtn = document.getElementById('videoNextBtn');

    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
  },

  next() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    } else if (this.totalSlides > 1) {
      // Loop back to start if at last slide
      this.goToSlide(0);
    }
  },

  prev() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    } else if (this.totalSlides > 1) {
      // Loop to end
      this.goToSlide(this.totalSlides - 1);
    }
  },

  updateControlsVisibility(show) {
    const nav = document.getElementById('videoSliderNav');
    if (nav) {
      nav.style.display = show ? 'flex' : 'none';
    }
  },

  openModalById(id) {
    const video = this.videos.find((v) => v._id === id);
    if (video) {
      this.openModal(video);
    }
  },

  openModal(video) {
    const modal = document.getElementById('videoPopupModal');
    const dialog = document.getElementById('videoModalDialog');
    const playerWrap = document.getElementById('videoModalPlayerWrap');
    const titleEl = document.getElementById('videoPopupTitle');
    const descEl = document.getElementById('videoModalDesc');
    const pillEl = document.getElementById('videoModalFormatPill');

    if (!modal || !dialog || !playerWrap) return;

    const isShort = video.isVertical || (video.videoUrl && video.videoUrl.includes('/shorts/'));
    const embedUrl = this.getEmbedUrl(video.videoUrl);

    // Apply format class to modal dialog
    if (isShort) {
      dialog.className = 'video-modal-dialog is-portrait';
      if (pillEl) {
        pillEl.className = 'video-format-pill shorts';
        pillEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>Video Dọc Shorts</span>';
      }
    } else {
      dialog.className = 'video-modal-dialog is-landscape';
      if (pillEl) {
        pillEl.className = 'video-format-pill';
        pillEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg><span>Video Đánh Giá HD</span>';
      }
    }

    if (titleEl) titleEl.textContent = video.title || 'Video Đánh Giá Sản Phẩm';
    if (descEl) descEl.textContent = video.description || '';

    const directLinkEl = document.getElementById('videoPopupDirectLink');
    if (directLinkEl) {
      directLinkEl.href = video.videoUrl || `https://www.youtube.com/watch?v=${this.getYouTubeId(video.videoUrl)}`;
    }

    // Inject iframe with strict-origin referrerpolicy & modern parameters
    playerWrap.innerHTML = `
      <iframe
        width="100%"
        height="100%"
        src="${embedUrl}"
        title="${this.escapeHTML(video.title)}"
        frameborder="0"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;

    Modal.open('videoPopupModal');
  },

  closeModal() {
    const playerWrap = document.getElementById('videoModalPlayerWrap');
    if (playerWrap) {
      playerWrap.innerHTML = ''; // Stop video and audio immediately
    }
    Modal.close('videoPopupModal');
  },

  getYouTubeId(url) {
    if (!url) return '';
    const match = url.match(
      /(?:youtu\.be\/|(?:www\.)?youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
    );
    return match && match[1] ? match[1] : '';
  },

  getEmbedUrl(url) {
    if (!url) return '';
    const id = this.getYouTubeId(url);
    if (id) {
      const origin =
        typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
          ? encodeURIComponent(window.location.origin)
          : '';
      const originParam = origin ? `&origin=${origin}` : '';
      return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1${originParam}`;
    }
    return url;
  },

  getYouTubeThumb(url) {
    if (!url) return '';
    const id = this.getYouTubeId(url);
    if (id) {
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return '';
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Videos.init();
});
