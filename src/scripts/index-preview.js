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
    handleShare,
} from './shared.js';

// Данные о товарах для превью (переданы из Astro через is:inline)
let previewProducts = window.__previewProducts || [];
const allEligibleProducts = window.__allEligibleProducts || [];

function shuffle(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function renderDynamicCards(products) {
    const grid = document.querySelector('.catalog-preview .cards-grid');
    if (!grid) return;

    grid.innerHTML = products.map((product, i) => {
        const primaryImage = Array.isArray(product.images) ? product.images[0] : (product.image || "");
        const optimizedImage = primaryImage.includes('/upload/') 
            ? primaryImage.replace('/upload/', '/upload/f_auto,q_auto,w_500/') 
            : primaryImage;
        
        const formattedPrice = product.price != null 
            ? product.price.toLocaleString('ru-RU') + ' ₽' 
            : 'Нет данных';

        return `
          <article class="card" data-preview-index="${i}">
            <div class="card-image">
              <a href="/product/${product.slug}" class="image-seo-link" tabindex="-1" aria-hidden="true">
                <img
                  src="${optimizedImage}"
                  alt="${product.title}"
                  loading="lazy"
                  width="400"
                  height="500"
                />
              </a>
            </div>
            <div class="card-body">
              <h3 class="card-title">
                <a href="/product/${product.slug}" class="seo-link">${product.title}</a>
              </h3>
              <p class="card-price">${formattedPrice}</p>
              <div class="card-actions">
                <a href="/product/${product.slug}" class="btn-text">Подробнее &rarr;</a>
                <button class="btn-card-share" data-slug="${product.slug}" data-title="${product.title}" aria-label="Поделиться">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                  </svg>
                </button>
              </div>
            </div>
          </article>
        `;
    }).join('');
}

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
        <a href="/catalog?product=${product.slug}" class="modal-nav-btn btn-contact" style="text-decoration: none;">В каталог</a>
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
    // Рандомизация перед отрисовкой
    if (allEligibleProducts.length >= 6) {
        const random6 = shuffle(allEligibleProducts).slice(0, 6);
        previewProducts = random6;
        renderDynamicCards(random6);
    }

    const cards = document.querySelectorAll('.catalog-preview .card');

    setupModal();
    setNavigateModal(navigateModal);

    cards.forEach((card, domIndex) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const isImageLink = e.target.closest('a.image-seo-link');
            const isTitleLink = e.target.closest('a.seo-link');
            const isBtnText = e.target.closest('.btn-text');
            const isShareBtn = e.target.closest('.btn-card-share');

            if (isShareBtn) {
                const slug = isShareBtn.dataset.slug;
                const title = isShareBtn.dataset.title;
                handleShare(title, slug, e);
                return;
            }

            if (isImageLink) {
                e.preventDefault(); // intercept and open modal
            } else if (isTitleLink || isBtnText) {
                return; // let browser follow the link to the product
            }

            e.preventDefault();
            openModal(domIndex);
        });
    });
}

document.addEventListener('DOMContentLoaded', initPreview);
