// biome-ignore-all lint/nursery/noExcessiveLinesPerFile: Admin mock data is intentionally colocated until the API is connected.
export type AdminProductStatus = 'active' | 'archived' | 'draft'

export type AdminOrderStatus =
	| 'canceled'
	| 'completed'
	| 'confirmed'
	| 'new'
	| 'processing'
	| 'shipped'

export type InquiryStatus =
	| 'answered'
	| 'closed'
	| 'new'
	| 'processing'
	| 'spam'

export interface AdminCategory {
	id: string
	isActive: boolean
	name: string
	slug: string
	sortOrder: number
}

export interface AdminProductImage {
	alt: string
	id: string
	isMain: boolean
	src: string
}

export interface AdminProduct {
	categoryId: string
	categoryName: string
	currency: string
	fullDescription: string
	id: string
	images: [AdminProductImage, ...AdminProductImage[]]
	isFeatured: boolean
	name: string
	price: number
	shortDescription: string
	sku: string
	slug: string
	status: AdminProductStatus
	stockQty: number
}

export interface AdminOrderItem {
	lineTotal: number
	productName: string
	quantity: number
	sku: string
	unitPrice: number
}

export interface AdminOrder {
	comment: string
	companyName: null | string
	createdAt: string
	customerName: string
	deliveryAddress: string
	deliveryAmount: number
	email: string
	id: string
	items: AdminOrderItem[]
	orderNumber: string
	phone: string
	status: AdminOrderStatus
	subtotalAmount: number
	totalAmount: number
}

export interface Inquiry {
	createdAt: string
	email: string
	id: string
	message: string
	name: string
	phone: string
	status: InquiryStatus
	subject: string
}

export interface StatusMeta {
	className: string
	label: string
}

export const adminCategories: AdminCategory[] = [
	{
		id: 'category-led',
		isActive: true,
		name: 'Светодиодные LED',
		slug: 'led',
		sortOrder: 10
	},
	{
		id: 'category-halogen',
		isActive: true,
		name: 'Галогеновые',
		slug: 'halogen',
		sortOrder: 20
	},
	{
		id: 'category-incandescent',
		isActive: true,
		name: 'Накаливания',
		slug: 'incandescent',
		sortOrder: 30
	}
]

export const adminProducts: [AdminProduct, ...AdminProduct[]] = [
	{
		categoryId: 'category-led',
		categoryName: 'Светодиодные LED',
		currency: 'RUB',
		fullDescription:
			'Энергоэффективная лампа для домашнего и офисного освещения с нейтральным белым светом.',
		id: 'product-led-e27',
		images: [
			{
				alt: 'Лампа LED E27 на темном фоне',
				id: 'image-led-main',
				isMain: true,
				src: '/products/led-e27-main.png'
			},
			{
				alt: 'Горящая лампа LED E27',
				id: 'image-led-card',
				isMain: false,
				src: '/products/led-e27-card.png'
			}
		],
		isFeatured: true,
		name: 'Лампа LED E27 12Вт 4000K нейтральный белый',
		price: 89,
		shortDescription:
			'Энергоэффективная лампа для домашнего и офисного освещения...',
		sku: 'LED-E27-12W',
		slug: 'led-e27-12w-4000k',
		status: 'active',
		stockQty: 847
	},
	{
		categoryId: 'category-halogen',
		categoryName: 'Галогеновые',
		currency: 'RUB',
		fullDescription:
			'Компактная галогеновая лампа для декоративных и акцентных светильников.',
		id: 'product-hal-g9',
		images: [
			{
				alt: 'Галогеновая лампа G9',
				id: 'image-hal-main',
				isMain: true,
				src: '/products/hal-g9.png'
			}
		],
		isFeatured: false,
		name: 'Галогеновая G9 40Вт 2800K',
		price: 45,
		shortDescription: 'Теплый свет для декоративных светильников.',
		sku: 'HAL-G9-40W',
		slug: 'hal-g9-40w-2800k',
		status: 'active',
		stockQty: 12
	},
	{
		categoryId: 'category-incandescent',
		categoryName: 'Накаливания',
		currency: 'RUB',
		fullDescription:
			'Классическая лампа накаливания для технических помещений и временного освещения.',
		id: 'product-inc-e27',
		images: [
			{
				alt: 'Лампа накаливания E27',
				id: 'image-inc-main',
				isMain: true,
				src: '/products/led-e27-thumb.png'
			}
		],
		isFeatured: false,
		name: 'Лампа накаливания E27 60Вт',
		price: 25,
		shortDescription: 'Архивная позиция каталога.',
		sku: 'INC-E27-60W',
		slug: 'inc-e27-60w',
		status: 'archived',
		stockQty: 0
	},
	{
		categoryId: 'category-led',
		categoryName: 'Светодиодные LED',
		currency: 'RUB',
		fullDescription:
			'Промышленный прожектор в защищенном корпусе для складов и фасадного освещения.',
		id: 'product-industrial-led',
		images: [
			{
				alt: 'Промышленный LED прожектор',
				id: 'image-industrial-main',
				isMain: true,
				src: '/products/ind-led-50w.png'
			}
		],
		isFeatured: false,
		name: 'Промышленный LED прожектор 50Вт',
		price: 1250,
		shortDescription: 'Защищенный корпус для промышленного освещения.',
		sku: 'IND-LED-50W',
		slug: 'industrial-led-50w',
		status: 'draft',
		stockQty: 54
	}
]

