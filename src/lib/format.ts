export function formatPrice(value: number) {
	return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

export function formatCartLineCount(count: number) {
	if (count === 1) {
		return `${count} товар`
	}

	if (count > 1 && count < 5) {
		return `${count} товара`
	}

	return `${count} товаров`
}

/** Парсинг числа цены из поля фильтра (пустое и некорректное → без параметра запроса). */
export function parsePriceFilter(raw: string): number | undefined {
	const trimmed = raw.trim()
	if (trimmed === '') {
		return
	}
	const normalized = trimmed.replace(',', '.')
	const value = Number(normalized)
	if (!Number.isFinite(value) || value < 0) {
		return
	}
	return value
}
