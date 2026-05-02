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
