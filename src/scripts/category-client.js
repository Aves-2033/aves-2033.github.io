// ============================================================
// category-client.js — Клиентский JS для страниц отдельной категории (ES Module)
// Обеспечивает работу модального окна без лишней логики фильтрации
// ============================================================

import {
    state,
    cleanupModalHandlers,
    setupModal,
    renderModalContent,
    setNavigateModal,
} from './shared.js';

let products = [];
let allCards = [];

async function fetchProducts() {
    try {
        const response = await fetch('/data/products.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        products = await response.json();
        window.__catalogProducts = products;
    } catch (e) {
        console.error('Ошибка загрузки products.json:', e);
        products = [];
    }
}

function openCategoryModal(index) {
    if (!products.length) return;
    
    const product = products[index];
    if (!product) return;

    state.previousActiveElement = document.activeElement;
    cleanupModalHandlers();

    state.currentProductIndex = index;
    state.currentImageIndex = 0;

    const modal = document.getElementById('productModal');
    if (!modal) return;

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    // Find position of this card in the current DOM grid to calculate next/prev buttons
    const currentCard = allCards.find(c => parseInt(c.dataset.index) === index);
    const viewIndex = allCards.indexOf(currentCard);

    const prevDisabled = viewIndex <= 0;
    const nextDisabled = viewIndex === -1 || viewIndex === allCards.length - 1;

    const navHTML = `
        <button class="modal-nav-btn" id="prevBtn" ${prevDisabled ? 'disabled' : ''} aria-label="Предыдущий товар">
            ← Предыдущее
        </button>
        <button class="modal-nav-btn btn-contact js-open-contacts" id="contactBtn" aria-label="Связаться">Связаться</button>
        <button class="modal-nav-btn" id="nextBtn" ${nextDisabled ? 'disabled' : ''} aria-label="Следующий товар">
            Следующее →
        </button>
    `;

    renderModalContent(product, index, products, navHTML);

    if (!history.state || history.state.modal !== true) {
        history.pushState({ modal: true }, '');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();
}

function navigateCategoryModal(direction) {
    const currentCard = allCards.find(c => parseInt(c.dataset.index) === state.currentProductIndex);
    const viewIndex = allCards.indexOf(currentCard);
    const newViewIndex = viewIndex + direction;

    if (newViewIndex >= 0 && newViewIndex < allCards.length) {
        const newGlobalIndex = parseInt(allCards[newViewIndex].dataset.index);
        state.currentProductIndex = newGlobalIndex;
        openCategoryModal(newGlobalIndex);
    }
}

export function initCategoryPage() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    allCards = Array.from(grid.querySelectorAll('.catalog-card'));

    allCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('a[href^="/product/"]')) {
                return; // Let browser follow the SEO link
            }
            if (e.target.closest('.btn-text')) {
                e.preventDefault();
            }
            const index = parseInt(card.dataset.index);
            openCategoryModal(index);
        });
    });

    fetchProducts();
    setupModal();
    setNavigateModal(navigateCategoryModal);
}
