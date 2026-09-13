/**
 * Partner Registration Page Module
 */
const PartnerModule = {
  init() {
    const form = document.getElementById('partnerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('partnerName').value.trim();
      const phone = document.getElementById('partnerPhone').value.trim();
      const email = document.getElementById('partnerEmail').value.trim();
      const company = document.getElementById('partnerCompany').value.trim();
      const website = document.getElementById('partnerWebsite').value.trim();
      const field = document.getElementById('partnerField').value.trim();
      const message = document.getElementById('partnerMessage').value.trim();
      const submitBtn = document.getElementById('partnerSubmitBtn');

      if (!name) {
        showToast('Vui lòng nhập họ và tên', 'warning');
        return;
      }
      if (!phone) {
        showToast('Vui lòng nhập số điện thoại liên hệ', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi đăng ký...';

      try {
        const res = await API.post('/partners', {
          name,
          phone,
          email,
          company,
          website,
          field,
          message
        });

        if (res.success) {
          showToast(res.message || 'Đăng ký đối tác thành công!', 'success');
          form.reset();
        }
      } catch (err) {
        showToast(err.message || 'Lỗi khi gửi đăng ký đối tác', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi đăng ký hợp tác';
      }
    });
  }
};
