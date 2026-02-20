// ============================================================
// shared.js — Общие утилиты и модальные окна (ES Module)
// Используется на всех страницах сайта
// ============================================================

const APP_VERSION = '2026.02.20.1';

// --- Проверка версии и очистка кэша при обновлении ---
(function() {
    try {
        const storedVersion = localStorage.getItem('aves_app_version');
        const isTelegram = /Telegram/i.test(navigator.userAgent);
        
        if (storedVersion !== APP_VERSION) {
            console.log('Detected version mismatch. Clearing old cache...');
            localStorage.removeItem('prokat_ket_products');
            localStorage.setItem('aves_app_version', APP_VERSION);
            
            if (isTelegram) {
                console.log('Telegram browser detected. Forcing hard reload...');
                location.reload(true);
                return;
            }
        }
    } catch (e) {
        console.warn('LocalStorage version check failed:', e);
    }
})();


// --- Автообновление года в copyright ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Components !== 'undefined') {
        Components.render();
    }
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// --- Shared state ---
export const state = {
    currentImageIndex: 0,
    currentProductIndex: 0,
    previousActiveElement: null,
    currentLightboxIndex: 0,
    currentLightboxImages: [],
};

// Кастомная функция навигации в модалке (переопределяется на каждой странице)
let _navigateModalFn = () => {};
export function setNavigateModal(fn) { _navigateModalFn = fn; }

// --- Утилиты ---

export function getProductImage(product, index = 0) {
    if (product.images && Array.isArray(product.images)) {
        return product.images[index] || product.images[0];
    }
    if (product.image) {
        return product.image;
    }
    return 'img/placeholder.jpg';
}

export function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Хранилище обработчиков событий ---
const eventHandlers = {
    modalKeyboard: null,
    lightboxKeyboard: null,
    lightboxWheel: null,
    lightboxClose: null,
    lightboxBackground: null,
    lightboxPrev: null,
    lightboxNext: null,
    modalImageLoad: null,
    modalImageError: null,
    modalImageClick: null,
    prevBtn: null,
    nextBtn: null,
    contactModalKeyboard: null,
    contactModalClose: null,
    contactModalBackground: null,
    modalImageMouseMove: null,
    modalImageMouseLeave: null,
    modalImageMouseEnter: null,
    modalGalleryTouchStart: null,
    modalGalleryTouchMove: null,
    modalGalleryTouchEnd: null
};

// --- Очистка обработчиков ---

export function cleanupModalHandlers() {
    if (eventHandlers.modalKeyboard) {
        document.removeEventListener('keydown', eventHandlers.modalKeyboard);
        eventHandlers.modalKeyboard = null;
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn && eventHandlers.prevBtn) {
        prevBtn.removeEventListener('click', eventHandlers.prevBtn);
        eventHandlers.prevBtn = null;
    }

    if (nextBtn && eventHandlers.nextBtn) {
        nextBtn.removeEventListener('click', eventHandlers.nextBtn);
        eventHandlers.nextBtn = null;
    }

    if (eventHandlers.modalImageLoad) {
        const modalImage = document.querySelector('#modalBody .modal-image img');
        if (modalImage) {
            modalImage.removeEventListener('load', eventHandlers.modalImageLoad);
            modalImage.removeEventListener('error', eventHandlers.modalImageError);
        }
        eventHandlers.modalImageLoad = null;
        eventHandlers.modalImageError = null;
    }

    if (eventHandlers.modalImageClick) {
        const modalImageContainer = document.querySelector('#modalBody .modal-image');
        if (modalImageContainer) {
            modalImageContainer.removeEventListener('click', eventHandlers.modalImageClick);
            modalImageContainer.removeEventListener('mousemove', eventHandlers.modalImageMouseMove);
            modalImageContainer.removeEventListener('mouseleave', eventHandlers.modalImageMouseLeave);
            modalImageContainer.removeEventListener('mouseenter', eventHandlers.modalImageMouseEnter);
            
            if (eventHandlers.modalGalleryTouchStart) {
                modalImageContainer.removeEventListener('touchstart', eventHandlers.modalGalleryTouchStart);
                modalImageContainer.removeEventListener('touchmove', eventHandlers.modalGalleryTouchMove);
                modalImageContainer.removeEventListener('touchend', eventHandlers.modalGalleryTouchEnd);
            }
        }
        eventHandlers.modalImageClick = null;
        eventHandlers.modalImageMouseMove = null;
        eventHandlers.modalImageMouseLeave = null;
        eventHandlers.modalImageMouseEnter = null;
        eventHandlers.modalGalleryTouchStart = null;
        eventHandlers.modalGalleryTouchMove = null;
        eventHandlers.modalGalleryTouchEnd = null;
    }
}

