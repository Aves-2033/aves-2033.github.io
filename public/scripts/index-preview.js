// ============================================================
// index-preview.js — Превью карточек на главной странице (Astro)
// Зависит от shared.js (подключается перед этим файлом)
// ============================================================

// Данные о товарах для превью (переданы из Astro SSR)
const previewProducts = window.__previewProducts || [];

// Открытие модального окна (главная)
function openModal(index) {
    previousActiveElement = document.activeElement;
    cleanupModalHandlers();

    currentProductIndex = index;
    currentImageIndex = 0;
    const product = previewProducts[index];

    if (!product) return;

    const modal = document.getElementById('productModal');
    if (!modal) return;

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    // Навигация главной: кнопки пред/след + ссылка на каталог
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
    const newIndex = currentProductIndex + direction;
    if (newIndex >= 0 && newIndex < previewProducts.length) {
        currentProductIndex = newIndex;
        openModal(newIndex);
    }
}

// Инициализация превью
function initPreview() {
    const cards = document.querySelectorAll('.catalog-preview .card');

    setupModal();

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initPreview);
