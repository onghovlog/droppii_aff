/**
 * Banner Carousel Slider Module
 * Strictly Image + Target URL
 */
const BannerSlider = {
  container: null,
  track: null,
  dotsContainer: null,
  allBanners: [],
  squareBanners: [],
  currentIndex: 0,
  timer: null,
  touchStartX: 0,
  touchEndX: 0,

  async init() {
    this.container = document.getElementById('heroBannerContainer');
    this.track = document.getElementById('heroBannerTrack');
    this.dotsContainer = document.getElementById('heroBannerDots');

    if (!this.track) return;

    try {
      const response = await API.get('/banners');
      if (response.success && response.data.length > 0) {
        this.allBanners = response.data;
        this.render();
        this.setupEvents();
        this.startAutoSlide();
      } else {
        this.renderFallback();
      }
    } catch (error) {
      console.error('[Banner] Load error:', error);
      this.renderFallback();
    }
  },

  render() {
    this.track.innerHTML = '';
    this.dotsContainer.innerHTML = '';

    // 1. Separate banners by position
    this.squareBanners = this.allBanners.filter((b) => b.position === 'square' || !b.position);
    const horizontalBanner = this.allBanners.find((b) => b.position === 'horizontal');
    const verticalBanner = this.allBanners.find((b) => b.position === 'vertical');

    // 2. Render Position 1: Square Slider Banners (Left Column)
    if (this.squareBanners.length === 0 && this.allBanners.length > 0) {
      this.squareBanners = [this.allBanners[0]];
    }

    this.squareBanners.forEach((banner, index) => {
      const slide = document.createElement('a');
      slide.className = 'banner-slide';
      slide.href = banner.targetUrl || '#';

      if (banner.targetUrl && (banner.targetUrl.startsWith('http://') || banner.targetUrl.startsWith('https://'))) {
        slide.target = '_blank';
        slide.rel = 'noopener noreferrer sponsored';
      }

      const img = document.createElement('img');
      img.src = banner.image;
      img.alt = banner.title || 'Banner Vuông Slider Droppii';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80';
      };

      slide.appendChild(img);
      this.track.appendChild(slide);

      // Pagination Dot
      if (this.squareBanners.length > 1) {
        const dot = document.createElement('div');
        dot.className = `banner-dot ${index === 0 ? 'is-active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goTo(index);
        });
        this.dotsContainer.appendChild(dot);
      }
    });

    // Arrow navigation visibility
    const prevBtn = document.getElementById('bannerPrevBtn');
    const nextBtn = document.getElementById('bannerNextBtn');
    if (prevBtn && nextBtn) {
      const showArrows = this.squareBanners.length > 1;
      prevBtn.style.display = showArrows ? 'flex' : 'none';
      nextBtn.style.display = showArrows ? 'flex' : 'none';
    }

    // 3. Render Position 2: Horizontal Banner (Middle Column - Width full, Height 150px)
    const staticBannerLink = document.getElementById('heroStaticBannerLink');
    const staticBannerImg = document.getElementById('heroStaticBannerImg');
    if (staticBannerLink && staticBannerImg) {
      if (horizontalBanner) {
        staticBannerImg.src = horizontalBanner.image;
        staticBannerImg.alt = horizontalBanner.title || 'Banner Ngang Khuyến Mãi';
        staticBannerLink.href = horizontalBanner.targetUrl || '#';
      } else {
        staticBannerImg.src = 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80';
        staticBannerLink.href = '#';
      }
    }

    // 4. Render Position 3: Vertical Banner (Right Column - Height full)
    const vertBannerLink = document.getElementById('heroVerticalBannerLink');
    const vertBannerImg = document.getElementById('heroVerticalBannerImg');
    if (vertBannerLink && vertBannerImg) {
      if (verticalBanner) {
        vertBannerImg.src = verticalBanner.image;
        vertBannerImg.alt = verticalBanner.title || 'Banner Dọc Khuyến Mãi';
        vertBannerLink.href = verticalBanner.targetUrl || '#';
      } else {
        vertBannerImg.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
        vertBannerLink.href = '#';
      }
    }

    this.updateSlidePosition();
  },

  renderFallback() {
    if (!this.track) return;
    this.track.innerHTML = `
      <div class="banner-slide">
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80" alt="Khuyến mãi Droppii">
      </div>
    `;
  },

  goTo(index) {
    if (this.squareBanners.length === 0) return;
    if (index < 0) {
      this.currentIndex = this.squareBanners.length - 1;
    } else if (index >= this.squareBanners.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }
    this.updateSlidePosition();
    this.resetAutoSlide();
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  updateSlidePosition() {
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Update dots
    const dots = this.dotsContainer.querySelectorAll('.banner-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === this.currentIndex);
    });
  },

  setupEvents() {
    const prevBtn = document.getElementById('bannerPrevBtn');
    const nextBtn = document.getElementById('bannerNextBtn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Touch Swipe for Mobile
    this.container.addEventListener(
      'touchstart',
      (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.stopAutoSlide();
      },
      { passive: true }
    );

    this.container.addEventListener(
      'touchend',
      (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        this.startAutoSlide();
      },
      { passive: true }
    );

    // Pause on hover desktop
    this.container.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.container.addEventListener('mouseleave', () => this.startAutoSlide());
  },

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  },

  startAutoSlide() {
    if (this.banners.length <= 1) return;
    this.stopAutoSlide();
    this.timer = setInterval(() => {
      this.next();
    }, 4500);
  },

  stopAutoSlide() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
};
