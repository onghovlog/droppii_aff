/**
 * Promotional Newsletter Subscription Module
 */
const SubscriberModule = {
  init() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const input = document.getElementById('newsletterInput');
      const submitBtn = document.getElementById('newsletterSubmitBtn');
      const val = input.value.trim();

      if (!val) {
        showToast('Vui lòng nhập Email hoặc Số điện thoại', 'warning');
        input.focus();
        return;
      }

      // Check if email or phone
      const isEmail = val.includes('@');
      const payload = isEmail ? { email: val } : { phone: val };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang đăng ký...';

      try {
        const res = await API.post('/subscribers', payload);
        if (res.success) {
          showToast(res.message || 'Đăng ký nhận khuyến mãi thành công!', 'success');
          form.reset();
        }
      } catch (err) {
        showToast(err.message || 'Không thể đăng ký. Vui lòng thử lại!', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng ký ngay';
      }
    });
  }
};
