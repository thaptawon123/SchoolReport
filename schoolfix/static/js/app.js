/**
 * SchoolFix Application Scripts
 * Mobile navigation toggle and UI enhancement
 */
document.addEventListener('DOMContentLoaded', function () {
  // Sidebar toggle on mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarWrapper = document.getElementById('sidebar-wrapper');

  if (sidebarToggle && sidebarWrapper) {
    sidebarToggle.addEventListener('click', function (e) {
      e.preventDefault();
      sidebarWrapper.classList.toggle('toggled');
    });
  }

  // Auto close alerts if any
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});