function cleanupLightboxHandlers() {
    if (eventHandlers.lightboxKeyboard) {
        document.removeEventListener('keydown', eventHandlers.lightboxKeyboard);
        eventHandlers.lightboxKeyboard = null;
    }

    if (eventHandlers.lightboxClose) {
        const lightboxClose = document.getElementById('lightboxClose');
        if (lightboxClose) {
            lightboxClose.removeEventListener('click', eventHandlers.lightboxClose);
        }
        eventHandlers.lightboxClose = null;
    }

    if (eventHandlers.lightboxBackground) {
        const lightboxModal = document.getElementById('lightboxModal');
        if (lightboxModal) {
            lightboxModal.removeEventListener('click', eventHandlers.lightboxBackground);
            lightboxModal.removeEventListener('wheel', eventHandlers.lightboxWheel);
            
            const prevBtn = document.getElementById('lightboxPrev');
            const nextBtn = document.getElementById('lightboxNext');
            if (prevBtn) prevBtn.remove();
            if (nextBtn) nextBtn.remove();
        }
        eventHandlers.lightboxBackground = null;
        eventHandlers.lightboxWheel = null;
        eventHandlers.lightboxPrev = null;
        eventHandlers.lightboxNext = null;
        eventHandlers.lightboxTouchStart = null;
        eventHandlers.lightboxTouchMove = null;
        eventHandlers.lightboxTouchEnd = null;
    }

    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        if (eventHandlers.lightboxTouchStart) {
            lightboxModal.removeEventListener('touchstart', eventHandlers.lightboxTouchStart);
        }
        if (eventHandlers.lightboxTouchMove) {
            lightboxModal.removeEventListener('touchmove', eventHandlers.lightboxTouchMove);
        }
        if (eventHandlers.lightboxTouchEnd) {
            lightboxModal.removeEventListener('touchend', eventHandlers.lightboxTouchEnd);
        }
    }
    
    eventHandlers.lightboxTouchStart = null;
    eventHandlers.lightboxTouchMove = null;
    eventHandlers.lightboxTouchEnd = null;
}

function cleanupContactModalHandlers() {
    if (eventHandlers.contactModalClose) {
        const contactCloseBtn = document.getElementById('contactModalClose');
        const contactModal = document.getElementById('contactModal');
        if (contactCloseBtn) contactCloseBtn.removeEventListener('click', eventHandlers.contactModalClose);
        if (contactModal) contactModal.removeEventListener('click', eventHandlers.contactModalBackground);
        document.removeEventListener('keydown', eventHandlers.contactModalKeyboard);

        eventHandlers.contactModalClose = null;
        eventHandlers.contactModalBackground = null;
        eventHandlers.contactModalKeyboard = null;
    }
}

// --- Модальное окно контактов ---

export function openContactModal() {
    const contactModal = document.getElementById('contactModal');
    const contactCloseBtn = document.getElementById('contactModalClose');

    if (!contactModal) return;

    contactModal.classList.add('active');

    const closeContact = () => {
        contactModal.classList.remove('active');
        cleanupContactModalHandlers();
    };

    eventHandlers.contactModalClose = closeContact;
    eventHandlers.contactModalBackground = (e) => {
        if (e.target === contactModal) closeContact();
    };
    eventHandlers.contactModalKeyboard = (e) => {
        if (e.key === 'Escape') closeContact();
    };

    if (contactCloseBtn) contactCloseBtn.addEventListener('click', eventHandlers.contactModalClose);
    contactModal.addEventListener('click', eventHandlers.contactModalBackground);
    document.addEventListener('keydown', eventHandlers.contactModalKeyboard);

    if (contactCloseBtn) contactCloseBtn.focus();
}

