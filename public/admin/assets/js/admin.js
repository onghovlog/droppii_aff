/**
 * Admin Panel Management Controller
 */
const AdminApp = {
  currentTab: 'dashboard',
  chartInstance: null,
  deleteTarget: null, // { type: 'product'|'banner'|..., id: '...', callback: fn }

  init() {
    if (!AdminAuth.checkAuth()) return;

    this.setupNavigation();
    this.setupSidebarMobile();
    this.setupAdminUser();
    this.loadCurrentTab();
  },

  setupAdminUser() {
    const user = AdminAuth.getUser();
    if (user && user.name) {
      const nameEl = document.getElementById('adminCurrentUserName');
      if (nameEl) nameEl.textContent = user.name;
    }
  },

  setupSidebarMobile() {
    const hamburger = document.getElementById('adminHamburger');
    const sidebar = document.getElementById('adminSidebar');
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
      });
    }
  },

  setupNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item[data-tab]');
    menuItems.forEach((item) => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update menu classes
    document.querySelectorAll('.admin-menu-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    // Update panels
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === `tab-${tabName}`);
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.remove('is-open');

    // Update Topbar title
    const titleEl = document.getElementById('adminTopbarTitle');
    const titles = {
      dashboard: '📊 Tổng quan hệ thống',
      banners: '🖼️ Quản lý Banner',
      products: '🛍️ Quản lý Sản phẩm',
      categories: '📦 Quản lý Danh mục',
      news: '📰 Quản lý Tin tức',
      videos: '🎬 Quản lý Video',
      contacts: '✉️ Quản lý Liên hệ',
      subscribers: '🔔 Người đăng ký nhận tin',
      partners: '🤝 Đăng ký Đối tác',
      affiliate: '📈 Nhật ký Click Affiliate',
      settings: '⚙️ Cấu hình Website',
      account: '👤 Tài khoản Quản trị'
    };
    if (titleEl) titleEl.textContent = titles[tabName] || 'Quản trị hệ thống';

    this.loadCurrentTab();
  },

  loadCurrentTab() {
    switch (this.currentTab) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'banners':
        this.loadBanners();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'categories':
        this.loadCategories();
        break;
      case 'news':
        this.loadNews();
        break;
      case 'videos':
        this.loadVideos();
        break;
      case 'contacts':
        this.loadContacts();
        break;
      case 'subscribers':
        this.loadSubscribers();
        break;
      case 'partners':
        this.loadPartners();
        break;
      case 'affiliate':
        this.loadAffiliateLogs();
        break;
      case 'settings':
        this.loadSettings();
        break;
      case 'account':
        this.loadAccount();
        break;
    }
  },

  // ================= 1. DASHBOARD =================
  async loadDashboard() {
    try {
      const res = await AdminAuth.fetchAuth('/affiliate-clicks/stats');
      if (res.success && res.data) {
        const { summary, topProducts, chart } = res.data;

        // Counters
        document.getElementById('statTotalProducts').textContent = summary.totalProducts;
        document.getElementById('statTotalCategories').textContent = summary.totalCategories;
        document.getElementById('statNewContacts').textContent = summary.newContacts;
        document.getElementById('statSubscribers').textContent = summary.totalSubscribers;
        document.getElementById('statPartners').textContent = summary.totalPartners;
        document.getElementById('statClicksToday').textContent = summary.todayClicks;
        document.getElementById('statClicks7Days').textContent = summary.clicks7Days;
        document.getElementById('statClicks30Days').textContent = summary.clicks30Days;

        // Render Chart.js
        this.renderClicksChart(chart);

        // Render Top Products
        const topBody = document.getElementById('dashboardTopProductsBody');
        if (topBody) {
          if (topProducts && topProducts.length > 0) {
            topBody.innerHTML = topProducts
              .map(
                (item, idx) => `
              <tr>
                <td><strong>#${idx + 1}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" class="table-thumb" alt="">
                    <span>${this.escapeHTML(item.product?.name || 'Sản phẩm đã xóa')}</span>
                  </div>
                </td>
                <td><strong style="color: var(--sale-red);">${formatVND(item.product?.priceSale || 0)}</strong></td>
                <td><span class="badge-status active">${item.count} Lượt Click</span></td>
              </tr>
            `
              )
              .join('');
          } else {
            topBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Chưa có dữ liệu lượt click.</td></tr>`;
          }
        }
      }
    } catch (err) {
      console.error('[Dashboard Error]:', err);
    }
  },

  renderClicksChart(chartData) {
    const canvas = document.getElementById('clicksChartCanvas');
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Lượt Click Chuyển Sang Link Mua Hàng',
            data: chartData.data,
            borderColor: '#FF7A00',
            backgroundColor: 'rgba(255, 122, 0, 0.12)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#FF7A00',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  },

  // ================= 2. BANNERS (STRICT: IMAGE + TARGET URL ONLY) =================
  async loadBanners() {
    const tbody = document.getElementById('adminBannersTableBody');
    if (!tbody) return;

    try {
      const res = await AdminAuth.fetchAuth('/banners');
      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Chưa có banner nào. Hãy bấm Thêm Banner mới.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map(
            (b) => `
          <tr>
            <td>
              <img src="${b.image}" class="banner-table-thumb" alt="Banner" onerror="this.src='https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300'">
            </td>
            <td>
              <a href="${this.escapeHTML(b.targetUrl)}" target="_blank" style="color: var(--admin-secondary); text-decoration: underline; word-break: break-all; font-size: 0.825rem;">
                ${this.escapeHTML(b.targetUrl)}
              </a>
            </td>
            <td><strong>${b.sortOrder}</strong></td>
            <td>
              <span class="badge-status ${b.status ? 'active' : 'inactive'}">
                ${b.status ? 'Đang hiển thị' : 'Đã ẩn'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.openBannerModal('${b._id}')">✏️ Sửa</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('banner', '${b._id}', 'banner này')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải danh sách banner.</td></tr>`;
    }
  },

  async openBannerModal(bannerId = null) {
    const modal = document.getElementById('adminBannerModal');
    const form = document.getElementById('adminBannerForm');
    form.reset();

    const titleEl = document.getElementById('adminBannerModalTitle');
    const idInput = document.getElementById('adminBannerId');
    const previewImg = document.getElementById('adminBannerImagePreview');

    if (previewImg) previewImg.style.display = 'none';

    if (bannerId) {
      titleEl.textContent = 'Chỉnh sửa Banner';
      idInput.value = bannerId;

      try {
        const res = await AdminAuth.fetchAuth('/banners');
        const banner = res.data.find((b) => b._id === bannerId);
        if (banner) {
          document.getElementById('adminBannerTargetUrl').value = banner.targetUrl;
          document.getElementById('adminBannerSortOrder').value = banner.sortOrder;
          document.getElementById('adminBannerStatus').value = banner.status.toString();
          if (previewImg) {
            previewImg.src = banner.image;
            previewImg.style.display = 'block';
          }
        }
      } catch (e) {
        showToast('Lỗi khi tải thông tin banner', 'error');
        return;
      }
    } else {
      titleEl.textContent = 'Thêm Banner Mới';
      idInput.value = '';
    }

    Modal.open('adminBannerModal');
  },

  async saveBanner(event) {
    event.preventDefault();
    const id = document.getElementById('adminBannerId').value;
    const targetUrl = document.getElementById('adminBannerTargetUrl').value.trim();
    const sortOrder = document.getElementById('adminBannerSortOrder').value;
    const status = document.getElementById('adminBannerStatus').value;
    const fileInput = document.getElementById('adminBannerImageFile');
    const urlInput = document.getElementById('adminBannerImageUrl');

    if (!targetUrl) {
      showToast('Đường dẫn liên kết (Target URL) là bắt buộc', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('targetUrl', targetUrl);
    formData.append('sortOrder', sortOrder || 0);
    formData.append('status', status);

    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]);
    } else if (urlInput && urlInput.value.trim()) {
      formData.append('image', urlInput.value.trim());
    } else if (!id) {
      showToast('Vui lòng chọn ảnh tải lên hoặc nhập link ảnh', 'warning');
      return;
    }

    try {
      const endpoint = id ? `/banners/${id}` : '/banners';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminAuth.fetchAuth(endpoint, {
        method,
        body: formData
      });

      if (res.success) {
        showToast(res.message || 'Lưu banner thành công!', 'success');
        Modal.close('adminBannerModal');
        this.loadBanners();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu banner', 'error');
    }
  },

  // ================= 3. PRODUCTS =================
  async loadProducts(page = 1) {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminProductSearch')?.value || '';
    const category = document.getElementById('adminProductCategoryFilter')?.value || '';
    const status = document.getElementById('adminProductStatusFilter')?.value || '';

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Đang tải danh sách sản phẩm...</td></tr>`;

    try {
      const res = await AdminAuth.fetchAuth(
        `/products?page=${page}&limit=15&search=${encodeURIComponent(search)}&category=${category}&status=${status}`
      );

      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Không tìm thấy sản phẩm nào.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map((p) => {
            const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
            return `
            <tr>
              <td>
                <img src="${thumb}" class="table-thumb" alt="" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'">
              </td>
              <td>
                <strong>${this.escapeHTML(p.name)}</strong>
                ${p.gift ? `<div style="font-size: 0.725rem; color: #C05621;">🎁 ${this.escapeHTML(p.gift)}</div>` : ''}
              </td>
              <td>${this.escapeHTML(p.categoryId?.name || 'Chưa phân loại')}</td>
              <td>
                <div><strong style="color: var(--sale-red);">${formatVND(p.priceSale)}</strong></div>
                ${p.priceOriginal ? `<small style="text-decoration: line-through; color: #94A3B8;">${formatVND(p.priceOriginal)}</small>` : ''}
                ${p.discountPercent > 0 ? `<span class="badge-status active">-${p.discountPercent}%</span>` : ''}
              </td>
              <td>
                ${p.isPromotion ? '<span class="badge-status" style="background:#FFEBEB; color:#E53935;">Khuyến mãi</span> ' : ''}
                ${p.isNew ? '<span class="badge-status" style="background:#EBF3FC; color:#1976D2;">Mới</span> ' : ''}
                ${p.isFeatured ? '<span class="badge-status" style="background:#FEF3C7; color:#D97706;">Nổi bật</span>' : ''}
              </td>
              <td>
                <span class="badge-status ${p.status ? 'active' : 'inactive'}">
                  ${p.status ? 'Hiển thị' : 'Ẩn'}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-action btn-edit" onclick="AdminApp.openProductModal('${p._id}')">✏️ Sửa</button>
                  <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('product', '${p._id}', '${this.escapeAttr(p.name)}')">🗑️ Xóa</button>
                </div>
              </td>
            </tr>
          `;
          })
          .join('');

        // Pagination
        this.renderPagination('adminProductsPagination', res.pagination, (p) => this.loadProducts(p));
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải sản phẩm.</td></tr>`;
    }
  },

  async openProductModal(productId = null) {
    const form = document.getElementById('adminProductForm');
    form.reset();

    const titleEl = document.getElementById('adminProductModalTitle');
    const idInput = document.getElementById('adminProductId');
    const catSelect = document.getElementById('adminProductCategorySelect');

    // Populate Categories Dropdown
    try {
      const catRes = await AdminAuth.fetchAuth('/categories');
      if (catRes.success) {
        catSelect.innerHTML = `
          <option value="">-- Chọn danh mục --</option>
          ${catRes.data.map((c) => `<option value="${c._id}">${this.escapeHTML(c.name)}</option>`).join('')}
        `;
      }
    } catch (e) {
      console.warn('Load categories error', e);
    }

    if (productId) {
      titleEl.textContent = 'Chỉnh sửa Sản Phẩm';
      idInput.value = productId;

      try {
        const pRes = await API.get(`/products/${productId}`);
        if (pRes.success && pRes.data) {
          const p = pRes.data;
          document.getElementById('adminProductName').value = p.name;
          catSelect.value = p.categoryId?._id || p.categoryId || '';
          document.getElementById('adminProductPriceSale').value = p.priceSale;
          document.getElementById('adminProductPriceOriginal').value = p.priceOriginal || '';
          document.getElementById('adminProductDiscount').value = p.discountPercent || '';
          document.getElementById('adminProductGift').value = p.gift || '';
          document.getElementById('adminProductAffiliateUrl').value = p.affiliateUrl;
          document.getElementById('adminProductShortDesc').value = p.shortDescription || '';
          document.getElementById('adminProductDesc').value = p.description || '';
          document.getElementById('adminProductIsPromotion').checked = !!p.isPromotion;
          document.getElementById('adminProductIsNew').checked = !!p.isNew;
          document.getElementById('adminProductIsFeatured').checked = !!p.isFeatured;
          document.getElementById('adminProductStatus').value = p.status.toString();
          document.getElementById('adminProductSortOrder').value = p.sortOrder || 0;
          document.getElementById('adminProductImageUrls').value = (p.images || []).join('\n');
        }
      } catch (err) {
        showToast('Không thể tải chi tiết sản phẩm', 'error');
        return;
      }
    } else {
      titleEl.textContent = 'Thêm Sản Phẩm Mới';
      idInput.value = '';
    }

    Modal.open('adminProductModal');
  },

  async saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('adminProductId').value;
    const name = document.getElementById('adminProductName').value.trim();
    const categoryId = document.getElementById('adminProductCategorySelect').value;
    const priceSale = document.getElementById('adminProductPriceSale').value;
    const priceOriginal = document.getElementById('adminProductPriceOriginal').value;
    const discountPercent = document.getElementById('adminProductDiscount').value;
    const gift = document.getElementById('adminProductGift').value.trim();
    const affiliateUrl = document.getElementById('adminProductAffiliateUrl').value.trim();
    const shortDesc = document.getElementById('adminProductShortDesc').value.trim();
    const desc = document.getElementById('adminProductDesc').value.trim();
    const isPromotion = document.getElementById('adminProductIsPromotion').checked;
    const isNew = document.getElementById('adminProductIsNew').checked;
    const isFeatured = document.getElementById('adminProductIsFeatured').checked;
    const status = document.getElementById('adminProductStatus').value;
    const sortOrder = document.getElementById('adminProductSortOrder').value;
    const fileInput = document.getElementById('adminProductImagesFile');
    const urlsText = document.getElementById('adminProductImageUrls').value;

    if (!name || !categoryId || !affiliateUrl) {
      showToast('Vui lòng nhập Tên sản phẩm, Danh mục và Link Affiliate', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryId', categoryId);
    formData.append('priceSale', priceSale || 0);
    formData.append('priceOriginal', priceOriginal || 0);
    formData.append('discountPercent', discountPercent || 0);
    formData.append('gift', gift);
    formData.append('affiliateUrl', affiliateUrl);
    formData.append('shortDescription', shortDesc);
    formData.append('description', desc);
    formData.append('isPromotion', isPromotion);
    formData.append('isNew', isNew);
    formData.append('isFeatured', isFeatured);
    formData.append('status', status);
    formData.append('sortOrder', sortOrder || 0);

    // Existing URLs
    const existingImages = urlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    formData.append('existingImages', JSON.stringify(existingImages));

    // Uploaded files
    if (fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
      }
    }

    try {
      const endpoint = id ? `/products/${id}` : '/products';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminAuth.fetchAuth(endpoint, {
        method,
        body: formData
      });

      if (res.success) {
        showToast(res.message || 'Lưu sản phẩm thành công!', 'success');
        Modal.close('adminProductModal');
        this.loadProducts();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu sản phẩm', 'error');
    }
  },

  // ================= 4. CATEGORIES (HOMEPAGE DYNAMIC SETTINGS) =================
  async loadCategories() {
    const tbody = document.getElementById('adminCategoriesTableBody');
    if (!tbody) return;

    try {
      const res = await AdminAuth.fetchAuth('/categories');
      if (res.success) {
        tbody.innerHTML = res.data
          .map(
            (c) => `
          <tr>
            <td>
              <img src="${c.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}" class="table-thumb" alt="" onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'">
            </td>
            <td><strong>${this.escapeHTML(c.name)}</strong></td>
            <td><code>${c.slug}</code></td>
            <td><span class="badge-status active">${c.productCount || 0} sản phẩm</span></td>
            <td>
              <button class="badge-status ${c.showOnHomepage ? 'active' : 'inactive'}" 
                style="cursor: pointer; border: 1px solid currentColor; background: none;" 
                onclick="AdminApp.toggleCategoryHomepage('${c._id}', ${!c.showOnHomepage})" 
                title="Bấm để bật/tắt hiển thị danh mục này trên Trang chủ">
                ${c.showOnHomepage ? `✓ Hiện (Thứ tự: ${c.homepageOrder})` : '✕ Ẩn Trang chủ'}
              </button>
            </td>
            <td>
              <span class="badge-status ${c.status ? 'active' : 'inactive'}">
                ${c.status ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.openCategoryModal('${c._id}')">✏️ Sửa</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('category', '${c._id}', '${this.escapeAttr(c.name)}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải danh mục.</td></tr>`;
    }
  },

  async toggleCategoryHomepage(id, newStatus) {
    try {
      const formData = new FormData();
      formData.append('showOnHomepage', newStatus);

      const res = await AdminAuth.fetchAuth(`/categories/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (res.success) {
        showToast(newStatus ? 'Đã bật hiển thị danh mục trên Trang Chủ' : 'Đã ẩn danh mục khỏi Trang Chủ', 'success');
        this.loadCategories();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật trạng thái danh mục', 'error');
    }
  },

  async openCategoryModal(categoryId = null) {
    const form = document.getElementById('adminCategoryForm');
    form.reset();

    const titleEl = document.getElementById('adminCategoryModalTitle');
    const idInput = document.getElementById('adminCategoryId');

    if (categoryId) {
      titleEl.textContent = 'Chỉnh sửa Danh Mục';
      idInput.value = categoryId;

      try {
        const res = await AdminAuth.fetchAuth('/categories');
        const cat = res.data.find((c) => c._id === categoryId);
        if (cat) {
          document.getElementById('adminCategoryName').value = cat.name;
          document.getElementById('adminCategoryDesc').value = cat.description || '';
          document.getElementById('adminCategoryShowHomepage').checked = !!cat.showOnHomepage;
          document.getElementById('adminCategoryHomepageOrder').value = cat.homepageOrder || 0;
          document.getElementById('adminCategoryProductLimit').value = cat.homepageProductLimit || 8;
          document.getElementById('adminCategoryStatus').value = cat.status.toString();
          document.getElementById('adminCategoryImageUrl').value = cat.image || '';
        }
      } catch (e) {
        showToast('Lỗi khi tải thông tin danh mục', 'error');
        return;
      }
    } else {
      titleEl.textContent = 'Thêm Danh Mục Mới';
      idInput.value = '';
    }

    Modal.open('adminCategoryModal');
  },

  async saveCategory(event) {
    event.preventDefault();
    const id = document.getElementById('adminCategoryId').value;
    const name = document.getElementById('adminCategoryName').value.trim();
    const description = document.getElementById('adminCategoryDesc').value.trim();
    const showOnHomepage = document.getElementById('adminCategoryShowHomepage').checked;
    const homepageOrder = document.getElementById('adminCategoryHomepageOrder').value;
    const homepageProductLimit = document.getElementById('adminCategoryProductLimit').value;
    const status = document.getElementById('adminCategoryStatus').value;
    const fileInput = document.getElementById('adminCategoryImageFile');
    const imageUrl = document.getElementById('adminCategoryImageUrl').value.trim();

    if (!name) {
      showToast('Tên danh mục là bắt buộc', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('showOnHomepage', showOnHomepage);
    formData.append('homepageOrder', homepageOrder || 0);
    formData.append('homepageProductLimit', homepageProductLimit || 8);
    formData.append('status', status);

    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]);
    } else if (imageUrl) {
      formData.append('image', imageUrl);
    }

    try {
      const endpoint = id ? `/categories/${id}` : '/categories';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminAuth.fetchAuth(endpoint, {
        method,
        body: formData
      });

      if (res.success) {
        showToast(res.message || 'Lưu danh mục thành công!', 'success');
        Modal.close('adminCategoryModal');
        this.loadCategories();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu danh mục', 'error');
    }
  },

  // ================= 5. NEWS =================
  async loadNews() {
    const tbody = document.getElementById('adminNewsTableBody');
    if (!tbody) return;

    try {
      const res = await AdminAuth.fetchAuth('/news');
      if (res.success) {
        tbody.innerHTML = res.data
          .map(
            (n) => `
          <tr>
            <td>
              <img src="${n.thumbnail || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100'}" class="table-thumb" alt="" onerror="this.src='https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100'">
            </td>
            <td><strong>${this.escapeHTML(n.title)}</strong></td>
            <td>
              <span class="badge-status ${n.isHot ? 'active' : 'inactive'}" style="${n.isHot ? 'background:#FFEBEB; color:#E53935;' : ''}">
                ${n.isHot ? 'HOT 🔥' : 'Thường'}
              </span>
            </td>
            <td>${formatDateVN(n.publishedAt || n.createdAt)}</td>
            <td>
              <span class="badge-status ${n.status ? 'active' : 'inactive'}">
                ${n.status ? 'Xuất bản' : 'Ẩn'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.openNewsModal('${n._id}')">✏️ Sửa</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('news', '${n._id}', '${this.escapeAttr(n.title)}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải tin tức.</td></tr>`;
    }
  },

  async openNewsModal(newsId = null) {
    const form = document.getElementById('adminNewsForm');
    form.reset();

    const titleEl = document.getElementById('adminNewsModalTitle');
    const idInput = document.getElementById('adminNewsId');

    if (newsId) {
      titleEl.textContent = 'Chỉnh sửa Tin Tức';
      idInput.value = newsId;

      try {
        const res = await AdminAuth.fetchAuth('/news');
        const n = res.data.find((item) => item._id === newsId);
        if (n) {
          document.getElementById('adminNewsTitle').value = n.title;
          document.getElementById('adminNewsSummary').value = n.summary || '';
          document.getElementById('adminNewsContent').value = n.content;
          document.getElementById('adminNewsIsHot').checked = !!n.isHot;
          document.getElementById('adminNewsStatus').value = n.status.toString();
          document.getElementById('adminNewsThumbnailUrl').value = n.thumbnail || '';
        }
      } catch (e) {
        showToast('Lỗi khi tải thông tin bài viết', 'error');
        return;
      }
    } else {
      titleEl.textContent = 'Thêm Bài Viết Mới';
      idInput.value = '';
    }

    Modal.open('adminNewsModal');
  },

  async saveNews(event) {
    event.preventDefault();
    const id = document.getElementById('adminNewsId').value;
    const title = document.getElementById('adminNewsTitle').value.trim();
    const summary = document.getElementById('adminNewsSummary').value.trim();
    const content = document.getElementById('adminNewsContent').value.trim();
    const isHot = document.getElementById('adminNewsIsHot').checked;
    const status = document.getElementById('adminNewsStatus').value;
    const fileInput = document.getElementById('adminNewsThumbnailFile');
    const thumbUrl = document.getElementById('adminNewsThumbnailUrl').value.trim();

    if (!title || !content) {
      showToast('Tiêu đề và nội dung bài viết là bắt buộc', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    formData.append('isHot', isHot);
    formData.append('status', status);

    if (fileInput.files.length > 0) {
      formData.append('thumbnail', fileInput.files[0]);
    } else if (thumbUrl) {
      formData.append('thumbnail', thumbUrl);
    }

    try {
      const endpoint = id ? `/news/${id}` : '/news';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminAuth.fetchAuth(endpoint, {
        method,
        body: formData
      });

      if (res.success) {
        showToast(res.message || 'Lưu bài viết thành công!', 'success');
        Modal.close('adminNewsModal');
        this.loadNews();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu bài viết', 'error');
    }
  },

  // ================= 6. VIDEOS =================
  async loadVideos() {
    const tbody = document.getElementById('adminVideosTableBody');
    if (!tbody) return;

    try {
      const res = await AdminAuth.fetchAuth('/videos');
      if (res.success) {
        tbody.innerHTML = res.data
          .map(
            (v) => `
          <tr>
            <td>
              <img src="${v.thumbnail || this.getYouTubeThumb(v.videoUrl) || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100'}" class="table-thumb" alt="" style="aspect-ratio: 16/9; object-fit: cover; border-radius: 4px;">
            </td>
            <td>
              <strong>${this.escapeHTML(v.title)}</strong>
              ${v.description ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${this.escapeHTML(v.description.substring(0, 50))}...</div>` : ''}
            </td>
            <td>
              <span class="badge-status active">${v.platform || 'youtube'}</span>
              <div style="margin-top: 4px;">
                <span class="badge-status ${v.isVertical ? 'draft' : 'active'}" style="font-size: 0.7rem;">
                  ${v.isVertical ? '📱 Shorts (9:16)' : '📺 Ngang (16:9)'}
                </span>
              </div>
            </td>
            <td>
              <a href="${this.escapeHTML(v.videoUrl)}" target="_blank" style="color: var(--admin-secondary); text-decoration: underline; font-size: 0.85rem;">
                Mở link video ↗
              </a>
            </td>
            <td>${v.sortOrder}</td>
            <td>
              <span class="badge-status ${v.status ? 'active' : 'inactive'}">
                ${v.status ? 'Hiển thị' : 'Ẩn'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.openVideoModal('${v._id}')">✏️ Sửa</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('video', '${v._id}', '${this.escapeAttr(v.title)}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải video.</td></tr>`;
    }
  },

  async openVideoModal(videoId = null) {
    const form = document.getElementById('adminVideoForm');
    form.reset();

    const titleEl = document.getElementById('adminVideoModalTitle');
    const idInput = document.getElementById('adminVideoId');
    const thumbPreview = document.getElementById('adminVideoThumbPreview');
    const emptyText = document.getElementById('adminVideoThumbEmptyText');

    if (thumbPreview) thumbPreview.style.display = 'none';
    if (emptyText) emptyText.style.display = 'block';

    if (videoId) {
      titleEl.textContent = 'Chỉnh sửa Video';
      idInput.value = videoId;

      try {
        const res = await AdminAuth.fetchAuth('/videos');
        const v = res.data.find((item) => item._id === videoId);
        if (v) {
          document.getElementById('adminVideoTitle').value = v.title;
          document.getElementById('adminVideoPlatform').value = v.platform || 'youtube';
          document.getElementById('adminVideoUrl').value = v.videoUrl;
          document.getElementById('adminVideoIsVertical').value = v.isVertical ? 'true' : 'false';
          document.getElementById('adminVideoDesc').value = v.description || '';
          document.getElementById('adminVideoSortOrder').value = v.sortOrder || 0;
          document.getElementById('adminVideoStatus').value = v.status.toString();
          
          const thumbUrl = v.thumbnail || this.getYouTubeThumb(v.videoUrl) || '';
          document.getElementById('adminVideoThumbUrl').value = thumbUrl;
          this.updateVideoThumbPreview(thumbUrl);
        }
      } catch (e) {
        showToast('Lỗi khi tải thông tin video', 'error');
        return;
      }
    } else {
      titleEl.textContent = 'Thêm Video Mới';
      idInput.value = '';
      document.getElementById('adminVideoIsVertical').value = 'false';
    }

    Modal.open('adminVideoModal');
  },

  handleVideoUrlInput(url) {
    if (!url) return;
    const cleanUrl = url.trim();

    // Auto detect vertical shorts
    if (cleanUrl.includes('/shorts/')) {
      const isVerticalEl = document.getElementById('adminVideoIsVertical');
      if (isVerticalEl) isVerticalEl.value = 'true';
    }

    // Auto extract YouTube thumbnail
    const thumbUrl = this.getYouTubeThumb(cleanUrl);
    if (thumbUrl) {
      const thumbInput = document.getElementById('adminVideoThumbUrl');
      if (thumbInput) thumbInput.value = thumbUrl;
      this.updateVideoThumbPreview(thumbUrl);
    }
  },

  updateVideoThumbPreview(url) {
    const preview = document.getElementById('adminVideoThumbPreview');
    const emptyText = document.getElementById('adminVideoThumbEmptyText');
    if (!preview) return;

    if (url && url.trim()) {
      preview.src = url.trim();
      preview.style.display = 'block';
      if (emptyText) emptyText.style.display = 'none';
      preview.onerror = () => {
        preview.style.display = 'none';
        if (emptyText) emptyText.style.display = 'block';
      };
    } else {
      preview.src = '';
      preview.style.display = 'none';
      if (emptyText) emptyText.style.display = 'block';
    }
  },

  async fetchYouTubeInfo() {
    const urlInput = document.getElementById('adminVideoUrl');
    const url = urlInput ? urlInput.value.trim() : '';

    if (!url) {
      showToast('Vui lòng nhập đường dẫn video YouTube trước', 'warning');
      return;
    }

    this.handleVideoUrlInput(url);

    try {
      showToast('Đang lấy thông tin từ YouTube...', 'info');
      const oEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oEmbedUrl);
      const data = await response.json();

      if (data && data.title) {
        const titleInput = document.getElementById('adminVideoTitle');
        if (titleInput) titleInput.value = data.title;

        if (data.thumbnail_url) {
          const thumbInput = document.getElementById('adminVideoThumbUrl');
          if (thumbInput) thumbInput.value = data.thumbnail_url;
          this.updateVideoThumbPreview(data.thumbnail_url);
        }
        showToast('Đã tự động lấy tiêu đề & thumbnail thành công!', 'success');
      } else {
        showToast('Đã trích xuất Thumbnail thành công!', 'success');
      }
    } catch (err) {
      console.warn('[Admin] oEmbed fetch fallback:', err);
      showToast('Đã tự động trích xuất Thumbnail từ mã video!', 'info');
    }
  },

  getYouTubeThumb(url) {
    if (!url) return '';
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    return '';
  },

  async saveVideo(event) {
    event.preventDefault();
    const id = document.getElementById('adminVideoId').value;
    const title = document.getElementById('adminVideoTitle').value.trim();
    const platform = document.getElementById('adminVideoPlatform').value;
    const videoUrl = document.getElementById('adminVideoUrl').value.trim();
    const isVertical = document.getElementById('adminVideoIsVertical').value;
    const description = document.getElementById('adminVideoDesc').value.trim();
    const sortOrder = document.getElementById('adminVideoSortOrder').value;
    const status = document.getElementById('adminVideoStatus').value;
    const fileInput = document.getElementById('adminVideoThumbnailFile');
    const thumbUrl = document.getElementById('adminVideoThumbUrl').value.trim();

    if (!title || !videoUrl) {
      showToast('Tiêu đề và đường dẫn video là bắt buộc', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('platform', platform);
    formData.append('videoUrl', videoUrl);
    formData.append('isVertical', isVertical);
    formData.append('description', description);
    formData.append('sortOrder', sortOrder || 0);
    formData.append('status', status);

    if (fileInput && fileInput.files.length > 0) {
      formData.append('thumbnail', fileInput.files[0]);
    } else if (thumbUrl) {
      formData.append('thumbnail', thumbUrl);
    }

    try {
      const endpoint = id ? `/videos/${id}` : '/videos';
      const method = id ? 'PUT' : 'POST';

      const res = await AdminAuth.fetchAuth(endpoint, {
        method,
        body: formData
      });

      if (res.success) {
        showToast(res.message || 'Lưu video thành công!', 'success');
        Modal.close('adminVideoModal');
        this.loadVideos();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu video', 'error');
    }
  },

  // ================= 7. CONTACTS =================
  async loadContacts(page = 1) {
    const tbody = document.getElementById('adminContactsTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminContactSearch')?.value || '';
    const status = document.getElementById('adminContactStatusFilter')?.value || '';

    try {
      const res = await AdminAuth.fetchAuth(
        `/contacts?page=${page}&limit=20&search=${encodeURIComponent(search)}&status=${status}`
      );

      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Không có liên hệ nào.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map(
            (c) => `
          <tr>
            <td>
              <strong>${this.escapeHTML(c.name)}</strong>
              ${c.email ? `<div style="font-size:0.75rem; color:#64748B;">${this.escapeHTML(c.email)}</div>` : ''}
            </td>
            <td><a href="tel:${c.phone}" style="color:var(--admin-secondary); font-weight:600;">${this.escapeHTML(c.phone)}</a></td>
            <td style="max-width: 250px;">
              <div style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-size:0.825rem;">
                ${this.escapeHTML(c.message)}
              </div>
            </td>
            <td>
              <select class="form-select" style="padding:4px 8px; font-size:0.75rem;" onchange="AdminApp.updateContactStatus('${c._id}', this.value)">
                <option value="new" ${c.status === 'new' ? 'selected' : ''}>Mới (New)</option>
                <option value="processing" ${c.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                <option value="spam" ${c.status === 'spam' ? 'selected' : ''}>Spam</option>
              </select>
            </td>
            <td>${formatDateVN(c.createdAt)}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.viewContactDetail('${c._id}')">👁 Xem</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('contact', '${c._id}', 'liên hệ của ${this.escapeAttr(c.name)}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');

        this.renderPagination('adminContactsPagination', res.pagination, (p) => this.loadContacts(p));
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải liên hệ.</td></tr>`;
    }
  },

  async updateContactStatus(id, newStatus) {
    try {
      const res = await AdminAuth.fetchAuth(`/contacts/${id}`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      if (res.success) {
        showToast('Cập nhật trạng thái liên hệ thành công', 'success');
      }
    } catch (e) {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  },

  async viewContactDetail(id) {
    try {
      const res = await AdminAuth.fetchAuth('/contacts');
      const c = res.data.find((item) => item._id === id);
      if (c) {
        alert(`Họ tên: ${c.name}\nSĐT: ${c.phone}\nEmail: ${c.email || 'Không có'}\nNgày gửi: ${new Date(c.createdAt).toLocaleString('vi-VN')}\n\nNội dung:\n${c.message}`);
      }
    } catch (e) {}
  },

  // ================= 8. SUBSCRIBERS =================
  async loadSubscribers(page = 1) {
    const tbody = document.getElementById('adminSubscribersTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminSubscriberSearch')?.value || '';

    try {
      const res = await AdminAuth.fetchAuth(
        `/subscribers?page=${page}&limit=30&search=${encodeURIComponent(search)}`
      );

      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Không có người đăng ký nào.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map(
            (s, idx) => `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${this.escapeHTML(s.email || '(Không có)')}</strong></td>
            <td>${this.escapeHTML(s.phone || '(Không có)')}</td>
            <td><span class="badge-status ${s.status ? 'active' : 'inactive'}">${s.status ? 'Đang nhận tin' : 'Tạm ngưng'}</span></td>
            <td>${formatDateVN(s.createdAt)}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.toggleSubscriber('${s._id}')">
                  ${s.status ? '⏸ Tạm dừng' : '▶ Bật lại'}
                </button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('subscriber', '${s._id}', 'người đăng ký này')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');

        this.renderPagination('adminSubscribersPagination', res.pagination, (p) => this.loadSubscribers(p));
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải danh sách nhận tin.</td></tr>`;
    }
  },

  async toggleSubscriber(id) {
    try {
      const res = await AdminAuth.fetchAuth(`/subscribers/${id}`, { method: 'PUT' });
      if (res.success) {
        showToast(res.message, 'success');
        this.loadSubscribers();
      }
    } catch (e) {
      showToast('Lỗi cập nhật', 'error');
    }
  },

  exportSubscribersCSV() {
    const token = AdminAuth.getToken();
    window.open(`/api/admin/subscribers/export?token=${token}`, '_blank');
  },

  // ================= 9. PARTNERS =================
  async loadPartners(page = 1) {
    const tbody = document.getElementById('adminPartnersTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminPartnerSearch')?.value || '';
    const status = document.getElementById('adminPartnerStatusFilter')?.value || '';

    try {
      const res = await AdminAuth.fetchAuth(
        `/partners?page=${page}&limit=20&search=${encodeURIComponent(search)}&status=${status}`
      );

      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Không có đăng ký đối tác nào.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map(
            (p) => `
          <tr>
            <td>
              <strong>${this.escapeHTML(p.name)}</strong>
              ${p.email ? `<div style="font-size:0.75rem; color:#64748B;">${this.escapeHTML(p.email)}</div>` : ''}
            </td>
            <td><a href="tel:${p.phone}" style="color:var(--admin-secondary); font-weight:600;">${this.escapeHTML(p.phone)}</a></td>
            <td>
              <strong>${this.escapeHTML(p.company || 'Cá nhân')}</strong>
              ${p.website ? `<div><a href="${this.escapeHTML(p.website)}" target="_blank" style="font-size:0.75rem; color:var(--admin-secondary);">Xem web ↗</a></div>` : ''}
            </td>
            <td><span class="badge-status active">${this.escapeHTML(p.field || 'Chung')}</span></td>
            <td>
              <select class="form-select" style="padding:4px 8px; font-size:0.75rem;" onchange="AdminApp.updatePartnerStatus('${p._id}', this.value)">
                <option value="new" ${p.status === 'new' ? 'selected' : ''}>Mới (New)</option>
                <option value="contacted" ${p.status === 'contacted' ? 'selected' : ''}>Đã liên hệ</option>
                <option value="approved" ${p.status === 'approved' ? 'selected' : ''}>Hợp tác (Approved)</option>
                <option value="rejected" ${p.status === 'rejected' ? 'selected' : ''}>Từ chối</option>
              </select>
            </td>
            <td>${formatDateVN(p.createdAt)}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-action btn-edit" onclick="AdminApp.viewPartnerDetail('${p._id}')">👁 Xem</button>
                <button class="btn-action btn-delete" onclick="AdminApp.confirmDelete('partner', '${p._id}', 'đối tác ${this.escapeAttr(p.name)}')">🗑️ Xóa</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');

        this.renderPagination('adminPartnersPagination', res.pagination, (p) => this.loadPartners(p));
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Lỗi tải đối tác.</td></tr>`;
    }
  },

  async updatePartnerStatus(id, status) {
    try {
      const res = await AdminAuth.fetchAuth(`/partners/${id}`, {
        method: 'PUT',
        body: { status }
      });
      if (res.success) {
        showToast('Cập nhật trạng thái đối tác thành công', 'success');
      }
    } catch (e) {
      showToast('Lỗi cập nhật', 'error');
    }
  },

  async viewPartnerDetail(id) {
    try {
      const res = await AdminAuth.fetchAuth('/partners');
      const p = res.data.find((item) => item._id === id);
      if (p) {
        alert(`Họ tên: ${p.name}\nSĐT: ${p.phone}\nEmail: ${p.email || 'Không có'}\nCông ty: ${p.company || 'Không có'}\nWebsite: ${p.website || 'Không có'}\nLĩnh vực: ${p.field || 'Chung'}\n\nNội dung hợp tác:\n${p.message || 'Không có'}`);
      }
    } catch (e) {}
  },

  // ================= 10. AFFILIATE LOGS =================
  async loadAffiliateLogs(page = 1) {
    const tbody = document.getElementById('adminAffiliateLogsTableBody');
    if (!tbody) return;

    try {
      const res = await AdminAuth.fetchAuth(`/affiliate-clicks?page=${page}&limit=30`);
      if (res.success) {
        if (res.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Chưa có lượt click nào được ghi nhận.</td></tr>`;
          return;
        }

        tbody.innerHTML = res.data
          .map(
            (c, idx) => `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                ${c.productId?.images?.[0] ? `<img src="${c.productId.images[0]}" class="table-thumb" style="width:36px;height:36px;" alt="">` : ''}
                <strong>${this.escapeHTML(c.productId?.name || 'Link Tổng')}</strong>
              </div>
            </td>
            <td><span class="badge-status active">${c.source || 'website'}</span></td>
            <td>
              <a href="${this.escapeHTML(c.affiliateUrl)}" target="_blank" style="color:var(--admin-secondary); text-decoration:underline; font-size:0.775rem; word-break:break-all;">
                ${this.escapeHTML(c.affiliateUrl.substring(0, 45))}...
              </a>
            </td>
            <td><code>${c.ip || '127.0.0.1'}</code></td>
            <td>${new Date(c.createdAt).toLocaleString('vi-VN')}</td>
          </tr>
        `
          )
          .join('');

        this.renderPagination('adminAffiliatePagination', res.pagination, (p) => this.loadAffiliateLogs(p));
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi tải nhật ký click.</td></tr>`;
    }
  },

  // ================= 11. SETTINGS =================
  async loadSettings() {
    try {
      const res = await AdminAuth.fetchAuth('/settings');
      if (res.success && res.data) {
        const s = res.data;
        document.getElementById('adminSettingSiteName').value = s.siteName || '';
        document.getElementById('adminSettingPhone').value = s.phone || '';
        document.getElementById('adminSettingEmail').value = s.email || '';
        document.getElementById('adminSettingAddress').value = s.address || '';
        document.getElementById('adminSettingZaloUrl').value = s.zaloUrl || '';
        document.getElementById('adminSettingMessengerUrl').value = s.messengerUrl || '';
        document.getElementById('adminSettingFacebookUrl').value = s.facebookUrl || '';
        document.getElementById('adminSettingYoutubeUrl').value = s.youtubeUrl || '';
        document.getElementById('adminSettingTiktokUrl').value = s.tiktokUrl || '';
        document.getElementById('adminSettingFooterDesc').value = s.footerDescription || '';
        document.getElementById('adminSettingDisclosure').value = s.affiliateDisclosure || '';
      }
    } catch (err) {
      console.error('[Settings Load Error]:', err);
    }
  },

  async saveSettings(event) {
    event.preventDefault();
    const siteName = document.getElementById('adminSettingSiteName').value.trim();
    const phone = document.getElementById('adminSettingPhone').value.trim();
    const email = document.getElementById('adminSettingEmail').value.trim();
    const address = document.getElementById('adminSettingAddress').value.trim();
    const zaloUrl = document.getElementById('adminSettingZaloUrl').value.trim();
    const messengerUrl = document.getElementById('adminSettingMessengerUrl').value.trim();
    const facebookUrl = document.getElementById('adminSettingFacebookUrl').value.trim();
    const youtubeUrl = document.getElementById('adminSettingYoutubeUrl').value.trim();
    const tiktokUrl = document.getElementById('adminSettingTiktokUrl').value.trim();
    const footerDesc = document.getElementById('adminSettingFooterDesc').value.trim();
    const disclosure = document.getElementById('adminSettingDisclosure').value.trim();

    const logoFile = document.getElementById('adminSettingLogoFile');
    const faviconFile = document.getElementById('adminSettingFaviconFile');

    const formData = new FormData();
    formData.append('siteName', siteName);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('zaloUrl', zaloUrl);
    formData.append('messengerUrl', messengerUrl);
    formData.append('facebookUrl', facebookUrl);
    formData.append('youtubeUrl', youtubeUrl);
    formData.append('tiktokUrl', tiktokUrl);
    formData.append('footerDescription', footerDesc);
    formData.append('affiliateDisclosure', disclosure);

    if (logoFile && logoFile.files.length > 0) {
      formData.append('logo', logoFile.files[0]);
    }
    if (faviconFile && faviconFile.files.length > 0) {
      formData.append('favicon', faviconFile.files[0]);
    }

    try {
      const res = await AdminAuth.fetchAuth('/settings', {
        method: 'PUT',
        body: formData
      });

      if (res.success) {
        showToast('Cập nhật cấu hình website thành công!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi lưu cấu hình', 'error');
    }
  },

  // ================= 12. ACCOUNT =================
  async loadAccount() {
    try {
      const res = await AdminAuth.fetchAuth('/me');
      if (res.success && res.data) {
        document.getElementById('adminProfileName').value = res.data.name;
        document.getElementById('adminProfileEmail').value = res.data.email;
      }
    } catch (e) {}
  },

  async saveAccountProfile(event) {
    event.preventDefault();
    const name = document.getElementById('adminProfileName').value.trim();
    const currentPassword = document.getElementById('adminCurrentPassword').value;
    const newPassword = document.getElementById('adminNewPassword').value;

    const payload = { name };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const res = await AdminAuth.fetchAuth('/profile', {
        method: 'PUT',
        body: payload
      });

      if (res.success) {
        showToast('Cập nhật thông tin quản trị thành công!', 'success');
        AdminAuth.setSession(AdminAuth.getToken(), res.data);
        this.setupAdminUser();
        document.getElementById('adminCurrentPassword').value = '';
        document.getElementById('adminNewPassword').value = '';
      }
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật tài khoản', 'error');
    }
  },

  // ================= DELETE CONFIRMATION DIALOG =================
  confirmDelete(type, id, itemName = 'mục này') {
    this.deleteTarget = { type, id };
    const textEl = document.getElementById('deleteConfirmText');
    if (textEl) {
      textEl.textContent = `Bạn có chắc chắn muốn xóa vĩnh viễn ${itemName}? Thao tác này không thể hoàn tác.`;
    }
    Modal.open('adminDeleteConfirmModal');
  },

  async executeDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;

    let endpoint = '';
    if (type === 'banner') endpoint = `/banners/${id}`;
    else if (type === 'product') endpoint = `/products/${id}`;
    else if (type === 'category') endpoint = `/categories/${id}`;
    else if (type === 'news') endpoint = `/news/${id}`;
    else if (type === 'video') endpoint = `/videos/${id}`;
    else if (type === 'contact') endpoint = `/contacts/${id}`;
    else if (type === 'subscriber') endpoint = `/subscribers/${id}`;
    else if (type === 'partner') endpoint = `/partners/${id}`;

    try {
      const res = await AdminAuth.fetchAuth(endpoint, { method: 'DELETE' });
      if (res.success) {
        showToast(res.message || 'Xóa thành công!', 'success');
        Modal.close('adminDeleteConfirmModal');
        this.loadCurrentTab();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa', 'error');
      Modal.close('adminDeleteConfirmModal');
    } finally {
      this.deleteTarget = null;
    }
  },

  // Helper Pagination Renderer
  renderPagination(containerId, pagination, onPageClick) {
    const container = document.getElementById(containerId);
    if (!container || !pagination) return;

    const { page, totalPages, total } = pagination;
    if (totalPages <= 1) {
      container.innerHTML = `<div>Tổng cộng: <strong>${total}</strong> mục</div><div>Trang 1 / 1</div>`;
      return;
    }

    container.innerHTML = `
      <div>Tổng cộng: <strong>${total}</strong> mục (Trang ${page} / ${totalPages})</div>
      <div style="display: flex; gap: 6px;">
        <button class="btn-action" ${page <= 1 ? 'disabled' : ''} onclick="AdminApp.handlePageChange('${containerId}', ${page - 1})">‹ Trang trước</button>
        <button class="btn-action" ${page >= totalPages ? 'disabled' : ''} onclick="AdminApp.handlePageChange('${containerId}', ${page + 1})">Trang sau ›</button>
      </div>
    `;

    this._pageCallbacks = this._pageCallbacks || {};
    this._pageCallbacks[containerId] = onPageClick;
  },

  handlePageChange(containerId, targetPage) {
    if (this._pageCallbacks && this._pageCallbacks[containerId]) {
      this._pageCallbacks[containerId](targetPage);
    }
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

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
