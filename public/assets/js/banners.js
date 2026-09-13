/**
 * Banner Management & Hero Carousel Module
 * Handles 3 Distinct Positions strictly from MongoDB:
 * - Position 1: Square Banners (position === 'square') -> Left Carousel Slider
 * - Position 2: Horizontal Banners (position === 'horizontal') -> Middle Static / Dynamic Banner
 * - Position 3: Vertical Banners (position === 'vertical') -> Right Column Auto Rotating (every 2s)
 */
const BannerSlider = {
  container: null,
  track: null,
  dotsContainer: null,

  allBanners: [],
  squareBanners: [],
  horizontalBanners: [],
  verticalBanners: [],

  // Position 1: Square Slider State
  squareIndex: 0,
  squareTimer: null,
  touchStartX: 0,
  touchEndX: 0,

  // Position 2: Horizontal Banner State
  horizontalIndex: 0,
  horizontalTimer: null,

  // Position 3: Vertical Banner State (Auto rotates every 2s)
  verticalIndex: 0,
  verticalTimer: null,

  async init() {
    this.container = document.getElementById('heroBannerContainer');
    this.track = document.getElementById('heroBannerTrack');
    this.dotsContainer = document.getElementById('heroBannerDots');

    if (!this.track) return;

    try {
      const response = await API.get('/banners');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.allBanners = response.data;
      } else {
        this.allBanners = [];
      }
    } catch (error) {
      console.error('[Banner] Error fetching banners from API:', error);
      this.allBanners = [];
    }

    this.renderAllPositions();
  },

  renderAllPositions() {
    // 1. Categorize banners strictly by 'position' property from Database
    this.squareBanners = this.allBanners.filter((b) => b.position === 'square');
    this.horizontalBanners = this.allBanners.filter((b) => b.position === 'horizontal');
    this.verticalBanners = this.allBanners.filter((b) => b.position === 'vertical');

    // If no explicit position is tagged, fallback legacy banners to square
    if (this.squareBanners.length === 0 && this.horizontalBanners.length === 0 && this.verticalBanners.length === 0 && this.allBanners.length > 0) {
      this.squareBanners = this.allBanners;
    }

    // 2. Render Position 1: Square Banners (Left Column Slider)
    this.renderSquareSlider();

    // 3. Render Position 2: Horizontal Banners (Middle Column)
    this.renderHorizontalBanner();

    // 4. Render Position 3: Vertical Banners (Right Column - Auto rotates every 2s)
    this.renderVerticalSlider();
  },

  // ================= POSITION 1: SQUARE BANNER SLIDER (LEFT) =================
  renderSquareSlider() {
    if (!this.track || !this.dotsContainer) return;
    this.track.innerHTML = '';
    this.dotsContainer.innerHTML = '';
    this.squareIndex = 0;
    this.stopSquareAutoSlide();

    const banners = this.squareBanners.length > 0 ? this.squareBanners : [
      {
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
        title: 'Khuyến mãi đặc biệt Droppii',
        targetUrl: '#'
      }
    ];

    banners.forEach((banner, index) => {
      const slide = document.createElement('a');
      slide.className = 'banner-slide';
      slide.href = banner.targetUrl || '#';

      if (banner.targetUrl && (banner.targetUrl.startsWith('http://') || banner.targetUrl.startsWith('https://'))) {
        slide.target = '_blank';
        slide.rel = 'noopener noreferrer sponsored';
      }

      const img = document.createElement('img');
      img.src = banner.image;
      img.alt = banner.title || `Banner Vuông ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80';
      };

      slide.appendChild(img);
      this.track.appendChild(slide);

      // Pagination Dot
      if (banners.length > 1) {
        const dot = document.createElement('div');
        dot.className = `banner-dot ${index === 0 ? 'is-active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goToSquare(index);
        });
        this.dotsContainer.appendChild(dot);
      }
    });

    // Arrow controls
    const prevBtn = document.getElementById('bannerPrevBtn');
    const nextBtn = document.getElementById('bannerNextBtn');
    const showArrows = banners.length > 1;
    if (prevBtn) prevBtn.style.display = showArrows ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = showArrows ? 'flex' : 'none';

    this.updateSquareSlidePosition();
    this.setupSquareEvents();

    if (banners.length > 1) {
      this.startSquareAutoSlide();
    }
  },

  goToSquare(index) {
    const len = this.squareBanners.length > 0 ? this.squareBanners.length : 1;
    if (index < 0) {
      this.squareIndex = len - 1;
    } else if (index >= len) {
      this.squareIndex = 0;
    } else {
      this.squareIndex = index;
    }
    this.updateSquareSlidePosition();
    this.resetSquareAutoSlide();
  },

  nextSquare() {
    this.goToSquare(this.squareIndex + 1);
  },

  prevSquare() {
    this.goToSquare(this.squareIndex - 1);
  },

  updateSquareSlidePosition() {
    if (!this.track) return;
    this.track.style.transform = `translateX(-${this.squareIndex * 100}%)`;

    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.banner-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === this.squareIndex);
      });
    }
  },

  setupSquareEvents() {
    const prevBtn = document.getElementById('bannerPrevBtn');
    const nextBtn = document.getElementById('bannerNextBtn');

    if (prevBtn) {
      prevBtn.onclick = () => this.prevSquare();
    }
    if (nextBtn) {
      nextBtn.onclick = () => this.nextSquare();
    }

    if (this.container && !this.container._hasEvents) {
      this.container._hasEvents = true;

      // Touch Swipe for Mobile
      this.container.addEventListener(
        'touchstart',
        (e) => {
          this.touchStartX = e.changedTouches[0].screenX;
          this.stopSquareAutoSlide();
        },
        { passive: true }
      );

      this.container.addEventListener(
        'touchend',
        (e) => {
          this.touchEndX = e.changedTouches[0].screenX;
          const diff = this.touchStartX - this.touchEndX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) this.nextSquare();
            else this.prevSquare();
          }
          this.startSquareAutoSlide();
        },
        { passive: true }
      );

      // Pause on hover desktop
      this.container.addEventListener('mouseenter', () => this.stopSquareAutoSlide());
      this.container.addEventListener('mouseleave', () => this.startSquareAutoSlide());
    }
  },

  startSquareAutoSlide() {
    const len = this.squareBanners.length;
    if (len <= 1) return;
    this.stopSquareAutoSlide();
    this.squareTimer = setInterval(() => {
      this.nextSquare();
    }, 4500);
  },

  stopSquareAutoSlide() {
    if (this.squareTimer) {
      clearInterval(this.squareTimer);
      this.squareTimer = null;
    }
  },

  resetSquareAutoSlide() {
    this.stopSquareAutoSlide();
    this.startSquareAutoSlide();
  },

  // ================= POSITION 2: HORIZONTAL BANNER (MIDDLE) =================
  renderHorizontalBanner() {
    const staticBannerLink = document.getElementById('heroStaticBannerLink');
    const staticBannerImg = document.getElementById('heroStaticBannerImg');
    if (!staticBannerLink || !staticBannerImg) return;

    this.stopHorizontalAutoSlide();
    this.horizontalIndex = 0;

    const banners = this.horizontalBanners.length > 0 ? this.horizontalBanners : [
      {
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
        title: 'Banner Ngang Khuyến Mãi',
        targetUrl: '#'
      }
    ];

    const applyHorizontalBanner = (b) => {
      staticBannerImg.src = b.image;
      staticBannerImg.alt = b.title || 'Banner Ngang Khuyến Mãi';
      staticBannerLink.href = b.targetUrl || '#';
      if (b.targetUrl && (b.targetUrl.startsWith('http://') || b.targetUrl.startsWith('https://'))) {
        staticBannerLink.target = '_blank';
        staticBannerLink.rel = 'noopener noreferrer sponsored';
      } else {
        staticBannerLink.removeAttribute('target');
        staticBannerLink.removeAttribute('rel');
      }
    };

    applyHorizontalBanner(banners[0]);

    // If multiple horizontal banners, gently rotate every 4s
    if (banners.length > 1) {
      this.horizontalTimer = setInterval(() => {
        this.horizontalIndex = (this.horizontalIndex + 1) % banners.length;
        applyHorizontalBanner(banners[this.horizontalIndex]);
      }, 4000);
    }
  },

  stopHorizontalAutoSlide() {
    if (this.horizontalTimer) {
      clearInterval(this.horizontalTimer);
      this.horizontalTimer = null;
    }
  },

  // ================= POSITION 3: VERTICAL BANNER ROTATING EVERY 2S (RIGHT) =================
  renderVerticalSlider() {
    const sliderEl = document.getElementById('heroVerticalSlider');
    const dotsEl = document.getElementById('heroVerticalDots');
    if (!sliderEl) return;

    this.stopVerticalAutoSlide();
    this.verticalIndex = 0;
    sliderEl.innerHTML = '';
    if (dotsEl) dotsEl.innerHTML = '';

    const banners = this.verticalBanners.length > 0 ? this.verticalBanners : [
      {
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        title: 'Banner Dọc Deal Hot',
        targetUrl: '#'
      }
    ];

    banners.forEach((banner, index) => {
      const slide = document.createElement('a');
      slide.className = `hero-vertical-slide ${index === 0 ? 'is-active' : ''}`;
      slide.href = banner.targetUrl || '#';

      if (banner.targetUrl && (banner.targetUrl.startsWith('http://') || banner.targetUrl.startsWith('https://'))) {
        slide.target = '_blank';
        slide.rel = 'noopener noreferrer sponsored';
      }

      const img = document.createElement('img');
      img.src = banner.image;
      img.alt = banner.title || `Banner Dọc Deal Hot ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
      };

      const badge = document.createElement('div');
      badge.className = 'hero-vertical-badge';
      badge.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>Deal Hot</span>
      `;

      slide.appendChild(img);
      slide.appendChild(badge);
      sliderEl.appendChild(slide);

      // Create Dot if multiple vertical banners
      if (dotsEl && banners.length > 1) {
        const dot = document.createElement('div');
        dot.className = `hero-vertical-dot ${index === 0 ? 'is-active' : ''}`;
        dotsEl.appendChild(dot);
      }
    });

    if (dotsEl) {
      dotsEl.style.display = banners.length > 1 ? 'flex' : 'none';
    }

    if (!sliderEl._hasEvents) {
      sliderEl._hasEvents = true;
      sliderEl.addEventListener('mouseenter', () => this.stopVerticalAutoSlide());
      sliderEl.addEventListener('mouseleave', () => this.startVerticalAutoSlide());
    }

    // Exactly 2 seconds auto rotation as requested by user
    if (banners.length > 1) {
      this.startVerticalAutoSlide();
    }
  },

  nextVertical() {
    const banners = this.verticalBanners.length > 0 ? this.verticalBanners : [];
    if (banners.length <= 1) return;

    this.verticalIndex = (this.verticalIndex + 1) % banners.length;
    this.updateVerticalSlidePosition();
  },

  updateVerticalSlidePosition() {
    const sliderEl = document.getElementById('heroVerticalSlider');
    const dotsEl = document.getElementById('heroVerticalDots');
    if (!sliderEl) return;

    const slides = sliderEl.querySelectorAll('.hero-vertical-slide');
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === this.verticalIndex);
    });

    if (dotsEl) {
      const dots = dotsEl.querySelectorAll('.hero-vertical-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === this.verticalIndex);
      });
    }
  },

  startVerticalAutoSlide() {
    const len = this.verticalBanners.length;
    if (len <= 1) return;
    this.stopVerticalAutoSlide();
    // Rotate every 2s (2000ms)
    this.verticalTimer = setInterval(() => {
      this.nextVertical();
    }, 2000);
  },

  stopVerticalAutoSlide() {
    if (this.verticalTimer) {
      clearInterval(this.verticalTimer);
      this.verticalTimer = null;
    }
  }
};
