// ============================================================
// mobile-nav.js — Мобильная навигация: hamburger-меню (ES Module)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const navContainer = document.getElementById('navContainer');

    if (!burgerBtn || !navContainer) return;

    // Функция закрытия меню (вынесена для переиспользования)
    function closeMenu() {
        if (navContainer.classList.contains('open')) {
            navContainer.classList.remove('open');
            burgerBtn.classList.remove('active');
            navContainer.style.visibility = 'hidden';
            navContainer.style.pointerEvents = 'none';
            navContainer.style.opacity = '0';
            document.body.style.overflow = '';
        }
    }

    burgerBtn.addEventListener('click', () => {
        const isOpen = navContainer.classList.toggle('open');
        burgerBtn.classList.toggle('active', isOpen);
        if (isOpen) {
            navContainer.style.visibility = 'visible';
            navContainer.style.pointerEvents = 'auto';
            navContainer.style.opacity = '1';
            document.body.style.overflow = 'hidden';
        } else {
            closeMenu();
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
