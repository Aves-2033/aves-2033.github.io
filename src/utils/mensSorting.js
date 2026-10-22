/**
 * Определение приоритета группы для товаров мужского гардероба.
 * Порядок следования:
 * 1. Европа / Классика / Верховая езда (10)
 * 2. Индия / Восток (20)
 * 3. Япония и Азия:
 *    - Комплекты Хаори + Кимоно (31)
 *    - Кимоно (32)
 *    - Хаори и халаты (33)
 *    - Хакама (34)
 *    - Джубан (35)
 *    - Прочее азиатское (39)
 * 4. Прочее (50)
 */
export function getMensGroupWeight(product = {}) {
    // 1. Возможность явного указания стиля через детали или свойство
    const explicit = (product.subcategory || product.details?.['Стиль'] || product.details?.['Подкатегория'] || '').toLowerCase();
    if (explicit) {
        if (/европ|классик|барокко|редингот|камзол|граф/i.test(explicit)) return 10;
        if (/инди|восток|шервани/i.test(explicit)) return 20;
        if (/комплект/i.test(explicit)) return 31;
        if (/кимоно/i.test(explicit)) return 32;
        if (/хаори|халат/i.test(explicit)) return 33;
        if (/хакам/i.test(explicit)) return 34;
        if (/джубан/i.test(explicit)) return 35;
        if (/япон|ази/i.test(explicit)) return 39;
    }

    const title = product.title || '';
    const desc = product.description || '';
    const detailsText = product.details ? Object.values(product.details).join(' ') : '';
    const text = `${title} ${desc} ${detailsText}`.toLowerCase();

    // 1. Европа: камзолы, рединготы, фраки, образы возрождения, рубашки, верховая езда
    if (/камзол|редингот|граф|маркиз|возрождени|жокейск|бриджи|жабо|этерн/i.test(text) && !/индийск|кимоно|хаори|хакам/i.test(title)) {
        return 10;
    }
    if (/мужская рубашка/i.test(title)) {
        return 10;
    }

    // 2. Индия / Восток: шервани, праздничные восточные/индийские костюмы, махараджи
    if (/шервани|индийск|индия|махарадж/i.test(text)) {
        return 20;
    }

    // 3. Япония и Восточная Азия:
    // 3.1 Комплекты (Хаори + Кимоно)
    if (/комплект.*(хаори|кимоно)|(хаори.*кимоно|кимоно.*хаори)/i.test(text)) {
        return 31;
    }
    // 3.2 Кимоно
    if (/кимоно/i.test(title) || (/кимоно/i.test(text) && !/хаори|хакам|джубан/i.test(title))) {
        return 32;
    }
    // 3.3 Хаори / традиционные халаты
    if (/хаори|халат|дракон/i.test(text) && !/хакам|джубан/i.test(title)) {
        return 33;
    }
    // 3.4 Хакама (брюки)
    if (/хакам/i.test(text)) {
        return 34;
    }
    // 3.5 Джубан (нижнее кимоно)
    if (/джубан/i.test(text)) {
        return 35;
    }

    // Прочие японские/восточные элементы
    if (/япони|китай|шёлка|шелк/i.test(text)) {
        return 39;
    }

    return 50;
}

/**
 * Сортировка товаров мужского гардероба по кластерам,
 * а внутри каждого кластера — по свежести (updatedAt desc).
 */
export function sortMensProducts(products) {
    return [...products].sort((a, b) => {
        const wA = getMensGroupWeight(a);
        const wB = getMensGroupWeight(b);
        if (wA !== wB) return wA - wB;

        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
    });
}
