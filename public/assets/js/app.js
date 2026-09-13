/**
 * Main Application Orchestrator
 */
const App = {
  settings: null,

  async init() {
    this.setupHeaderScroll();
    this.setupMobileDrawer();
    this.setupProductSearchAndSort();

    // Parallel initialization of sections
    await Promise.allSettled([
      this.loadSettings(),
      BannerSlider.init(),
      NewsModule.loadHotNews(),
      Products.loadPromotions(),
      Products.loadNewArrivals(),
      Products.loadHomepageCategories(),
      Products.loadCategoryChips(),
      Products.loadExploreProducts(),
      Videos.loadVideos()
    ]);

    // Setup forms
    ContactModule.init();
    SubscriberModule.init();
  },

  async loadSettings() {
    try {
      const res = await API.get('/settings');
      if (res.success && res.data) {
        this.settings = res.data;
        this.applySettings(res.data);
      }
    } catch (e) {
      console.warn('[Settings] Load failed:', e);
    }
  },

  applySettings(s) {
    // Title and Branding
    if (s.siteName) {
      document.title = s.siteName;
      const brandElements = document.querySelectorAll('.dynamic-site-name');
      brandElements.forEach((el) => (el.textContent = s.siteName));
    }

    if (s.logo) {
      const logoImages = document.querySelectorAll('.dynamic-logo-img');
      logoImages.forEach((img) => {
        img.src = s.logo;
        img.style.display = 'block';
      });
    }

    // Phone & Hotline
    if (s.phone) {
      const phoneLinks = document.querySelectorAll('.dynamic-phone-link');
      phoneLinks.forEach((a) => {
        a.href = `tel:${s.phone.replace(/\s+/g, '')}`;
        a.textContent = s.phone;
      });

      const phoneBtn = document.getElementById('floatingPhoneBtn');
      if (phoneBtn) phoneBtn.href = `tel:${s.phone.replace(/\s+/g, '')}`;

      const bottomNavCall = document.getElementById('bottomNavCall');
      if (bottomNavCall) bottomNavCall.href = `tel:${s.phone.replace(/\s+/g, '')}`;
    }

    // Email
    if (s.email) {
      const emailLinks = document.querySelectorAll('.dynamic-email-link');
      emailLinks.forEach((a) => {
        a.href = `mailto:${s.email}`;
        a.textContent = s.email;
      });
    }

    // Address
    if (s.address) {
      const addrEls = document.querySelectorAll('.dynamic-address-text');
      addrEls.forEach((el) => (el.textContent = s.address));
    }

    // Zalo
    if (s.zaloUrl) {
      const zaloFloating = document.getElementById('floatingZaloBtn');
      if (zaloFloating) zaloFloating.href = s.zaloUrl;

      const zaloBottomNav = document.getElementById('bottomNavZalo');
      if (zaloBottomNav) zaloBottomNav.href = s.zaloUrl;
    }

    // Messenger
    if (s.messengerUrl) {
      const msgFloating = document.getElementById('floatingMessengerBtn');
      if (msgFloating) msgFloating.href = s.messengerUrl;
    }

    // Socials
    if (s.facebookUrl) {
      const fbLink = document.getElementById('footerFacebookLink');
      if (fbLink) fbLink.href = s.facebookUrl;
    }
    if (s.youtubeUrl) {
      const ytLink = document.getElementById('footerYoutubeLink');
      if (ytLink) ytLink.href = s.youtubeUrl;
    }
    if (s.tiktokUrl) {
      const ttLink = document.getElementById('footerTiktokLink');
      if (ttLink) ttLink.href = s.tiktokUrl;
    }

    // Footer Description
    if (s.footerDescription) {
      const footerDesc = document.getElementById('footerDescriptionText');
      if (footerDesc) footerDesc.textContent = s.footerDescription;
    }

    // Affiliate Disclosure
    if (s.affiliateDisclosure) {
      const disclosureEl = document.getElementById('footerAffiliateDisclosureText');
      if (disclosureEl) disclosureEl.textContent = s.affiliateDisclosure;
    }
  },

  setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 20) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      },
      { passive: true }
    );
  },

  setupMobileDrawer() {
    const openBtn = document.getElementById('btnOpenDrawer');
    const closeBtn = document.getElementById('btnCloseDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    const drawer = document.getElementById('mobileDrawer');

    const openDrawer = () => {
      if (overlay) overlay.classList.add('is-open');
      if (drawer) drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      if (overlay) overlay.classList.remove('is-open');
      if (drawer) drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Close drawer when clicking navigation links inside drawer
    const drawerLinks = document.querySelectorAll('.drawer-nav-item');
    drawerLinks.forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  },

  setupProductSearchAndSort() {
    const searchInput = document.getElementById('productSearchInput');
    const sortSelect = document.getElementById('productSortSelect');

    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          Products.loadExploreProducts();
        }, 350);
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        Products.loadExploreProducts();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