// --- Lightbox (полноэкранный просмотр) ---

function openLightbox(index, imageList, imageAlt) {
    cleanupLightboxHandlers();

    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');

    if (!lightboxModal || !lightboxImage) return;

    if (!Array.isArray(imageList)) {
        imageList = [imageList || index];
        index = 0;
    }

    state.currentLightboxImages = imageList;
    state.currentLightboxIndex = index;

    lightboxImage.src = state.currentLightboxImages[state.currentLightboxIndex];
    lightboxImage.alt = imageAlt || 'Изображение';

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('role', 'dialog');
    lightboxModal.setAttribute('aria-modal', 'true');
    lightboxModal.setAttribute('aria-label', 'Полноэкранный просмотр изображения');
    document.body.style.overflow = 'hidden';

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        cleanupLightboxHandlers();
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('active')) {
            modal.focus();
        }
    };

    function navigateLightbox(direction) {
        if (!state.currentLightboxImages || state.currentLightboxImages.length <= 1) return;

        let newIndex = state.currentLightboxIndex + direction;
        
        if (newIndex < 0) newIndex = state.currentLightboxImages.length - 1;
        if (newIndex >= state.currentLightboxImages.length) newIndex = 0;

        state.currentLightboxIndex = newIndex;
        const lightboxImage = document.getElementById('lightboxImage');
        if (lightboxImage) {
            lightboxImage.style.opacity = '0.5';
            setTimeout(() => {
                lightboxImage.src = state.currentLightboxImages[newIndex];
                lightboxImage.style.opacity = '1';
            }, 100);
        }
    }

    eventHandlers.lightboxKeyboard = (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    };

    eventHandlers.lightboxWheel = (e) => {
        e.preventDefault();
        if (e.deltaY > 0) navigateLightbox(1);
        else navigateLightbox(-1);
    };

    eventHandlers.lightboxBackground = (e) => {
        if (e.target === lightboxModal) closeLightbox();
    };

    eventHandlers.lightboxClose = closeLightbox;

    if (lightboxClose) lightboxClose.addEventListener('click', eventHandlers.lightboxClose);
    lightboxModal.addEventListener('click', eventHandlers.lightboxBackground);
    lightboxModal.addEventListener('wheel', eventHandlers.lightboxWheel, { passive: false });
    document.addEventListener('keydown', eventHandlers.lightboxKeyboard);

    // Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    eventHandlers.lightboxTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
    };

    eventHandlers.lightboxTouchMove = (e) => {
        touchEndX = e.changedTouches[0].screenX;
    };

    eventHandlers.lightboxTouchEnd = (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            navigateLightbox(1);
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            navigateLightbox(-1);
        }
    };

    lightboxModal.addEventListener('touchstart', eventHandlers.lightboxTouchStart, { passive: true });
    lightboxModal.addEventListener('touchmove', eventHandlers.lightboxTouchMove, { passive: true });
    lightboxModal.addEventListener('touchend', eventHandlers.lightboxTouchEnd, { passive: true });

    // Navigation Controls for multiple images
    if (imageList.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox-nav-btn prev';
        prevBtn.id = 'lightboxPrev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.onclick = (e) => { e.stopPropagation(); navigateLightbox(-1); };
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox-nav-btn next';
        nextBtn.id = 'lightboxNext';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.onclick = (e) => { e.stopPropagation(); navigateLightbox(1); };

        lightboxModal.appendChild(prevBtn);
        lightboxModal.appendChild(nextBtn);
    }

    if (lightboxClose) lightboxClose.focus();
}

// --- Переключение изображений в галерее ---

