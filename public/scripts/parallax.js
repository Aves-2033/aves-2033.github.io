// Параллакс эффекты для страницы

// Easing функции для плавных переходов
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Интерполяция значений для плавной анимации
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Состояние для отслеживания элементов
let parallaxElements = {
    hero: null,
    catalogHeader: null,
    sections: [],
    cards: [],
    catalogGrid: null
};

// Текущие значения для плавной интерполяции
let currentValues = {
    heroOffset: 0,
    catalogHeaderOffset: 0,
    sectionOffsets: {}
};

// Целевые значения
let targetValues = {
    heroOffset: 0,
    catalogHeaderOffset: 0,
    sectionOffsets: {}
};

// Флаг для requestAnimationFrame
let rafId = null;
let isScrolling = false;
let isAnimating = false;

// Throttle функция для оптимизации скролла
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Хранилище для event listeners (для их последующего удаления)
let eventListeners = {
    scroll: null,
    resize: null,
    cards: []
};

// Функция очистки состояния
function cleanupParallax() {
    // Останавливаем анимацию
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    
    // Удаляем event listeners
    if (eventListeners.scroll) {
        window.removeEventListener('scroll', eventListeners.scroll, { passive: true });
        eventListeners.scroll = null;
    }
    
    if (eventListeners.resize) {
        window.removeEventListener('resize', eventListeners.resize, { passive: true });
        eventListeners.resize = null;
    }
    
    // Удаляем listeners с карточек
    eventListeners.cards.forEach(({ card, mousemove, mouseleave }) => {
        card.removeEventListener('mousemove', mousemove);
        card.removeEventListener('mouseleave', mouseleave);
    });
    eventListeners.cards = [];
    
    // Очищаем состояние элементов
    parallaxElements = {
        hero: null,
        catalogHeader: null,
        sections: [],
        cards: [],
        catalogGrid: null
    };
    
    // Сбрасываем значения
    currentValues = {
        heroOffset: 0,
        catalogHeaderOffset: 0,
        sectionOffsets: {}
    };
    
    targetValues = {
        heroOffset: 0,
        catalogHeaderOffset: 0,
        sectionOffsets: {}
    };
    
    isScrolling = false;
}

