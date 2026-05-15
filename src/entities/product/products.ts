export interface ProductImage {
	alt: string
	src: string
}

export interface ProductSpec {
	name: string
	value: string
}

export type ProductStockStatus = 'in-stock' | 'low'

export interface Product {
	apiStatus: ProductLifecycleStatus
	category: string
	categoryId: string
	categoryLabel: string
	currency: string
	description: string
	gallery: [ProductImage, ...ProductImage[]]
	id: string
	image: ProductImage
	name: string
	price: number
	shortName: string
	sku: string
	slug: string
	specs: ProductSpec[]
	status: ProductStockStatus
	statusLabel: string
	stock: number
}

export interface ProductCategory {
	label: string
	value: string
}

export interface CategoryResponse {
	createdAt: string
	id: string
	isActive: boolean
	name: string
	slug: string
	sortOrder: number
	updatedAt: string
}

export type ProductLifecycleStatus = 'draft' | 'active' | 'archived'

export interface ProductImageResponse {
	altText?: null | string
	id: string
	imageUrl: string
	isMain: boolean
	sortOrder: number
}

export interface ProductSummaryResponse {
	categoryId: string
	createdAt: string
	currency: string
	id: string
	isFeatured: boolean
	mainImageUrl?: null | string
	name: string
	price: string
	shortDescription?: null | string
	sku: string
	slug: string
	status: ProductLifecycleStatus
	stockQty: number
	updatedAt: string
}

export interface ProductResponse extends ProductSummaryResponse {
	category?: CategoryResponse | null
	fullDescription?: null | string
	images?: ProductImageResponse[]
}

export interface ProductListResponse {
	items: ProductSummaryResponse[]
	limit: number
	page: number
	total: number
}

export const allProductsCategory: ProductCategory = {
	label: 'Все категории',
	value: 'all'
}

const fallbackProductImages: Record<string, ProductImage> = {
	'ind-led-50w': {
		alt: 'Промышленный светодиодный прожектор',
		src: '/products/ind-led-50w.png'
	},
	'industrial-led-50w': {
		alt: 'Промышленный светодиодный прожектор',
		src: '/products/ind-led-50w.png'
	},
	'led-e27-12w-4000k': {
		alt: 'Светодиодная лампа E27',
		src: '/products/led-e27-card.png'
	},
	'lum-t8-18w': {
		alt: 'Люминесцентная лампа T8',
		src: '/products/lum-t8.png'
	},
	'hal-g9-40w-2800k': {
		alt: 'Галогеновая лампа G9',
		src: '/products/hal-g9.png'
	}
}

const defaultProductImage: ProductImage = {
	alt: 'Лампа на белом фоне',
	src: '/products/led-e27-card.png'
}

export function toProductCategories(
	categories: CategoryResponse[]
): ProductCategory[] {
	const activeCategories = categories
		.filter(category => category.isActive)
		.toSorted(
			(left, right) =>
				left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
		)
		.map(category => ({
			label: category.name,
			value: category.id
		}))

	return [allProductsCategory, ...activeCategories]
}

export function toProduct(
	apiProduct: ProductResponse | ProductSummaryResponse,
	categories: CategoryResponse[]
): Product {
	const category = getProductCategory(apiProduct, categories)
	const gallery = getProductGallery(apiProduct)
	const stockStatus = apiProduct.stockQty <= 10 ? 'low' : 'in-stock'
	const categoryLabel = category?.name ?? 'Без категории'

	return {
		apiStatus: apiProduct.status,
		category: category?.id ?? apiProduct.categoryId,
		categoryId: apiProduct.categoryId,
		categoryLabel,
		currency: apiProduct.currency,
		description:
			getProductFullDescription(apiProduct) ??
			apiProduct.shortDescription ??
			'Описание товара появится после обновления карточки.',
		gallery,
		id: apiProduct.id,
		image: gallery[0],
		name: apiProduct.name,
		price: Number(apiProduct.price),
		shortName: apiProduct.name,
		sku: apiProduct.sku,
		slug: apiProduct.slug,
		specs: [
			{name: 'Категория', value: categoryLabel},
			{name: 'Артикул', value: apiProduct.sku},
			{
				name: 'Статус каталога',
				value: getLifecycleStatusLabel(apiProduct.status)
			},
			{name: 'Валюта', value: apiProduct.currency},
			{name: 'Остаток', value: `${apiProduct.stockQty} шт.`}
		],
		status: stockStatus,
		statusLabel: getStockStatusLabel(apiProduct.stockQty),
		stock: apiProduct.stockQty
	}
}

function getProductCategory(
	apiProduct: ProductResponse | ProductSummaryResponse,
	categories: CategoryResponse[]
) {
	const detailCategory =
		'category' in apiProduct && apiProduct.category
			? apiProduct.category
			: undefined

	return (
		detailCategory ??
		categories.find(category => category.id === apiProduct.categoryId)
	)
}

function getProductGallery(
	apiProduct: ProductResponse | ProductSummaryResponse
): [ProductImage, ...ProductImage[]] {
	const detailImages =
		'images' in apiProduct && apiProduct.images ? apiProduct.images : []
	const sortedImages = detailImages.toSorted(
		(left, right) =>
			Number(right.isMain) - Number(left.isMain) ||
			left.sortOrder - right.sortOrder
	)
	const gallery = sortedImages.map(image => ({
		alt: image.altText ?? apiProduct.name,
		src: image.imageUrl
	}))
	const mainImage =
		'mainImageUrl' in apiProduct && apiProduct.mainImageUrl
			? [{alt: apiProduct.name, src: apiProduct.mainImageUrl}]
			: []
	const fallbackImage = fallbackProductImages[apiProduct.slug] ?? {
		...defaultProductImage,
		alt: apiProduct.name
	}
	const images: ProductImage[] = []

	for (const image of [...gallery, ...mainImage, fallbackImage]) {
		if (!images.some(existingImage => existingImage.src === image.src)) {
			images.push(image)
		}
	}

	const [firstImage = fallbackImage, ...restImages] = images

	return [firstImage, ...restImages]
}

function getProductFullDescription(
	apiProduct: ProductResponse | ProductSummaryResponse
) {
	return 'fullDescription' in apiProduct
		? apiProduct.fullDescription
		: undefined
}

function getLifecycleStatusLabel(status: ProductLifecycleStatus) {
	const statusLabels: Record<ProductLifecycleStatus, string> = {
		active: 'Активен',
		archived: 'В архиве',
		draft: 'Черновик'
	}

	return statusLabels[status]
}

function getStockStatusLabel(stockQty: number) {
	if (stockQty === 0) {
		return 'Нет в наличии'
	}

	return stockQty <= 10 ? 'Мало' : 'В наличии'
}