function switchImage(newIndex, images, modalImage, thumbnails) {
    if (newIndex === state.currentImageIndex) return;

    state.currentImageIndex = newIndex;

    thumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === newIndex);
    });

    modalImage.style.opacity = '0';

    setTimeout(() => {
        modalImage.src = images[newIndex];
        modalImage.style.opacity = '1';
    }, 150);
}

// --- Закрытие модального окна ---

export function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    cleanupModalHandlers();

    if (state.previousActiveElement && typeof state.previousActiveElement.focus === 'function') {
        state.previousActiveElement.focus();
    }
    state.previousActiveElement = null;
}

// --- Клавиатурная навигация в модальном окне ---

function handleModalKeyboard(e) {
    const modal = document.getElementById('productModal');
    const lightbox = document.getElementById('lightboxModal');
    
    if (lightbox && lightbox.classList.contains('active')) return;
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeModal();
    } else if (e.key === 'ArrowLeft') {
        _navigateModalFn(-1);
    } else if (e.key === 'ArrowRight') {
        _navigateModalFn(1);
    }
}

// --- Настройка модального окна ---

export function setupModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');

    if (!modal || !closeBtn) return;

    closeBtn.setAttribute('aria-label', 'Закрыть модальное окно');
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// --- Общая генерация HTML модального окна ---