function initParallax() {
    // Очищаем предыдущее состояние перед инициализацией
    cleanupParallax();
    // Параллакс для hero секции
    const hero = document.querySelector('.hero');
    if (hero) {
        parallaxElements.hero = hero.querySelector('.hero-frame');
        // Добавляем CSS transition для плавности
        if (parallaxElements.hero) {
            parallaxElements.hero.style.transition = 'transform 0.1s ease-out';
            parallaxElements.hero.style.willChange = 'transform';
        }
    }
    
    // Параллакс для catalog-header секции
    const catalogHeader = document.querySelector('.catalog-header');
    if (catalogHeader) {
        parallaxElements.catalogHeader = catalogHeader.querySelector('.catalog-header-frame');
        // Добавляем CSS transition для плавности
        if (parallaxElements.catalogHeader) {
            parallaxElements.catalogHeader.style.transition = 'transform 0.1s ease-out';
            parallaxElements.catalogHeader.style.willChange = 'transform';
        }
    }
    
    // Параллакс для секций
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        if (index % 2 === 0) {
            const title = section.querySelector('.section-title');
            if (title) {
                // Добавляем CSS transition для плавности
                title.style.transition = 'transform 0.1s ease-out';
                title.style.willChange = 'transform';
                parallaxElements.sections.push({ 
                    section, 
                    title,
                    id: `section-${index}`
                });
                currentValues.sectionOffsets[`section-${index}`] = 0;
                targetValues.sectionOffsets[`section-${index}`] = 0;
            }
        }
    });
    
    // Параллакс для карточек (3D эффект при наведении)
    // Только для карточек на главной странице, не для каталога
    const cards = document.querySelectorAll('.card');
    const catalogGrid = document.getElementById('catalogGrid');
    
    cards.forEach(card => {
        // Пропускаем карточки каталога (они обрабатываются отдельно)
        if (catalogGrid && catalogGrid.contains(card)) {
            return;
        }
        
        // Отключаем 3D эффект на мобильных устройствах
        if (window.innerWidth <= 1024) return;
        
        const mousemoveHandler = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Более мягкие значения для 3D эффекта
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            card.style.transition = 'transform 0.1s ease-out';
        };
        
        const mouseleaveHandler = () => {
            card.style.transition = 'transform 0.3s ease-out';
            card.style.transform = '';
        };
        
        card.addEventListener('mousemove', mousemoveHandler);
        card.addEventListener('mouseleave', mouseleaveHandler);
        
        // Сохраняем ссылки для последующего удаления
        eventListeners.cards.push({
            card,
            mousemove: mousemoveHandler,
            mouseleave: mouseleaveHandler
        });
    });
    
    // Параллакс скроллинг для каталога
    if (catalogGrid) {
        parallaxElements.catalogGrid = catalogGrid;
    }
    
    // Функция обновления параллакс эффектов
    function updateParallax() {
        const scrolled = window.pageYOffset || window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Hero параллакс (более мягкий коэффициент)
        if (parallaxElements.hero && document.contains(parallaxElements.hero)) {
            const hero = document.querySelector('.hero');
            if (hero && document.contains(hero)) {
                const heroRect = hero.getBoundingClientRect();
                if (heroRect.bottom > 0 && heroRect.top < windowHeight) {
                    // Более плавный расчет прогресса с easing
                    const progress = Math.max(0, Math.min(1, -heroRect.top / (heroRect.height * 0.6)));
                    const easedProgress = easeOutCubic(progress);
                    // Уменьшенный коэффициент для более тонкого эффекта
                    targetValues.heroOffset = scrolled * 0.15 * easedProgress;
                } else if (heroRect.bottom <= 0) {
                    targetValues.heroOffset = 0;
                }
            } else {
                targetValues.heroOffset = 0;
            }
        } else {
            targetValues.heroOffset = 0;
        }
        
        // Catalog-header параллакс (аналогично hero)
        if (parallaxElements.catalogHeader && document.contains(parallaxElements.catalogHeader)) {
            const catalogHeader = document.querySelector('.catalog-header');
            if (catalogHeader && document.contains(catalogHeader)) {
                const catalogHeaderRect = catalogHeader.getBoundingClientRect();
                if (catalogHeaderRect.bottom > 0 && catalogHeaderRect.top < windowHeight) {
                    // Более плавный расчет прогресса с easing
                    const progress = Math.max(0, Math.min(1, -catalogHeaderRect.top / (catalogHeaderRect.height * 0.6)));
                    const easedProgress = easeOutCubic(progress);
                    // Уменьшенный коэффициент для более тонкого эффекта
                    targetValues.catalogHeaderOffset = scrolled * 0.15 * easedProgress;
                } else if (catalogHeaderRect.bottom <= 0) {
                    targetValues.catalogHeaderOffset = 0;
                }
            } else {
                targetValues.catalogHeaderOffset = 0;
            }
        } else {
            targetValues.catalogHeaderOffset = 0;
        }
        
        // Секции параллакс (более мягкий) - фильтруем удаленные элементы
        parallaxElements.sections = parallaxElements.sections.filter(({ section, title }) => {
            return section && title && document.contains(section) && document.contains(title);
        });
        
        parallaxElements.sections.forEach(({ section, title, id }) => {
            if (section && title && document.contains(section) && document.contains(title)) {
                const rect = section.getBoundingClientRect();
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // Более плавный расчет с easing
                    const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 1.8)));
                    const easedProgress = easeInOutQuad(progress);
                    // Уменьшенное смещение для более тонкого эффекта
                    targetValues.sectionOffsets[id] = (easedProgress - 0.5) * 20;
                } else {
                    targetValues.sectionOffsets[id] = 0;
                }
            }
        });
        
        // Каталог параллакс (только если это страница каталога)
        if (parallaxElements.catalogGrid && document.contains(parallaxElements.catalogGrid)) {
            const gridItems = parallaxElements.catalogGrid.querySelectorAll('.card');
            gridItems.forEach((item, index) => {
                if (!item.matches(':hover')) {
                    const delay = index * 0.1;
                    // Более мягкая анимация
                    const offset = Math.sin((scrolled * 0.0008) + delay) * 8;
                    item.style.transform = `translateY(${offset}px)`;
                    item.style.transition = 'transform 0.2s ease-out';
                }
            });
        }
    }
    
    // Плавная интерполяция значений
    function animate() {
        isAnimating = true;
        
        // Проверяем, что элементы все еще в DOM
        if (parallaxElements.hero && !document.contains(parallaxElements.hero)) {
            parallaxElements.hero = null;
        }
        
        if (parallaxElements.catalogHeader && !document.contains(parallaxElements.catalogHeader)) {
            parallaxElements.catalogHeader = null;
        }
        
        let hasChanges = false;
        
        // Интерполяция hero
        const newHeroOffset = lerp(currentValues.heroOffset, targetValues.heroOffset, 0.1);
        if (Math.abs(newHeroOffset - currentValues.heroOffset) > 0.01) {
            hasChanges = true;
            currentValues.heroOffset = newHeroOffset;
            if (parallaxElements.hero && document.contains(parallaxElements.hero)) {
                parallaxElements.hero.style.transform = `translateY(${currentValues.heroOffset}px)`;
            }
        }
        
        // Интерполяция catalog-header
        const newCatalogHeaderOffset = lerp(currentValues.catalogHeaderOffset, targetValues.catalogHeaderOffset, 0.1);
        if (Math.abs(newCatalogHeaderOffset - currentValues.catalogHeaderOffset) > 0.01) {
            hasChanges = true;
            currentValues.catalogHeaderOffset = newCatalogHeaderOffset;
            if (parallaxElements.catalogHeader && document.contains(parallaxElements.catalogHeader)) {
                parallaxElements.catalogHeader.style.transform = `translateY(${currentValues.catalogHeaderOffset}px)`;
            }
        }
        
        // Интерполяция секций (фильтруем удаленные элементы)
        parallaxElements.sections = parallaxElements.sections.filter(({ title }) => {
            return title && document.contains(title);
        });
        
        parallaxElements.sections.forEach(({ title, id }) => {
            if (title && document.contains(title)) {
                const newOffset = lerp(
                    currentValues.sectionOffsets[id] || 0, 
                    targetValues.sectionOffsets[id] || 0, 
                    0.1
                );
                if (Math.abs(newOffset - (currentValues.sectionOffsets[id] || 0)) > 0.01) {
                    hasChanges = true;
                    currentValues.sectionOffsets[id] = newOffset;
                    title.style.transform = `translateY(${currentValues.sectionOffsets[id]}px)`;
                }
            }
        });
        
        // Продолжаем анимацию только если есть изменения или идет скролл
        if (hasChanges || isScrolling) {
            rafId = requestAnimationFrame(animate);
        } else {
            rafId = null;
            isAnimating = false;
        }
    }
    
    // Обработчик скролла с throttle
    const handleScrollThrottled = throttle(() => {
        updateParallax();
    }, 16); // ~60fps
    
    function handleScroll() {
        if (!isScrolling) {
            isScrolling = true;
            if (!isAnimating && !rafId) {
                animate();
            }
        }
        handleScrollThrottled();
        
        // Останавливаем анимацию через некоторое время после остановки скролла
        clearTimeout(handleScroll.timeout);
        handleScroll.timeout = setTimeout(() => {
            isScrolling = false;
        }, 150);
    }
    
    // Инициализация начальных значений
    updateParallax();
    
    // Запускаем анимацию
    animate();
    
    // Сохраняем ссылки на обработчики для последующего удаления
    eventListeners.scroll = handleScroll;
    eventListeners.resize = throttle(() => {
        updateParallax();
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Обработка изменения размера окна
    window.addEventListener('resize', eventListeners.resize, { passive: true });
}

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', cleanupParallax);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initParallax);
