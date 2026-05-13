import {
	type CategoryResponse,
	type ProductResponse,
	type ProductSummaryResponse,
	toProduct,
	toProductCategories
} from './products'

const activeCategory: CategoryResponse = {
	createdAt: '2026-04-25T16:37:49.552844Z',
	id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
	isActive: true,
	name: 'Активная категория',
	slug: 'active',
	sortOrder: 10,
	updatedAt: '2026-04-25T16:37:49.552844Z'
}

const inactiveCategory: CategoryResponse = {
	...activeCategory,
	id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
	isActive: false,
	name: 'Скрытая категория',
	sortOrder: 5
}

const sameSortCategory: CategoryResponse = {
	...activeCategory,
	id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
	name: 'Альфа категория'
}

const summaryProduct: ProductSummaryResponse = {
	categoryId: activeCategory.id,
	createdAt: '2026-04-25T17:00:32.524692Z',
	currency: 'RUB',
	id: '11111111-1111-1111-1111-111111111111',
	isFeatured: false,
	mainImageUrl: '/products/hal-g9.png',
	name: 'Галогеновая G9 40Вт 2800K',
	price: '45.00',
	shortDescription: 'Теплый свет.',
	sku: 'HAL-G9-40W',
	slug: 'hal-g9-40w-2800k',
	status: 'active',
	stockQty: 0,
	updatedAt: '2026-04-25T17:14:22.988601Z'
}

it('maps active categories and keeps the all-products option first', () => {
	expect(
		toProductCategories([activeCategory, inactiveCategory, sameSortCategory])
	).toEqual([
		{label: 'Все категории', value: 'all'},
		{label: 'Активная категория', value: activeCategory.id},
		{label: 'Альфа категория', value: sameSortCategory.id}
	])
})

it('maps product summaries with category lookup, stock label, and main image', () => {
	const product = toProduct(summaryProduct, [activeCategory])

	expect(product.categoryLabel).toBe(activeCategory.name)
	expect(product.description).toBe(summaryProduct.shortDescription)
	expect(product.image.src).toBe(summaryProduct.mainImageUrl)
	expect(product.statusLabel).toBe('Нет в наличии')
})

it('maps product details with embedded category, sorted images, and fallback text', () => {
	const detailProduct: ProductResponse = {
		...summaryProduct,
		category: {
			...activeCategory,
			id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
			name: 'Встроенная категория'
		},
		fullDescription: null,
		images: [
			{
				altText: 'Второе фото',
				id: 'image-3',
				imageUrl: '/products/led-e27-thumb.png',
				isMain: false,
				sortOrder: 1
			},
			{
				altText: null,
				id: 'image-2',
				imageUrl: '/products/led-e27-card.png',
				isMain: false,
				sortOrder: 2
			},
			{
				altText: 'Главное фото',
				id: 'image-1',
				imageUrl: '/products/led-e27-main.png',
				isMain: true,
				sortOrder: 3
			}
		],
		mainImageUrl: null,
		shortDescription: null,
		status: 'draft',
		stockQty: 11
	}
	const product = toProduct(detailProduct, [activeCategory])

	expect(product.category).toBe(detailProduct.category?.id)
	expect(product.description).toBe(
		'Описание товара появится после обновления карточки.'
	)
	expect(product.gallery[0]).toEqual({
		alt: 'Главное фото',
		src: '/products/led-e27-main.png'
	})
	expect(product.specs).toContainEqual({
		name: 'Статус каталога',
		value: 'Черновик'
	})
	expect(product.statusLabel).toBe('В наличии')
})

it('uses a slug image fallback and archived status label when API images are absent', () => {
	const product = toProduct(
		{
			...summaryProduct,
			mainImageUrl: null,
			shortDescription: null,
			slug: 'industrial-led-50w',
			status: 'archived',
			stockQty: 10
		},
		[]
	)

	expect(product.categoryLabel).toBe('Без категории')
	expect(product.image.src).toBe('/products/ind-led-50w.png')
	expect(product.specs).toContainEqual({
		name: 'Статус каталога',
		value: 'В архиве'
	})
	expect(product.statusLabel).toBe('Мало')
})

it('uses the default image fallback for unknown slugs', () => {
	const product = toProduct(
		{
			...summaryProduct,
			mainImageUrl: null,
			slug: 'unknown-product'
		},
		[]
	)

	expect(product.image).toEqual({
		alt: summaryProduct.name,
		src: '/products/led-e27-card.png'
	})
})
