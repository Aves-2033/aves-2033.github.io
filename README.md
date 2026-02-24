# 👗 Прокат от Кет — ketrent.ru

> Сайт аренды исторических, викторианских и винтажных платьев в Москве.

[![Deploy to GitHub Pages](https://github.com/aves-2033/aves-2033.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/aves-2033/aves-2033.github.io/actions/workflows/deploy.yml)

**Сайт:** [ketrent.ru](https://ketrent.ru)

---

## 📋 О проекте

«Прокат от Кет» — интернет-каталог проката исторических костюмов и платьев. Коллекция охватывает эпохи от XII до XX века и включает бальные, викторианские, винтажные, свадебные платья, кимоно, меховые изделия, мужской гардероб и аксессуары.

### Возможности

- 🏛️ **Каталог 400+ товаров** с фильтрацией по категориям и пагинацией
- 🔍 **Модальные карточки** товаров с галереей изображений и лайтбоксом
- 📱 **Адаптивный дизайн** — мобильное меню, touch-навигация в галерее
- ⚡ **Статическая генерация** — мгновенная загрузка, SSR-рендер всех товаров
- 🎨 **Параллакс-эффекты** и плавные анимации
- 🔎 **SEO** — Open Graph, Twitter Cards, JSON-LD (schema.org), canonical URL, sitemap
- 📊 **Аналитика** — Яндекс.Метрика, Google Search Console
- ♿ **Доступность** — ARIA-атрибуты, клавиатурная навигация, семантическая разметка

---

## 🛠 Технологии

| Технология | Назначение |
|---|---|
| [Astro](https://astro.build) v5 | Фреймворк — статическая генерация (SSG) |
| Vanilla CSS | Стили, адаптивность, анимации |
| Vanilla JavaScript (ES Modules) | Клиентская логика — модалки, фильтры, параллакс |
| [GitHub Actions](https://github.com/features/actions) | CI/CD деплой на GitHub Pages |
| [GitHub Pages](https://pages.github.com) | Хостинг с кастомным доменом |

---

## 📁 Структура проекта

```
AvesWeb2/
├── public/               # Статические файлы (копируются в dist без обработки)
│   ├── CNAME             # Кастомный домен для GitHub Pages
│   ├── robots.txt        # Правила для поисковых роботов
│   ├── favicon.svg       # Иконка сайта
│   ├── data/
│   │   └── products.json # База товаров (JSON, ~420 позиций)
│   └── img/              # Изображения (hero, OG-image)
├── src/
│   ├── components/       # Astro-компоненты
│   │   ├── Header.astro  # Шапка с навигацией и дропдауном категорий
│   │   ├── Footer.astro  # Подвал с контактами и соцсетями
│   │   └── ProductCard.astro # Карточка товара в каталоге
│   ├── layouts/
│   │   └── BaseLayout.astro  # Основной layout (SEO meta, аналитика, модалки)
│   ├── pages/
│   │   ├── index.astro   # Главная страница
│   │   ├── catalog.astro # Каталог (SSR всех товаров)
│   │   └── 404.astro     # Страница ошибки
│   ├── scripts/          # Клиентский JavaScript (ES Modules)
│   │   ├── shared.js     # Общие утилиты, модалки, лайтбокс
│   │   ├── catalog-client.js # Фильтрация, пагинация, модалки каталога
│   │   ├── index-preview.js  # Превью товаров на главной
│   │   ├── mobile-nav.js     # Мобильная навигация (бургер-меню)
│   │   └── parallax.js       # Параллакс-эффекты
│   ├── styles/
│   │   └── style.css     # Все стили проекта
│   └── data/
│       └── products.json # Данные для Astro SSR (те же товары)
├── .github/workflows/
│   └── deploy.yml        # GitHub Actions: сборка и деплой
├── astro.config.mjs      # Конфигурация Astro (sitemap, site URL)
├── package.json
└── tsconfig.json
```

---

## 🚀 Запуск

### Требования

- [Node.js](https://nodejs.org) ≥ 20

### Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (http://localhost:4321)
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр собранного сайта
npm run preview
```

---

## 🌐 Деплой

Деплой выполняется **автоматически** через GitHub Actions при каждом push в ветку `main`.

### Как это работает:

1. Push в `main` запускает workflow `.github/workflows/deploy.yml`
2. GitHub Actions: `checkout` → `npm ci` → `astro build` → `upload-pages-artifact` → `deploy-pages`
3. Сайт публикуется на GitHub Pages с кастомным доменом **ketrent.ru**

### Кастомный домен

Файл `public/CNAME` содержит `ketrent.ru`. DNS настроен на GitHub Pages.

---

## 📄 Лицензия

Все права защищены. © Прокат от Кет.

Исходный код этого проекта не предназначен для свободного распространения.
