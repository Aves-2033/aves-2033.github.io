// ============================================================
// index-preview.js — Превью карточек на главной странице (ES Module)
// Зависит от shared.js
// ============================================================

import {
    state,
    cleanupModalHandlers,
    setupModal,
    renderModalContent,
    setNavigateModal,
} from './shared.js';

// Данные о товарах для превью (переданы из Astro через is:inline)
const previewProducts = window.__previewProducts || [];

// Открытие модального окна (главная)
function openModal(index) {
    state.previousActiveElement = document.activeElement;
    cleanupModalHandlers();

    state.currentProductIndex = index;
    state.currentImageIndex = 0;
    const product = previewProducts[index];

    if (!product) return;

    const modal = document.getElementById('productModal');
    if (!modal) return;

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const navHTML = `
        <button class="modal-nav-btn" id="prevBtn" ${index === 0 ? 'disabled' : ''} aria-label="Предыдущий товар">
            ← Предыдущее
        </button>
        <a href="/catalog" class="modal-nav-btn btn-contact" style="text-decoration: none;">В каталог</a>
        <button class="modal-nav-btn" id="nextBtn" ${index === previewProducts.length - 1 ? 'disabled' : ''} aria-label="Следующий товар">
            Следующее →
        </button>
    `;

    renderModalContent(product, index, previewProducts, navHTML);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();
}

// Навигация в модальном окне (главная)
function navigateModal(direction) {
    const newIndex = state.currentProductIndex + direction;
    if (newIndex >= 0 && newIndex < previewProducts.length) {
        state.currentProductIndex = newIndex;
        openModal(newIndex);
    }
}

// Инициализация превью
function initPreview() {
    const cards = document.querySelectorAll('.catalog-preview .card');

    setupModal();
    setNavigateModal(navigateModal);

    cards.forEach((card) => {
        const cardTitle = card.querySelector('.card-title');
        if (!cardTitle) return;

        const titleText = cardTitle.textContent.trim();
        const productIndex = previewProducts.findIndex(p => p.title === titleText);

        if (productIndex !== -1) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-text')) return;
                e.preventDefault();
                openModal(productIndex);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initPreview);
