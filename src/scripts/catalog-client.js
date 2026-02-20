// ============================================================
// catalog-client.js — Клиентский JS для каталога (ES Module)
// Работает с уже отрендеренными в HTML карточками
// ============================================================

import {
    state,
    cleanupModalHandlers,
    setupModal,
    renderModalContent,
    openContactModal,
    setNavigateModal,
} from './shared.js';

// Параметры пагинации
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let activeFilter = 'all';
let allCards = [];
let filteredCards = [];
let products = [];

// Загрузка полных данных товаров для модалок
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

// Применить фильтр
function applyFilter(category) {
    activeFilter = category;
    currentPage = 1;

    if (category === 'all') {
        filteredCards = [...allCards];
    } else {
        filteredCards = allCards.filter(card => card.dataset.category === category);
    }

    allCards.forEach(card => {
        card.style.display = 'none';
    });

    showPage();
    updateLoadMoreButton();
}

// Показать текущую страницу
function showPage() {
    const end = currentPage * ITEMS_PER_PAGE;

    filteredCards.forEach((card, index) => {
        card.style.display = index < end ? '' : 'none';
    });
}

// Обновить кнопку "Показать ещё"
function updateLoadMoreButton() {
    const container = document.getElementById('loadMoreContainer');
    if (!container) return;

    const totalShown = currentPage * ITEMS_PER_PAGE;
    container.style.display = totalShown < filteredCards.length ? 'flex' : 'none';
}

// Загрузить ещё
function loadMore() {
    currentPage++;
    showPage();
    updateLoadMoreButton();
}

// Открытие модалки каталога
function openCatalogModal(index) {
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

    const prevDisabled = index === 0;
    const nextDisabled = index === filteredCards.length - 1;

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

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.focus();
}

// Навигация в модалке каталога
function navigateCatalogModal(direction) {
    const currentCard = filteredCards.find(c => parseInt(c.dataset.index) === state.currentProductIndex);
    const currentFilteredIdx = filteredCards.indexOf(currentCard);
    const newFilteredIdx = currentFilteredIdx + direction;

    if (newFilteredIdx >= 0 && newFilteredIdx < filteredCards.length) {
        const newProductIndex = parseInt(filteredCards[newFilteredIdx].dataset.index);
        state.currentProductIndex = newProductIndex;
        openCatalogModal(newProductIndex);
    }
}

// Инициализация каталога
function initCatalog() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    allCards = Array.from(grid.querySelectorAll('.catalog-card'));
    filteredCards = [...allCards];

    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            applyFilter(btn.dataset.filter);
        });
    });

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMore);
    }

    allCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-text')) {
                e.preventDefault();
            }
            const index = parseInt(card.dataset.index);
            openCatalogModal(index);
        });
    });

    fetchProducts().then(() => {
        if (urlCategory) {
            const targetBtn = document.querySelector(`.filter-btn[data-filter="${urlCategory}"]`);
            if (targetBtn) {
                targetBtn.click();
            } else {
                applyFilter('all');
            }
        } else {
            applyFilter('all');
        }
    });

    setupModal();

    // Устанавливаем навигацию модалки для каталога
    setNavigateModal(navigateCatalogModal);
}

document.addEventListener('DOMContentLoaded', initCatalog);