export const adminOrders: [AdminOrder, ...AdminOrder[]] = [
	{
		comment: 'Позвонить перед доставкой.',
		companyName: null,
		createdAt: '15 января 2025, 14:32',
		customerName: 'Иванов Иван Иванович',
		deliveryAddress: 'г. Москва, ул. Ленина, 42',
		deliveryAmount: 0,
		email: 'ivan@example.com',
		id: 'order-00847',
		items: [
			{
				lineTotal: 890,
				productName: 'Лампа LED E27 12Вт',
				quantity: 10,
				sku: 'LED-E27-12W',
				unitPrice: 89
			},
			{
				lineTotal: 225,
				productName: 'Галогеновая G9 40Вт',
				quantity: 5,
				sku: 'HAL-G9-40W',
				unitPrice: 45
			},
			{
				lineTotal: 2500,
				productName: 'Прожектор 50Вт',
				quantity: 2,
				sku: 'IND-LED-50W',
				unitPrice: 1250
			}
		],
		orderNumber: 'ORD-00847',
		phone: '+7 (999) 123-45-67',
		status: 'new',
		subtotalAmount: 3615,
		totalAmount: 3615
	},
	{
		comment: 'Нужен счет для оплаты по реквизитам.',
		companyName: 'ООО Свет-Электро',
		createdAt: '15 января 2025, 12:10',
		customerName: 'ООО Свет-Электро',
		deliveryAddress: 'г. Казань, пр-т Победы, 19',
		deliveryAmount: 600,
		email: 'order@svet-electro.ru',
		id: 'order-00846',
		items: [
			{
				lineTotal: 12_400,
				productName: 'Промышленный LED прожектор 50Вт',
				quantity: 8,
				sku: 'IND-LED-50W',
				unitPrice: 1550
			}
		],
		orderNumber: 'ORD-00846',
		phone: '+7 (843) 555-10-20',
		status: 'confirmed',
		subtotalAmount: 11_800,
		totalAmount: 12_400
	},
	{
		comment: 'Самовывоз со склада.',
		companyName: null,
		createdAt: '14 января 2025, 18:04',
		customerName: 'Петров А.Н.',
		deliveryAddress: 'Самовывоз',
		deliveryAmount: 0,
		email: 'petrov@example.com',
		id: 'order-00845',
		items: [
			{
				lineTotal: 890,
				productName: 'Лампа LED E27 12Вт',
				quantity: 10,
				sku: 'LED-E27-12W',
				unitPrice: 89
			}
		],
		orderNumber: 'ORD-00845',
		phone: '+7 (903) 111-22-33',
		status: 'processing',
		subtotalAmount: 890,
		totalAmount: 890
	},
	{
		comment: 'Доставка к проходной.',
		companyName: null,
		createdAt: '14 января 2025, 10:41',
		customerName: 'Кузнецова М.',
		deliveryAddress: 'г. Тула, ул. Заводская, 8',
		deliveryAmount: 350,
		email: 'kuznetsova@example.com',
		id: 'order-00844',
		items: [
			{
				lineTotal: 2250,
				productName: 'Галогеновая G9 40Вт',
				quantity: 50,
				sku: 'HAL-G9-40W',
				unitPrice: 45
			}
		],
		orderNumber: 'ORD-00844',
		phone: '+7 (920) 222-33-44',
		status: 'completed',
		subtotalAmount: 1900,
		totalAmount: 2250
	}
]

