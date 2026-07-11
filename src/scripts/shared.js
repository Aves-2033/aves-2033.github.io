// ============================================================
// shared.js — Общие утилиты и модальные окна (ES Module)
// Используется на всех страницах сайта
// ============================================================

const APP_VERSION = '2026.07.11.2319';

// --- Проверка версии и очистка кэша при обновлении ---
(function() {
    try {
        const storedVersion = localStorage.getItem('aves_app_version');
        const isTelegram = /Telegram/i.test(navigator.userAgent);
        
        if (storedVersion !== APP_VERSION) {
            localStorage.removeItem('prokat_ket_products');
            localStorage.setItem('aves_app_version', APP_VERSION);
            
            if (isTelegram) {
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

// --- History API: закрытие модалки свайпом «назад» на мобильных ---
let _popstateHandlerRegistered = false;

function _registerPopstateHandler() {
    if (_popstateHandlerRegistered) return;
    _popstateHandlerRegistered = true;
    window.addEventListener('popstate', (e) => {
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('active')) {
            // Закрываем модалку без дополнительного history.back()
            _closeModalInternal();
        }
    });
}

// Внутреннее закрытие без вызова history.back()
function _closeModalInternal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    cleanupModalHandlers();
    if (state.previousActiveElement && typeof state.previousActiveElement.focus === 'function') {
        state.previousActiveElement.focus();
    }
    state.previousActiveElement = null;
}

// Кастомная функция навигации в модалке (переопределяется на каждой странице)
let _navigateModalFn = () => {};
export function setNavigateModal(fn) { _navigateModalFn = fn; }

// --- Утилиты ---

export function showToast(message) {
    const oldToast = document.querySelector('.share-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    toast.offsetWidth; // force reflow
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

export function handleShare(title, slug, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const shareUrl = `${window.location.origin}/product/${slug}?utm_source=share&utm_medium=web`;
    const shareText = `Аренда платья "${title}" в Москве — Прокат от Кет`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (isMobile && navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Share canceled or failed:', err));
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Ссылка скопирована!');
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    }
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
    // Если в истории есть наша модальная запись — убираем её
    if (history.state && history.state.modal === true) {
        history.back();
        // popstate сам вызовет _closeModalInternal()
    } else {
        _closeModalInternal();
    }
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

    // Регистрируем обработчик popstate (один раз для всей страницы)
    _registerPopstateHandler();
}

// --- Общая генерация HTML модального окна ---

export function renderModalContent(product, index, productsArray, navHTML) {
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    let baseImages = product.images && Array.isArray(product.images)
        ? product.images
        : [product.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22600%22%20viewBox%3D%220%200%20400%20600%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22serif%22%20font-size%3D%2224%22%20fill%3D%22%23999%22%20text-anchor%3D%22middle%22%3EAvesWeb%3C%2Ftext%3E%3C%2Fsvg%3E'];
        
    const images = baseImages.map(img => 
        (typeof img === 'string' && img.includes('/upload/'))
            ? img.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
            : img
    );
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

    const shareUrl = `${window.location.origin}/product/${product.slug}?utm_source=share&utm_medium=web`;
    const shareText = `Аренда платья "${product.title}" в Москве — Прокат от Кет`;

    modalBody.innerHTML = `
        <div class="modal-gallery">
            ${thumbnailsHTML}
            <div class="modal-image loading">
                <img src="${images[0]}" alt="${escapeHtml(product.title)}" class="loading" decoding="async">
            </div>
        </div>
        <div class="modal-info">
            <h2 id="modal-title">${escapeHtml(product.title)}</h2>
            <p class="modal-price">${product.price != null ? product.price.toLocaleString('ru-RU') + '\u00a0₽' : 'Нет данных'}</p>
            <p class="modal-description">${escapeHtml(product.description)}</p>
            <ul class="modal-details">
                ${product.details ? Object.entries(product.details).map(([key, value]) =>
                    `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`
                ).join('') : ''}
            </ul>
            
            <div class="modal-share-container">
                <button class="btn-share" id="modalShareBtn" aria-label="Поделиться">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                    </svg>
                    Поделиться
                </button>
                <div class="share-dropdown" id="shareDropdown">
                    <a href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}" class="share-option tg" target="_blank" rel="noopener">
                        <span class="share-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"/></svg>
                        </span> Telegram
                    </a>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}" class="share-option wa" target="_blank" rel="noopener">
                        <span class="share-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </span> WhatsApp
                    </a>
                    <a href="https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}" class="share-option vk" target="_blank" rel="noopener">
                        <span class="share-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M31.5 63.4C0 94.9 0 145.7 0 247.3v17.4C0 366.3 0 417.1 31.5 448.6 63 480 113.8 480 215.4 480h17.3c101.6 0 152.4 0 183.9-31.4C448 417.1 448 366.3 448 264.7v-17.4C448 145.7 448 94.9 416.5 63.4 385 32 334.2 32 232.6 32h-17.3C113.8 32 63 32 31.5 63.4zM75.7 183.7h38.1c1.9 84.4 39.7 121 69.3 128.4V183.7H219v73.5c29.2-3.2 59.7-36 70.1-73.5h36c-8 46.5-41.3 79.4-64.4 92.6 23.2 11 60.9 39.8 73.7 80h-39.2c-10.2-30.7-36.6-56.7-76.1-60.6v60.6h-4.3c-100.9 0-156.5-65-139-173z"/></svg>
                        </span> ВКонтакте
                    </a>
                    <button class="share-option copy-link" id="modalCopyLinkBtn">
                        <span class="share-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2ZM6 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>
                        </span> Копировать ссылку
                    </button>
                </div>
            </div>
            <div class="share-dropdown-backdrop" id="shareDropdownBackdrop"></div>

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

    // Логика кнопки «Поделиться»
    const modalShareBtn = document.getElementById('modalShareBtn');
    const shareDropdown = document.getElementById('shareDropdown');
    const shareDropdownBackdrop = document.getElementById('shareDropdownBackdrop');
    const modalCopyLinkBtn = document.getElementById('modalCopyLinkBtn');

    if (modalShareBtn && shareDropdown) {
        modalShareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            if (isMobile && navigator.share) {
                navigator.share({
                    title: product.title,
                    text: shareText,
                    url: shareUrl
                }).catch(err => console.log('Share canceled or failed:', err));
            } else {
                shareDropdown.classList.toggle('active');
                if (shareDropdownBackdrop) shareDropdownBackdrop.classList.toggle('active');
            }
        });
    }

    if (modalCopyLinkBtn) {
        modalCopyLinkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('Ссылка скопирована!');
                if (shareDropdown) shareDropdown.classList.remove('active');
                if (shareDropdownBackdrop) shareDropdownBackdrop.classList.remove('active');
            }).catch(err => console.error('Copy failed:', err));
        });
    }

    if (shareDropdownBackdrop) {
        shareDropdownBackdrop.addEventListener('click', () => {
            if (shareDropdown) shareDropdown.classList.remove('active');
            shareDropdownBackdrop.classList.remove('active');
        });
    }

    if (shareDropdown) {
        shareDropdown.querySelectorAll('.share-option').forEach(link => {
            if (link.id !== 'modalCopyLinkBtn') {
                link.addEventListener('click', () => {
                    shareDropdown.classList.remove('active');
                    if (shareDropdownBackdrop) shareDropdownBackdrop.classList.remove('active');
                });
            }
        });
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
                
                document.body.style.overflow = '';
            }
        });
    });
});
