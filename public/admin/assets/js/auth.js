/**
 * Admin Authentication & Session Guard
 */
const AdminAuth = {
  getToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  },

  getUser() {
    const u = localStorage.getItem('adminUser');
    return u ? JSON.parse(u) : null;
  },

  setSession(token, user) {
    localStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminToken', token);
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
  },

  logout() {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  },

  checkAuth() {
    const token = this.getToken();
    if (!token) {
      window.location.href = '/admin/login';
      return false;
    }
    return true;
  },

  async fetchAuth(endpoint, options = {}) {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return;
    }

    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${token}`;

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const url = endpoint.startsWith('http') ? endpoint : `/api/admin${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401 || response.status === 403) {
        this.logout();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi xử lý yêu cầu');
      }
      return data;
    } catch (err) {
      console.error(`[Admin Auth Fetch Error] ${endpoint}:`, err);
      throw err;
    }
  }
};