export function renderModalContent(product, index, productsArray, navHTML) {
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    const images = product.images && Array.isArray(product.images)
        ? product.images
        : [product.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22600%22%20viewBox%3D%220%200%20400%20600%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22serif%22%20font-size%3D%2224%22%20fill%3D%22%23999%22%20text-anchor%3D%22middle%22%3EAvesWeb%3C%2Ftext%3E%3C%2Fsvg%3E'];
    const hasMultipleImages = images.length > 1;

    const thumbnailsHTML = hasMultipleImages ? `
        <div class="modal-thumbnails">
            ${images.map((img, idx) => `
                <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image-index="${idx}">
                    <img src="${img}" alt="${escapeHtml(product.title)} - фото ${idx + 1}" loading="lazy">
                </div>
            `).join('')}
        </div>
    ` : '';

    modalBody.innerHTML = `
        <div class="modal-gallery">
            ${thumbnailsHTML}
            <div class="modal-image loading">
                <img src="${images[0]}" alt="${escapeHtml(product.title)}" class="loading" decoding="async">
            </div>
        </div>
        <div class="modal-info">
            <h2 id="modal-title">${escapeHtml(product.title)}</h2>
            <p class="modal-price">${product.price.toLocaleString('ru-RU')} ₽</p>
            <p class="modal-description">${escapeHtml(product.description)}</p>
            <ul class="modal-details">
                ${product.details ? Object.entries(product.details).map(([key, value]) =>
                    `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`
                ).join('') : ''}
            </ul>
            <div class="modal-nav">
                ${navHTML}
            </div>
        </div>
    `;

    const modalImageContainer = modalBody.querySelector('.modal-image');
    const modalImage = modalBody.querySelector('.modal-image img');

    if (modalImage) {
        if (modalImage.complete && modalImage.naturalHeight !== 0) {
            modalImage.classList.remove('loading');
            modalImage.classList.add('loaded');
            modalImageContainer.classList.remove('loading');
        } else {
            eventHandlers.modalImageLoad = () => {
                modalImage.classList.remove('loading');
                modalImage.classList.add('loaded');
                modalImageContainer.classList.remove('loading');
            };

            eventHandlers.modalImageError = () => {
                modalImageContainer.classList.remove('loading');
                modalImage.style.display = 'none';
                console.error('Ошибка загрузки изображения:', images[0]);
            };

            modalImage.addEventListener('load', eventHandlers.modalImageLoad);
            modalImage.addEventListener('error', eventHandlers.modalImageError);
        }

        eventHandlers.modalImageClick = (e) => {
            e.stopPropagation();
            openLightbox(state.currentImageIndex, images, product.title);
        };
        modalImageContainer.addEventListener('click', eventHandlers.modalImageClick);
        modalImageContainer.setAttribute('role', 'button');
        modalImageContainer.setAttribute('tabindex', '0');
        modalImageContainer.setAttribute('aria-label', 'Увеличить изображение');

        // Эффект панорамирования
        eventHandlers.modalImageMouseMove = (e) => {
            const rect = modalImageContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            modalImage.style.objectPosition = `${x}% ${y}%`;
        };
        modalImageContainer.addEventListener('mousemove', eventHandlers.modalImageMouseMove);
        
        eventHandlers.modalImageMouseLeave = () => {
            modalImage.style.transition = 'object-position 0.3s ease';
            modalImage.style.objectPosition = '50% 50%';
            setTimeout(() => {
                modalImage.style.transition = '';
            }, 300);
        };
        modalImageContainer.addEventListener('mouseleave', eventHandlers.modalImageMouseLeave);

        eventHandlers.modalImageMouseEnter = () => {
             modalImage.style.transition = 'none';
        };
        modalImageContainer.addEventListener('mouseenter', eventHandlers.modalImageMouseEnter);

        // Swipe Support for Modal Gallery
        if (hasMultipleImages) {
            let touchStartX = 0;
            let touchEndX = 0;

            eventHandlers.modalGalleryTouchStart = (e) => {
                touchStartX = e.changedTouches[0].screenX;
            };

            eventHandlers.modalGalleryTouchMove = (e) => {
                touchEndX = e.changedTouches[0].screenX;
            };

            eventHandlers.modalGalleryTouchEnd = () => {
                const swipeThreshold = 50;
                const thumbnails = modalBody.querySelectorAll('.thumbnail');
                
                if (touchEndX < touchStartX - swipeThreshold) {
                    let nextIdx = state.currentImageIndex + 1;
                    if (nextIdx >= images.length) nextIdx = 0;
                    switchImage(nextIdx, images, modalImage, thumbnails);
                } else if (touchEndX > touchStartX + swipeThreshold) {
                    let prevIdx = state.currentImageIndex - 1;
                    if (prevIdx < 0) prevIdx = images.length - 1;
                    switchImage(prevIdx, images, modalImage, thumbnails);
                }
            };

            modalImageContainer.addEventListener('touchstart', eventHandlers.modalGalleryTouchStart, { passive: true });
            modalImageContainer.addEventListener('touchmove', eventHandlers.modalGalleryTouchMove, { passive: true });
            modalImageContainer.addEventListener('touchend', eventHandlers.modalGalleryTouchEnd, { passive: true });
        }
    }

    // Миниатюры
    if (hasMultipleImages) {
        const thumbnails = modalBody.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, idx) => {
            thumb.addEventListener('click', () => switchImage(idx, images, modalImage, thumbnails));
        });
    }

    // Навигационные кнопки
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    eventHandlers.prevBtn = () => _navigateModalFn(-1);
    eventHandlers.nextBtn = () => _navigateModalFn(1);

    if (prevBtn) prevBtn.addEventListener('click', eventHandlers.prevBtn);
    if (nextBtn) nextBtn.addEventListener('click', eventHandlers.nextBtn);

    // Кнопка «Связаться»
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => openContactModal());
    }

    // Клавиатура
    eventHandlers.modalKeyboard = handleModalKeyboard;
    document.addEventListener('keydown', eventHandlers.modalKeyboard);
}

// --- Обработка Dropdowns ---
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.catalog-dropdown');

    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.btn');
        if (!btn) return;

        btn.addEventListener('click', (e) => {
            const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth <= 1024;

            if (isMobile) {
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.catalog-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupDropdowns();
    
    const contactLinks = document.querySelectorAll('.js-open-contacts');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
            
            const navContainer = document.getElementById('navContainer');
            const burgerBtn = document.getElementById('burgerBtn');
            
            if (navContainer && navContainer.classList.contains('open')) {
                navContainer.classList.remove('open');
                if (burgerBtn) burgerBtn.classList.remove('active');
                
                navContainer.style.visibility = 'hidden';
                navContainer.style.pointerEvents = 'none';
                navContainer.style.opacity = '0';
                document.body.style.overflow = '';
            }
        });
    });
});
