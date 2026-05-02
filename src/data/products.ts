export interface ProductImage {
	alt: string
	src: string
}

export interface ProductSpec {
	name: string
	value: string
}

export interface Product {
	category: string
	categoryLabel: string
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
	status: 'in-stock' | 'low'
	statusLabel: string
	stock: number
}

export const productCategories = [
	{label: 'Все категории', value: 'all'},
	{label: 'Светодиодные LED', value: 'led'},
	{label: 'Люминесцентные', value: 'luminescent'},
	{label: 'Галогеновые', value: 'halogen'},
	{label: 'Накаливания', value: 'incandescent'}
] as const

export const products: Product[] = [
	{
		category: 'led',
		categoryLabel: 'Светодиодные LED',
		description:
			'Энергоэффективная лампа для домашнего, офисного и торгового освещения. Нейтральный белый свет помогает сохранить естественную цветопередачу.',
		gallery: [
			{
				alt: 'Лампа LED E27 на белом фоне',
				src: '/products/led-e27-main.png'
			},
			{
				alt: 'Горящая лампа LED E27',
				src: '/products/led-e27-card.png'
			},
			{
				alt: 'Лампа LED E27 крупным планом',
				src: '/products/led-e27-thumb.png'
			}
		],
		id: 'led-e27-12w',
		image: {
			alt: 'Набор светодиодных ламп LED E27',
			src: '/products/led-e27-card.png'
		},
		name: 'Лампа светодиодная E27 12Вт 4000K нейтральный белый',
		price: 89,
		shortName: 'Лампа LED E27 12Вт 4000K',
		sku: 'LED-E27-12W',
		slug: 'led-e27-12w-4000k',
		specs: [
			{name: 'Цоколь', value: 'E27'},
			{name: 'Мощность', value: '12 Вт'},
			{name: 'Световой поток', value: '1100 Лм'},
			{name: 'Цветовая температура', value: '4000 K'},
			{name: 'Срок службы', value: '25 000 ч'}
		],
		status: 'in-stock',
		statusLabel: 'В наличии',
		stock: 847
	},
	{
		category: 'halogen',
		categoryLabel: 'Галогеновые',
		description:
			'Компактная капсульная лампа с теплым светом для декоративных светильников, витрин и акцентной подсветки.',
		gallery: [
			{
				alt: 'Галогеновая лампа G9 40Вт',
				src: '/products/hal-g9.png'
			}
		],
		id: 'hal-g9-40w',
		image: {
			alt: 'Галогеновая лампа G9 40Вт',
			src: '/products/hal-g9.png'
		},
		name: 'Галогеновая G9 40Вт 2800K',
		price: 45,
		shortName: 'Галогеновая G9 40Вт 2800K',
		sku: 'HAL-G9-40W',
		slug: 'hal-g9-40w-2800k',
		specs: [
			{name: 'Цоколь', value: 'G9'},
			{name: 'Мощность', value: '40 Вт'},
			{name: 'Световой поток', value: '490 Лм'},
			{name: 'Цветовая температура', value: '2800 K'},
			{name: 'Срок службы', value: '2 000 ч'}
		],
		status: 'in-stock',
		statusLabel: 'В наличии',
		stock: 12
	},
	{
		category: 'luminescent',
		categoryLabel: 'Люминесцентные',
		description:
			'Трубчатая лампа для производственных помещений, складов и технических зон с равномерным рассеянным светом.',
		gallery: [
			{
				alt: 'Люминесцентная лампа T8 на потолке',
				src: '/products/lum-t8.png'
			}
		],
		id: 'lum-t8-18w',
		image: {
			alt: 'Люминесцентная лампа T8 на потолке',
			src: '/products/lum-t8.png'
		},
		name: 'Люминесцентная T8 18Вт',
		price: 120,
		shortName: 'Люминесцентная T8 18Вт',
		sku: 'LUM-T8-18W',
		slug: 'lum-t8-18w',
		specs: [
			{name: 'Цоколь', value: 'G13'},
			{name: 'Мощность', value: '18 Вт'},
			{name: 'Длина', value: '590 мм'},
			{name: 'Цветовая температура', value: '4000 K'},
			{name: 'Срок службы', value: '10 000 ч'}
		],
		status: 'low',
		statusLabel: 'Мало',
		stock: 6
	},
	{
		category: 'led',
		categoryLabel: 'Светодиодные LED',
		description:
			'Промышленный прожектор в защищенном корпусе для освещения фасадов, складских зон и производственных площадок.',
		gallery: [
			{
				alt: 'Промышленный светодиодный прожектор в синем корпусе',
				src: '/products/ind-led-50w.png'
			}
		],
		id: 'ind-led-50w',
		image: {
			alt: 'Промышленный светодиодный прожектор в синем корпусе',
			src: '/products/ind-led-50w.png'
		},
		name: 'Промышленный LED прожектор 50Вт',
		price: 1250,
		shortName: 'Пром. LED прожектор 50Вт',
		sku: 'IND-LED-50W',
		slug: 'industrial-led-50w',
		specs: [
			{name: 'Мощность', value: '50 Вт'},
			{name: 'Световой поток', value: '4500 Лм'},
			{name: 'Степень защиты', value: 'IP65'},
			{name: 'Цветовая температура', value: '5000 K'},
			{name: 'Срок службы', value: '30 000 ч'}
		],
		status: 'in-stock',
		statusLabel: 'В наличии',
		stock: 54
	}
]

export function findProductById(productId: string) {
	return products.find(product => product.id === productId)
}

export function findProductBySlug(slug: string | undefined) {
	return products.find(product => product.slug === slug)
}
