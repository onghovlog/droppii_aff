/**
 * Banner Carousel Slider Module
 * Strictly Image + Target URL
 */
const BannerSlider = {
  container: null,
  track: null,
  dotsContainer: null,
  banners: [],
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
        this.banners = response.data;
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

    this.banners.forEach((banner, index) => {
      // Slide
      const slide = document.createElement('a');
      slide.className = 'banner-slide';
      slide.href = banner.targetUrl || '#';

      // External links open in new tab with affiliate/sponsored rel
      if (banner.targetUrl && (banner.targetUrl.startsWith('http://') || banner.targetUrl.startsWith('https://'))) {
        slide.target = '_blank';
        slide.rel = 'noopener noreferrer sponsored';
      }

      const img = document.createElement('img');
      img.src = banner.image;
      img.alt = 'Banner khuyến mãi Droppii';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80';
      };

      slide.appendChild(img);
      this.track.appendChild(slide);

      // Dot
      const dot = document.createElement('div');
      dot.className = `banner-dot ${index === 0 ? 'is-active' : ''}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.goTo(index);
      });
      this.dotsContainer.appendChild(dot);
    });

    // Populate Middle Column Static Banner if available
    const staticBannerLink = document.getElementById('heroStaticBannerLink');
    const staticBannerImg = document.getElementById('heroStaticBannerImg');
    if (staticBannerLink && staticBannerImg && this.banners.length > 0) {
      // Use banner 2 or fallback
      const promoBanner = this.banners.length > 2 ? this.banners[2] : (this.banners.length > 1 ? this.banners[1] : this.banners[0]);
      staticBannerImg.src = promoBanner.image;
      staticBannerLink.href = promoBanner.targetUrl || '#';
    }

    // Populate Right Column Vertical Banner if available
    const vertBannerLink = document.getElementById('heroVerticalBannerLink');
    const vertBannerImg = document.getElementById('heroVerticalBannerImg');
    if (vertBannerLink && vertBannerImg && this.banners.length > 0) {
      // Use banner 3 or fallback
      const vertPromo = this.banners.length > 3 ? this.banners[3] : (this.banners.length > 1 ? this.banners[this.banners.length - 1] : this.banners[0]);
      vertBannerImg.src = vertPromo.image;
      vertBannerLink.href = vertPromo.targetUrl || '#';
    }

    this.updateSlidePosition();
  },

  renderFallback() {
    if (!this.track) return;
    this.track.innerHTML = `
      <div class="banner-slide">
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80" alt="Khuyến mãi Droppii">
      </div>
    `;
  },

  goTo(index) {
    if (this.banners.length === 0) return;
    if (index < 0) {
      this.currentIndex = this.banners.length - 1;
    } else if (index >= this.banners.length) {
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
