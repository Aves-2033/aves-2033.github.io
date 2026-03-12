// ============================================================
// mobile-nav.js — Мобильная навигация: hamburger-меню (ES Module)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const navContainer = document.getElementById('navContainer');

    if (!burgerBtn || !navContainer) return;

    // Функция закрытия меню (вынесена для переиспользования)
    function closeMenu() {
        navContainer.classList.remove('open');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    burgerBtn.addEventListener('click', () => {
        if (navContainer.classList.contains('open')) {
            closeMenu();
        } else {
            navContainer.classList.add('open');
            burgerBtn.classList.add('active');
            burgerBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
    });

    // Close on nav link click
    navContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close on overlay click
    navContainer.addEventListener('click', (e) => {
        if (e.target === navContainer) {
            closeMenu();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
});
