// Мобильная навигация: hamburger-меню
document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const navContainer = document.getElementById('navContainer');

    if (!burgerBtn || !navContainer) return;

    // Функция закрытия меню (вынесена для переиспользования)
    function closeMenu() {
        if (navContainer.classList.contains('open')) {
            navContainer.classList.remove('open');
            burgerBtn.classList.remove('active');
            burgerBtn.setAttribute('aria-expanded', 'false');
            
            navContainer.style.visibility = 'hidden';
            navContainer.style.pointerEvents = 'none';
            navContainer.style.opacity = '0';
            
            document.body.style.overflow = '';
        }
    }

    // Переключение меню по клику на бургер
    burgerBtn.addEventListener('click', () => {
        const isOpen = navContainer.classList.toggle('open');
        burgerBtn.classList.toggle('active');
        burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        // Переключаем стили только для мобильного эффекта
        navContainer.style.visibility = isOpen ? 'visible' : 'hidden';
        navContainer.style.pointerEvents = isOpen ? 'auto' : 'none';
        navContainer.style.opacity = isOpen ? '1' : '0';
        
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Закрытие меню при клике на nav-link
    navContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            // Закрываем меню только если оно открыто (мобильный режим)
            if (navContainer.classList.contains('open')) {
                closeMenu();
            }
        });
    });

    // Закрытие меню при клике вне него
    document.addEventListener('click', (e) => {
        if (navContainer.classList.contains('open') && 
            !navContainer.contains(e.target) && 
            !burgerBtn.contains(e.target)) {
            closeMenu();
        }
    });
});
