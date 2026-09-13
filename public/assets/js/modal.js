/**
 * Accessible Modal Controller
 */
const Modal = {
  activeModal: null,

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
    this.activeModal = modal;

    // Accessibility focus
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  },

  close(modalId) {
    const modal = modalId ? document.getElementById(modalId) : this.activeModal;
    if (!modal) return;

    modal.classList.remove('is-active');
    document.body.style.overflow = '';
    this.activeModal = null;
  },

  init() {
    // Global ESC key to close active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });

    // Delegate overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close(e.target.id);
      }
    });

    // Close button click
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        const modalId = closeBtn.getAttribute('data-close-modal');
        this.close(modalId);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Modal.init();
});
