/**
 * Product Showcase & Affiliate Redirection Module
 */
const Products = {
  currentCategorySlug: '',
  allCategories: [],

  // Generate Skeleton HTML for Loading state
  getSkeletonHTML(count = 4) {
    return Array.from({ length: count })
      .map(
        () => `
        <div class="skeleton-product-card">
          <div class="skeleton skeleton-thumb"></div>
          <div class="skeleton skeleton-line medium"></div>
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-line full" style="height: 28px; margin-top: 6px;"></div>
        </div>
      `
      )
      .join('');
  },

  // Generate HTML for a single product card
  createProductCardHTML(product) {
    const mainImage =
      product.images && product.images.length > 0
        ? product.images[0]
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

    const discountBadge =
      product.discountPercent > 0
        ? `<span class="product-badge-discount">-${product.discountPercent}%</span>`
        : '';

    const newBadge = product.isNew
      ? `<span class="product-badge-new">Mới</span>`
      : '';

    const giftTag = product.gift
      ? `<div class="product-gift-tag"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> <span>${this.escapeHTML(product.gift)}</span></div>`
      : '';

    const origPriceHTML =
      product.priceOriginal > 0 && product.priceOriginal > product.priceSale
        ? `<span class="product-price-original">${formatVND(product.priceOriginal)}</span>`
        : '';

    return `
      <div class="product-card" data-product-id="${product._id}">
        <div class="product-thumb-container" onclick="Products.openDetailById('${product._id}')">
          ${discountBadge}
          ${newBadge}
          <img src="${mainImage}" alt="${this.escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'">
        </div>
        <div class="product-body">
          <h3 class="product-name" title="${this.escapeHTML(product.name)}" onclick="Products.openDetailById('${product._id}')">
            ${this.escapeHTML(product.name)}
          </h3>
          <div class="product-price-row">
            <span class="product-price-sale">${formatVND(product.priceSale)}</span>
            ${origPriceHTML}
          </div>
          ${giftTag}
          <div class="product-actions">
            <button class="btn-detail" type="button" onclick="Products.openDetailById('${product._id}')" aria-label="Xem chi tiết ${this.escapeHTML(product.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>Xem
            </button>
            <button class="btn-buy-affiliate" type="button" onclick="Products.buyNow('${product._id}', '${this.escapeAttr(product.affiliateUrl)}', 'card_cta')" aria-label="Mua ngay ${this.escapeHTML(product.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>Mua ngay
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 1. Load Promotion Products
  async loadPromotions() {
    const container = document.getElementById('promotionProductsGrid');
    if (!container) return;

    container.innerHTML = this.getSkeletonHTML(4);

    try {
      const res = await API.get('/products', { promotion: true, limit: 8 });
      if (res.success && res.data.length > 0) {
        container.innerHTML = res.data.map((p) => this.createProductCardHTML(p)).join('');
      } else {
        container.innerHTML = `<div class="empty-state-box"><p>Hiện chưa có sản phẩm khuyến mãi mới.</p></div>`;
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state-box"><p>Không thể tải sản phẩm khuyến mãi. Vui lòng thử lại sau.</p></div>`;
    }
  },

  // 2. Load New Products
  async loadNewArrivals() {
    const container = document.getElementById('newProductsGrid');
    if (!container) return;

    container.innerHTML = this.getSkeletonHTML(4);

    try {
      const res = await API.get('/products', { new: true, limit: 8 });
      if (res.success && res.data.length > 0) {
        container.innerHTML = res.data.map((p) => this.createProductCardHTML(p)).join('');
      } else {
        container.innerHTML = `<div class="empty-state-box"><p>Hiện chưa có sản phẩm mới cập nhật.</p></div>`;
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state-box"><p>Không thể tải danh sách sản phẩm mới.</p></div>`;
    }
  },

  // 3. Dynamic Homepage Categories (Strictly filtered by showOnHomepage: true)
  async loadHomepageCategories() {
    const container = document.getElementById('dynamicCategoriesContainer');
    if (!container) return;

    try {
      const res = await API.get('/categories', { homepage: true });
      if (res.success && res.data && res.data.length > 0) {
        // Filter strictly for active categories with showOnHomepage: true
        const homepageCats = res.data.filter((c) => c.showOnHomepage === true && c.status !== false);

        if (homepageCats.length === 0) {
          container.innerHTML = '';
          return;
        }

        container.innerHTML = '';

        for (const cat of homepageCats) {
          const limit = cat.homepageProductLimit || 8;
          try {
            const prodRes = await API.get('/products', { category: cat._id, limit });
            
            // Only render section if category has active products
            if (prodRes.success && prodRes.data && prodRes.data.length > 0) {
              const icon = this.getCategoryIcon(cat.slug || cat.name);
              const section = document.createElement('section');
              section.className = 'section-wrapper dynamic-cat-section';
              section.id = `cat-${cat.slug}`;

              section.innerHTML = `
                <div class="container">
                  <div class="section-header">
                    <div>
                      <h2 class="section-title">
                        <span class="badge-icon">${icon}</span>
                        <span>${this.escapeHTML(cat.name)}</span>
                      </h2>
                      ${cat.description ? `<p class="section-subtitle">${this.escapeHTML(cat.description)}</p>` : ''}
                    </div>
                    <button class="btn-detail" style="flex:unset; padding: 6px 14px; font-weight: 700;" onclick="Products.filterByChip('${cat.slug}')" aria-label="Xem tất cả sản phẩm danh mục ${this.escapeHTML(cat.name)}">
                      Xem tất cả →
                    </button>
                  </div>
                  <div class="product-grid" id="catGrid-${cat._id}">
                    ${prodRes.data.map((p) => this.createProductCardHTML(p)).join('')}
                  </div>
                </div>
              `;

              container.appendChild(section);
            }
          } catch (err) {
            console.warn(`[Categories] Failed to load products for category ${cat.name}:`, err);
          }
        }
      } else {
        container.innerHTML = '';
      }
    } catch (err) {
      console.error('[Categories] Dynamic load error:', err);
      container.innerHTML = '';
    }
  },

  getCategoryIcon(nameOrSlug = '') {
    const s = nameOrSlug.toLowerCase();
    if (s.includes('dien-thoai') || s.includes('cong-nghe') || s.includes('phone') || s.includes('tech')) {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    }
    if (s.includes('gia-dung') || s.includes('nha-bep') || s.includes('home') || s.includes('bep')) {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    }
    if (s.includes('my-pham') || s.includes('cham-soc-da') || s.includes('beauty') || s.includes('skincare')) {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    if (s.includes('suc-khoe') || s.includes('dinh-duong') || s.includes('health')) {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>`;
    }
    if (s.includes('thoi-trang') || s.includes('phu-kien') || s.includes('fashion')) {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
  },

  // 4. Category Filter Chips & Main Explore Section
  async loadCategoryChips() {
    const chipsContainer = document.getElementById('categoryChipsBar');
    if (!chipsContainer) return;

    try {
      const res = await API.get('/categories');
      if (res.success && res.data.length > 0) {
        this.allCategories = res.data;
        chipsContainer.innerHTML = `
          <button class="category-chip is-active" data-slug="" onclick="Products.selectCategoryChip('', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg><span>Tất cả</span>
          </button>
          ${res.data
            .map(
              (cat) => `
            <button class="category-chip" data-slug="${cat.slug}" onclick="Products.selectCategoryChip('${cat.slug}', this)">
              ${this.escapeHTML(cat.name)}
            </button>
          `
            )
            .join('')}
        `;
      }
    } catch (err) {
      console.error('[Chips] Load error:', err);
    }
  },

  selectCategoryChip(slug, btnElement) {
    this.currentCategorySlug = slug;
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach((chip) => chip.classList.remove('is-active'));
    if (btnElement) btnElement.classList.add('is-active');

    this.loadExploreProducts();
  },

  filterByChip(slug) {
    const targetChip = document.querySelector(`.category-chip[data-slug="${slug}"]`);
    if (targetChip) {
      this.selectCategoryChip(slug, targetChip);
      const exploreSection = document.getElementById('exploreProductsSection');
      if (exploreSection) {
        exploreSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },

  // 5. Load Filtered Products in Explore Grid
  async loadExploreProducts() {
    const grid = document.getElementById('exploreProductsGrid');
    if (!grid) return;

    grid.innerHTML = this.getSkeletonHTML(6);

    const searchInput = document.getElementById('productSearchInput');
    const sortSelect = document.getElementById('productSortSelect');

    const params = {
      limit: 20
    };

    if (this.currentCategorySlug) {
      params.category = this.currentCategorySlug;
    }

    if (searchInput && searchInput.value.trim()) {
      params.search = searchInput.value.trim();
    }

    if (sortSelect && sortSelect.value) {
      params.sort = sortSelect.value;
    }

    try {
      const res = await API.get('/products', params);
      if (res.success && res.data.length > 0) {
        grid.innerHTML = res.data.map((p) => this.createProductCardHTML(p)).join('');
      } else {
        grid.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon" style="display:flex; justify-content:center; margin-bottom:8px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <p>Không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn.</p>
          </div>
        `;
      }
    } catch (err) {
      grid.innerHTML = `<div class="empty-state-box"><p>Lỗi tải danh sách sản phẩm.</p></div>`;
    }
  },

  // 6. Open Product Detail Modal
  async openDetailById(productId) {
    try {
      const res = await API.get(`/products/${productId}`);
      if (res.success && res.data) {
        this.renderModal(res.data);
        Modal.open('productDetailModal');
      }
    } catch (err) {
      showToast('Không thể tải chi tiết sản phẩm', 'error');
    }
  },

  renderModal(product) {
    const images = product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

    const mainImgEl = document.getElementById('modalMainImage');
    const thumbsRowEl = document.getElementById('modalThumbsRow');
    const catNameEl = document.getElementById('modalProductCat');
    const titleEl = document.getElementById('modalProductTitle');
    const salePriceEl = document.getElementById('modalSalePrice');
    const origPriceEl = document.getElementById('modalOrigPrice');
    const discountEl = document.getElementById('modalDiscountTag');
    const giftBoxEl = document.getElementById('modalGiftBox');
    const descEl = document.getElementById('modalProductDesc');
    const buyBtnEl = document.getElementById('modalBuyAffiliateBtn');

    if (mainImgEl) mainImgEl.src = images[0];

    if (thumbsRowEl) {
      thumbsRowEl.innerHTML = images
        .map(
          (img, idx) => `
        <div class="modal-thumb-item ${idx === 0 ? 'is-selected' : ''}" onclick="Products.switchModalImage('${img}', this)">
          <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy">
        </div>
      `
        )
        .join('');
    }

    if (catNameEl) catNameEl.textContent = product.categoryId?.name || 'Sản phẩm nổi bật';
    if (titleEl) titleEl.textContent = product.name;
    if (salePriceEl) salePriceEl.textContent = formatVND(product.priceSale);

    if (origPriceEl) {
      if (product.priceOriginal > 0 && product.priceOriginal > product.priceSale) {
        origPriceEl.textContent = formatVND(product.priceOriginal);
        origPriceEl.style.display = 'inline';
      } else {
        origPriceEl.style.display = 'none';
      }
    }

    if (discountEl) {
      if (product.discountPercent > 0) {
        discountEl.textContent = `-${product.discountPercent}%`;
        discountEl.style.display = 'inline-block';
      } else {
        discountEl.style.display = 'none';
      }
    }

    if (giftBoxEl) {
      if (product.gift) {
        giftBoxEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> <strong>Ưu đãi tặng kèm:</strong></span> ${this.escapeHTML(product.gift)}`;
        giftBoxEl.style.display = 'block';
      } else {
        giftBoxEl.style.display = 'none';
      }
    }

    if (descEl) {
      descEl.innerHTML = product.description || product.shortDescription || 'Đang cập nhật mô tả chi tiết...';
    }

    if (buyBtnEl) {
      buyBtnEl.onclick = () => {
        this.buyNow(product._id, product.affiliateUrl, 'modal_sticky_cta');
      };
    }
  },

  switchModalImage(src, thumbElement) {
    const mainImgEl = document.getElementById('modalMainImage');
    if (mainImgEl) mainImgEl.src = src;

    const allThumbs = document.querySelectorAll('.modal-thumb-item');
    allThumbs.forEach((t) => t.classList.remove('is-selected'));
    if (thumbElement) thumbElement.classList.add('is-selected');
  },

  // 7. Click Affiliate Tracking & Safe Redirect
  async buyNow(productId, affiliateUrl, source = 'website') {
    if (!affiliateUrl) {
      showToast('Liên kết mua hàng tạm thời chưa sẵn sàng', 'warning');
      return;
    }

    // Fire tracking in background
    API.post('/affiliate-clicks', {
      productId,
      affiliateUrl,
      source,
      referrer: document.referrer || window.location.href
    }).catch((e) => console.warn('[Click Tracking] Failed:', e));

    // Open Affiliate URL in new tab safely
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
};
