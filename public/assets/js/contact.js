/**
 * Contact Form Submission Module
 */
const ContactModule = {
  init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');
      const submitBtn = document.getElementById('contactSubmitBtn');

      let isValid = true;

      // Validate name
      if (!nameInput.value.trim()) {
        this.setError(nameInput, 'Vui lòng nhập họ và tên của bạn');
        isValid = false;
      } else {
        this.clearError(nameInput);
      }

      // Validate phone
      const phoneVal = phoneInput.value.trim();
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneVal) {
        this.setError(phoneInput, 'Vui lòng nhập số điện thoại liên hệ');
        isValid = false;
      } else if (!phoneRegex.test(phoneVal)) {
        this.setError(phoneInput, 'Số điện thoại không đúng định dạng (Ví dụ: 0901234567)');
        isValid = false;
      } else {
        this.clearError(phoneInput);
      }

      // Validate message
      if (!messageInput.value.trim()) {
        this.setError(messageInput, 'Vui lòng nhập nội dung bạn cần hỗ trợ');
        isValid = false;
      } else {
        this.clearError(messageInput);
      }

      if (!isValid) return;

      // Submit
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi...';

      try {
        const res = await API.post('/contacts', {
          name: nameInput.value.trim(),
          phone: phoneVal,
          email: emailInput.value.trim(),
          message: messageInput.value.trim()
        });

        if (res.success) {
          showToast(res.message || 'Thông tin của bạn đã được gửi thành công!', 'success');
          form.reset();
        }
      } catch (err) {
        showToast(err.message || 'Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại!', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi liên hệ ngay';
      }
    });
  },

  setError(input, msg) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('has-error');
      let errEl = formGroup.querySelector('.form-field-error');
      if (errEl) errEl.textContent = msg;
    }
  },

  clearError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('has-error');
    }
  }
};