export const inquiries: [Inquiry, ...Inquiry[]] = [
	{
		createdAt: '15.01.2025, 09:14',
		email: 'kozlov@mail.ru',
		id: 'inquiry-01',
		message:
			'Здравствуйте! Подскажите, есть ли у вас лампы с цоколем G13 для промышленного освещения производственных помещений? Интересует мощность 36-58 Вт, длина 120-150 см. Если есть возможность, пришлите прайс-лист на оптовые поставки.',
		name: 'Козлов Дмитрий Михайлович',
		phone: '+7 (900) 456-78-90',
		status: 'new',
		subject: 'Вопрос по товару'
	},
	{
		createdAt: '14.01.2025, 15:40',
		email: 'info@alfa-svet.ru',
		id: 'inquiry-02',
		message:
			'Интересует оптовая поставка LED E27 в количестве 5000 шт., уточните условия и сроки отгрузки.',
		name: 'ООО Альфа-Свет',
		phone: '+7 (495) 800-12-34',
		status: 'processing',
		subject: 'Оптовый заказ'
	},
	{
		createdAt: '13.01.2025, 11:22',
		email: 'romanov@gmail.com',
		id: 'inquiry-03',
		message:
			'Получил заказ, одна позиция оказалась бракованной. Как оформить возврат?',
		name: 'Романов П.Р.',
		phone: '+7 (916) 555-44-33',
		status: 'answered',
		subject: 'Возврат товара'
	}
]

export const productStatusMeta: Record<AdminProductStatus, StatusMeta> = {
	active: {
		className: 'bg-emerald-50 text-emerald-600',
		label: 'Активен'
	},
	archived: {
		className: 'bg-slate-100 text-slate-500',
		label: 'Архив'
	},
	draft: {
		className: 'bg-amber-50 text-amber-600',
		label: 'Черновик'
	}
}

export const orderStatusMeta: Record<AdminOrderStatus, StatusMeta> = {
	canceled: {
		className: 'bg-red-50 text-red-600',
		label: 'Отменен'
	},
	completed: {
		className: 'bg-emerald-50 text-emerald-600',
		label: 'Доставлен'
	},
	confirmed: {
		className: 'bg-blue-50 text-blue-600',
		label: 'Подтвержден'
	},
	new: {
		className: 'bg-amber-50 text-amber-600',
		label: 'Новый'
	},
	processing: {
		className: 'bg-violet-50 text-violet-600',
		label: 'В работе'
	},
	shipped: {
		className: 'bg-sky-50 text-sky-600',
		label: 'Отгружен'
	}
}

export const inquiryStatusMeta: Record<InquiryStatus, StatusMeta> = {
	answered: {
		className: 'bg-emerald-50 text-emerald-600',
		label: 'Отвечено'
	},
	closed: {
		className: 'bg-slate-100 text-slate-500',
		label: 'Закрыто'
	},
	new: {
		className: 'bg-red-50 text-red-600',
		label: 'Новое'
	},
	processing: {
		className: 'bg-violet-50 text-violet-600',
		label: 'В работе'
	},
	spam: {
		className: 'bg-slate-100 text-slate-500',
		label: 'Спам'
	}
}
