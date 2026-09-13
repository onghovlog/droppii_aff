/**
 * HOT News Module with Modal Popup
 */
const NewsModule = {
  async loadHotNews() {
    const container = document.getElementById('hotNewsGrid');
    const heroList = document.getElementById('heroNewsList');

    try {
      const res = await API.get('/news', { hot: true, limit: 6 });
      if (res.success && res.data.length > 0) {
        // 1. Render Main Hot News Grid (Bottom)
        if (container) {
          container.innerHTML = res.data
            .map(
              (news) => `
            <article class="news-card" onclick="NewsModule.openDetail('${news._id}')">
              <div class="news-thumb-wrapper">
                ${news.isHot ? '<span class="news-hot-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg> HOT</span>' : ''}
                <img src="${news.thumbnail || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80'}" alt="${this.escapeHTML(news.title)}" loading="lazy">
              </div>
              <div class="news-body">
                <div class="news-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>${formatDateVN(news.publishedAt || news.createdAt)}</span>
                </div>
                <h3 class="news-title">${this.escapeHTML(news.title)}</h3>
                <p class="news-summary">${this.escapeHTML(news.summary || '')}</p>
                <span class="news-footer-action">Xem chi tiết →</span>
              </div>
            </article>
          `
            )
            .join('');
        }

        // 2. Render Hero News Box (Right column in Hero)
        if (heroList) {
          heroList.innerHTML = res.data
            .slice(0, 4)
            .map(
              (news) => `
            <div class="hero-news-item" onclick="NewsModule.openDetail('${news._id}')">
              <img src="${news.thumbnail || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200'}" class="hero-news-thumb" alt="${this.escapeHTML(news.title)}" loading="lazy">
              <div class="hero-news-info">
                <h4 class="hero-news-item-title">${this.escapeHTML(news.title)}</h4>
                <div class="hero-news-item-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>${formatDateVN(news.publishedAt || news.createdAt)}</span>
                </div>
              </div>
            </div>
          `
            )
            .join('');
        }
      } else {
        if (container) container.innerHTML = `<div class="empty-state-box"><p>Chưa có tin tức nổi bật.</p></div>`;
        if (heroList) heroList.innerHTML = `<div style="padding:10px; color:var(--text-muted); font-size:0.85rem;">Chưa có tin tức.</div>`;
      }
    } catch (err) {
      console.error('[News] Load error:', err);
      if (container) container.innerHTML = `<div class="empty-state-box"><p>Lỗi khi tải tin tức hot.</p></div>`;
      if (heroList) heroList.innerHTML = `<div style="padding:10px; color:var(--text-muted); font-size:0.85rem;">Lỗi tải tin tức.</div>`;
    }
  },

  async openDetail(newsId) {
    try {
      const res = await API.get(`/news/${newsId}`);
      if (res.success && res.data) {
        const news = res.data;
        const imgEl = document.getElementById('newsModalImg');
        const dateEl = document.getElementById('newsModalDate');
        const titleEl = document.getElementById('newsModalTitle');
        const bodyEl = document.getElementById('newsModalBody');

        if (imgEl) {
          if (news.thumbnail) {
            imgEl.src = news.thumbnail;
            imgEl.style.display = 'block';
          } else {
            imgEl.style.display = 'none';
          }
        }

        if (dateEl) {
          dateEl.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Đăng ngày: ${formatDateVN(news.publishedAt || news.createdAt)}</span>
          `;
        }
        if (titleEl) titleEl.textContent = news.title;
        if (bodyEl) bodyEl.innerHTML = news.content;

        Modal.open('newsDetailModal');
      }
    } catch (err) {
      showToast('Không thể tải bài viết chi tiết', 'error');
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
  }
};
