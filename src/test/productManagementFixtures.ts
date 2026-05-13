import {
	type CategoryResponse,
	type Product,
	type ProductListResponse,
	type ProductResponse,
	toProduct
} from '@/entities/product/products'

export const ledCategoryResponse: CategoryResponse = {
	createdAt: '2026-04-25T16:37:49.552844Z',
	id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
	isActive: true,
	name: 'Светодиодные LED',
	slug: 'led',
	sortOrder: 10,
	updatedAt: '2026-04-25T16:37:49.552844Z'
}

export const halogenCategoryResponse: CategoryResponse = {
	createdAt: '2026-04-25T16:37:49.552844Z',
	id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
	isActive: true,
	name: 'Галогеновые',
	slug: 'halogen',
	sortOrder: 20,
	updatedAt: '2026-04-25T16:37:49.552844Z'
}

export const luminescentCategoryResponse: CategoryResponse = {
	createdAt: '2026-04-25T16:37:49.552844Z',
	id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
	isActive: true,
	name: 'Люминесцентные',
	slug: 'luminescent',
	sortOrder: 30,
	updatedAt: '2026-04-25T16:37:49.552844Z'
}

export const categoryResponses: CategoryResponse[] = [
	ledCategoryResponse,
	halogenCategoryResponse,
	luminescentCategoryResponse
]

export const productResponses: ProductResponse[] = [
	{
		category: ledCategoryResponse,
		categoryId: ledCategoryResponse.id,
		createdAt: '2026-04-25T17:00:32.524692Z',
		currency: 'RUB',
		fullDescription:
			'Энергоэффективная лампа для домашнего, офисного и торгового освещения.',
		id: '11111111-1111-1111-1111-111111111111',
		images: [
			{
				altText: 'Лампа LED E27 на белом фоне',
				id: '21111111-1111-1111-1111-111111111111',
				imageUrl: '/products/led-e27-main.png',
				isMain: true,
				sortOrder: 1
			},
			{
				altText: 'Горящая лампа LED E27',
				id: '31111111-1111-1111-1111-111111111111',
				imageUrl: '/products/led-e27-card.png',
				isMain: false,
				sortOrder: 2
			}
		],
		isFeatured: true,
		mainImageUrl: '/products/led-e27-card.png',
		name: 'Лампа светодиодная E27 12Вт 4000K нейтральный белый',
		price: '89.00',
		shortDescription:
			'Нейтральный белый свет помогает сохранить естественную цветопередачу.',
		sku: 'LED-E27-12W',
		slug: 'led-e27-12w-4000k',
		status: 'active',
		stockQty: 847,
		updatedAt: '2026-04-25T17:14:22.988601Z'
	},
	{
		category: halogenCategoryResponse,
		categoryId: halogenCategoryResponse.id,
		createdAt: '2026-04-25T17:00:32.524692Z',
		currency: 'RUB',
		fullDescription:
			'Компактная капсульная лампа с теплым светом для декоративных светильников.',
		id: '22222222-2222-2222-2222-222222222222',
		images: [],
		isFeatured: false,
		mainImageUrl: '/products/hal-g9.png',
		name: 'Галогеновая G9 40Вт 2800K',
		price: '45.00',
		shortDescription: 'Теплый свет для декоративных светильников.',
		sku: 'HAL-G9-40W',
		slug: 'hal-g9-40w-2800k',
		status: 'active',
		stockQty: 12,
		updatedAt: '2026-04-25T17:14:22.988601Z'
	},
	{
		category: luminescentCategoryResponse,
		categoryId: luminescentCategoryResponse.id,
		createdAt: '2026-04-25T17:00:32.524692Z',
		currency: 'RUB',
		fullDescription:
			'Трубчатая лампа для производственных помещений, складов и технических зон.',
		id: '33333333-3333-3333-3333-333333333333',
		images: [],
		isFeatured: false,
		mainImageUrl: '/products/lum-t8.png',
		name: 'Люминесцентная T8 18Вт',
		price: '120.00',
		shortDescription: 'Равномерный рассеянный свет для технических зон.',
		sku: 'LUM-T8-18W',
		slug: 'lum-t8-18w',
		status: 'active',
		stockQty: 6,
		updatedAt: '2026-04-25T17:14:22.988601Z'
	},
	{
		category: ledCategoryResponse,
		categoryId: ledCategoryResponse.id,
		createdAt: '2026-04-25T17:00:32.524692Z',
		currency: 'RUB',
		fullDescription:
			'Промышленный прожектор в защищенном корпусе для фасадов и складских зон.',
		id: '44444444-4444-4444-4444-444444444444',
		images: [],
		isFeatured: false,
		mainImageUrl: '/products/ind-led-50w.png',
		name: 'Промышленный LED прожектор 50Вт',
		price: '1250.00',
		shortDescription: 'Защищенный корпус для промышленного освещения.',
		sku: 'IND-LED-50W',
		slug: 'industrial-led-50w',
		status: 'active',
		stockQty: 54,
		updatedAt: '2026-04-25T17:14:22.988601Z'
	}
]

export const productListResponse: ProductListResponse = {
	items: productResponses.map(
		({category, fullDescription, images, ...product}) => ({
			...product
		})
	),
	limit: 100,
	page: 1,
	total: productResponses.length
}

export const fixtureProducts = productResponses.map(product =>
	toProduct(product, categoryResponses)
)

export const [
	ledFixtureProduct,
	halogenFixtureProduct,
	luminescentFixtureProduct,
	industrialFixtureProduct
] = fixtureProducts as [Product, Product, Product, Product]
