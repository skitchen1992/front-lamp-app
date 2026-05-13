// biome-ignore-all lint/nursery/noExcessiveLinesPerFile: Админские mock-экраны собраны рядом до подключения API.
import {
	Archive,
	ArrowLeft,
	BadgeCheck,
	Boxes,
	ChevronDown,
	ImagePlus,
	LayoutDashboard,
	ListChecks,
	type LucideIcon,
	Mail,
	MessageSquare,
	Package,
	PackagePlus,
	Pencil,
	Plus,
	Save,
	Search,
	ShoppingBag,
	TrendingUp,
	Truck,
	UserPlus,
	Zap
} from 'lucide-react'
import {
	type FormEvent,
	type ReactNode,
	useCallback,
	useMemo,
	useState
} from 'react'
import {Link, Navigate, NavLink, Outlet, useParams} from 'react-router'
import {Head} from '@/components/Head'
import {Button} from '@/components/ui/Button'
import {Input} from '@/components/ui/input'
import {formatPrice} from '@/lib/format'
import {cn} from '@/lib/utils'

type AdminProductStatus = 'active' | 'archived' | 'draft'
type AdminOrderStatus =
	| 'canceled'
	| 'completed'
	| 'confirmed'
	| 'new'
	| 'processing'
	| 'shipped'
type InquiryStatus = 'answered' | 'closed' | 'new' | 'processing' | 'spam'

interface AdminCategory {
	id: string
	isActive: boolean
	name: string
	slug: string
	sortOrder: number
}

interface AdminProductImage {
	alt: string
	id: string
	isMain: boolean
	src: string
}

interface AdminProduct {
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

interface AdminOrderItem {
	lineTotal: number
	productName: string
	quantity: number
	sku: string
	unitPrice: number
}

interface AdminOrder {
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

interface Inquiry {
	createdAt: string
	email: string
	id: string
	message: string
	name: string
	phone: string
	status: InquiryStatus
	subject: string
}

interface StatusMeta {
	className: string
	label: string
}

const adminCategories: AdminCategory[] = [
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

const adminProducts: [AdminProduct, ...AdminProduct[]] = [
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

const adminOrders: [AdminOrder, ...AdminOrder[]] = [
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

const inquiries: [Inquiry, ...Inquiry[]] = [
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

const productStatusMeta: Record<AdminProductStatus, StatusMeta> = {
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

const orderStatusMeta: Record<AdminOrderStatus, StatusMeta> = {
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

const inquiryStatusMeta: Record<InquiryStatus, StatusMeta> = {
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

const adminNavigationItems = [
	{
		icon: LayoutDashboard,
		label: 'Дашборд',
		to: '/admin/dashboard'
	},
	{
		icon: Package,
		label: 'Товары',
		to: '/admin/products'
	},
	{
		icon: ShoppingBag,
		label: 'Заказы',
		to: '/admin/orders'
	},
	{
		icon: MessageSquare,
		label: 'Обращения',
		to: '/admin/inquiries'
	}
]

const orderTabs = [
	{label: 'Все (42)', value: 'all'},
	{label: 'Новые (7)', value: 'new'},
	{label: 'В работе (12)', value: 'processing'},
	{label: 'Завершенные (20)', value: 'completed'}
]

const formControlClass =
	'min-h-11 rounded-md border border-input bg-background px-4 py-2 text-sm outline-none transition focus-visible:border-blue-600 focus-visible:ring-[3px] focus-visible:ring-blue-600/20'

function preventFormSubmit(event: FormEvent<HTMLFormElement>) {
	event.preventDefault()
}

function getStockTextClass(stockQty: number) {
	if (stockQty > 20) {
		return 'text-emerald-600'
	}

	if (stockQty > 0) {
		return 'text-amber-600'
	}

	return 'text-slate-400'
}

function getAdminNavLinkClass({isActive}: {isActive: boolean}) {
	return cn(
		'flex shrink-0 items-center gap-3 rounded-md px-3 py-3 font-medium text-sm transition',
		isActive
			? 'bg-blue-600 text-white'
			: 'text-slate-400 hover:bg-white/5 hover:text-white'
	)
}

function AdminLogo({compact = false}: {compact?: boolean}) {
	return (
		<Link
			className={cn(
				'inline-flex items-center gap-2 font-bold tracking-normal',
				compact ? 'text-xl' : 'text-lg'
			)}
			to='/admin/dashboard'
		>
			<Zap aria-hidden={true} className='size-5 text-blue-500' />
			<span>ЛампоЗавод</span>
			<span className='text-[10px] text-slate-400 uppercase tracking-widest'>
				Admin
			</span>
		</Link>
	)
}

function StatusBadge({className, label}: StatusMeta) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-md px-2 py-1 font-semibold text-xs',
				className
			)}
		>
			{label}
		</span>
	)
}

function AdminSidebar() {
	return (
		<aside className='border-slate-800 border-r bg-[#17191d] text-white lg:min-h-screen'>
			<div className='flex h-14 items-center border-slate-700 border-b px-5'>
				<AdminLogo />
			</div>
			<nav className='px-3 py-5'>
				<p className='mb-3 px-2 font-semibold text-[11px] text-slate-500 uppercase tracking-[0.22em]'>
					Навигация
				</p>
				<div className='flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible'>
					{adminNavigationItems.map(item => (
						<NavLink
							className={getAdminNavLinkClass}
							key={item.to}
							to={item.to}
						>
							<item.icon aria-hidden={true} className='size-4' />
							{item.label}
						</NavLink>
					))}
				</div>
			</nav>
		</aside>
	)
}

function AdminLayout() {
	return (
		<div className='min-h-screen bg-slate-100 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]'>
			<Head title='ЛампоЗавод - админка' />
			<AdminSidebar />
			<main className='min-w-0'>
				<Outlet />
			</main>
		</div>
	)
}

interface AdminContentShellProperties {
	actions?: ReactNode
	children: ReactNode
	title: string
}

function AdminContentShell({
	actions,
	children,
	title
}: AdminContentShellProperties) {
	return (
		<section className='px-4 py-7 sm:px-6 lg:px-9'>
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<h1 className='font-bold text-3xl tracking-normal'>{title}</h1>
				{actions}
			</div>
			{children}
		</section>
	)
}

function AdminUserBadge() {
	return (
		<div className='flex items-center gap-3 text-slate-500'>
			<span className='hidden font-medium text-sm sm:inline'>
				Администратор
			</span>
			<div className='flex size-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white'>
				А
			</div>
		</div>
	)
}

interface DashboardCardProperties {
	icon: LucideIcon
	iconClassName: string
	label: string
	note: string
	value: string
}

function DashboardCard({
	icon: Icon,
	iconClassName,
	label,
	note,
	value
}: DashboardCardProperties) {
	return (
		<article className='rounded-lg border bg-background p-5 shadow-xs'>
			<div className='flex items-start justify-between gap-4'>
				<p className='font-medium text-slate-500 text-sm'>{label}</p>
				<div
					className={cn(
						'flex size-10 items-center justify-center rounded-lg',
						iconClassName
					)}
				>
					<Icon aria-hidden={true} className='size-5' />
				</div>
			</div>
			<p className='mt-5 font-bold text-4xl tracking-normal'>{value}</p>
			<p className='mt-3 text-slate-500 text-sm italic'>{note}</p>
		</article>
	)
}

export function AdminDashboard() {
	const recentOrders = adminOrders.slice(0, 4)

	return (
		<AdminContentShell actions={<AdminUserBadge />} title='Дашборд'>
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				<DashboardCard
					icon={Boxes}
					iconClassName='bg-blue-50 text-blue-600'
					label='Товаров в каталоге'
					note='18 активных · 2 в архиве'
					value='20'
				/>
				<DashboardCard
					icon={ListChecks}
					iconClassName='bg-amber-50 text-amber-600'
					label='Новых заказов'
					note='Требуют обработки'
					value='7'
				/>
				<DashboardCard
					icon={Mail}
					iconClassName='bg-red-50 text-red-500'
					label='Необработанных обращений'
					note='Новые обращения'
					value='3'
				/>
				<DashboardCard
					icon={TrendingUp}
					iconClassName='bg-emerald-50 text-emerald-600'
					label='Заказов за месяц'
					note='↑ 18% к прошлому'
					value='42'
				/>
			</div>

			<div className='mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]'>
				<section className='overflow-hidden rounded-lg border bg-background shadow-xs'>
					<div className='flex items-center justify-between border-b px-5 py-4'>
						<h2 className='font-semibold text-lg'>Последние заказы</h2>
						<Link
							className='inline-flex h-8 items-center justify-center rounded-md bg-blue-50 px-3 font-medium text-blue-600 text-sm transition hover:bg-blue-100'
							to='/admin/orders'
						>
							Все заказы
						</Link>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[36rem] text-sm'>
							<thead className='bg-slate-50 text-slate-500'>
								<tr>
									<th className='px-5 py-3 text-left font-semibold'>Номер</th>
									<th className='px-5 py-3 text-left font-semibold'>Дата</th>
									<th className='px-5 py-3 text-left font-semibold'>Клиент</th>
									<th className='px-5 py-3 text-left font-semibold'>Статус</th>
									<th className='px-5 py-3 text-right font-semibold'>Сумма</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map(order => (
									<tr className='border-t' key={order.id}>
										<td className='whitespace-nowrap px-5 py-4'>
											<Link
												className='font-semibold text-blue-600 hover:underline'
												to='/admin/orders'
											>
												#{order.orderNumber}
											</Link>
										</td>
										<td className='whitespace-nowrap px-5 py-4 text-slate-500 italic'>
											{order.createdAt.split(',')[0]}
										</td>
										<td className='px-5 py-4 font-medium'>
											{order.customerName}
										</td>
										<td className='px-5 py-4'>
											<StatusBadge {...orderStatusMeta[order.status]} />
										</td>
										<td className='whitespace-nowrap px-5 py-4 text-right font-bold'>
											{formatPrice(order.totalAmount)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className='h-max rounded-lg border bg-background p-5 shadow-xs'>
					<h2 className='font-semibold text-lg'>Быстрые действия</h2>
					<div className='mt-4 space-y-3'>
						<QuickActionLink
							icon={PackagePlus}
							label='Добавить товар'
							to='/admin/products/new'
							variant='primary'
						/>
						<QuickActionLink
							icon={ListChecks}
							label='Все заказы'
							to='/admin/orders'
						/>
						<QuickActionLink
							icon={MessageSquare}
							label='Обращения (3 новых)'
							to='/admin/inquiries'
						/>
					</div>
				</section>
			</div>
		</AdminContentShell>
	)
}

interface QuickActionLinkProperties {
	icon: LucideIcon
	label: string
	to: string
	variant?: 'default' | 'primary'
}

function QuickActionLink({
	icon: Icon,
	label,
	to,
	variant = 'default'
}: QuickActionLinkProperties) {
	return (
		<Link
			className={cn(
				'flex h-12 items-center gap-3 rounded-md px-4 font-medium transition',
				variant === 'primary'
					? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
			)}
			to={to}
		>
			<Icon aria-hidden={true} className='size-4' />
			{label}
		</Link>
	)
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Таблица товаров пока является цельным mock-экраном.
export function AdminProducts() {
	return (
		<AdminContentShell
			actions={
				<Link
					className='inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-sm text-white shadow-xs transition hover:bg-blue-700'
					to='/admin/products/new'
				>
					<Plus aria-hidden={true} className='size-4' />
					Добавить товар
				</Link>
			}
			title='Управление товарами'
		>
			<div className='flex flex-col gap-3 md:flex-row'>
				<div className='relative md:w-80'>
					<Search
						aria-hidden={true}
						className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
					/>
					<Input
						aria-label='Поиск по товару'
						className='h-11 bg-background pl-10'
						placeholder='Поиск по названию / артикулу...'
						type='search'
					/>
				</div>
				<div className='relative md:w-52'>
					<select
						aria-label='Категория'
						className={cn('w-full appearance-none', formControlClass)}
					>
						<option>Все категории</option>
						{adminCategories.map(category => (
							<option key={category.id}>{category.name}</option>
						))}
					</select>
					<ChevronDown
						aria-hidden={true}
						className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
					/>
				</div>
				<div className='relative md:w-44'>
					<select
						aria-label='Статус товара'
						className={cn('w-full appearance-none', formControlClass)}
					>
						<option>Все статусы</option>
						<option>Активные</option>
						<option>Черновики</option>
						<option>Архив</option>
					</select>
					<ChevronDown
						aria-hidden={true}
						className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
					/>
				</div>
			</div>

			<div className='mt-5 overflow-hidden rounded-md border bg-background'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[56rem] text-sm'>
						<thead className='bg-slate-50 text-slate-500'>
							<tr>
								<th className='px-4 py-3 text-left font-semibold'>Фото</th>
								<th className='px-4 py-3 text-left font-semibold'>
									Наименование / Артикул
								</th>
								<th className='px-4 py-3 text-left font-semibold'>Категория</th>
								<th className='px-4 py-3 text-right font-semibold'>Цена</th>
								<th className='px-4 py-3 text-right font-semibold'>Остаток</th>
								<th className='px-4 py-3 text-left font-semibold'>Статус</th>
								<th className='px-4 py-3 text-right font-semibold'>Действия</th>
							</tr>
						</thead>
						<tbody>
							{adminProducts.slice(0, 3).map(product => (
								<tr
									className={cn(
										'border-t',
										product.status === 'archived' && 'text-slate-400'
									)}
									key={product.id}
								>
									<td className='px-4 py-3'>
										<img
											alt={product.images[0].alt}
											className='size-12 rounded-md object-cover'
											height={48}
											src={product.images[0].src}
											width={48}
										/>
									</td>
									<td className='px-4 py-3'>
										<p className='font-semibold text-foreground'>
											{product.name}
										</p>
										<p className='text-slate-400 text-xs italic'>
											{product.sku}
										</p>
									</td>
									<td className='px-4 py-3 text-slate-500 italic'>
										{product.categoryName}
									</td>
									<td className='px-4 py-3 text-right font-bold'>
										{formatPrice(product.price)}
									</td>
									<td
										className={cn(
											'px-4 py-3 text-right',
											getStockTextClass(product.stockQty)
										)}
									>
										{product.stockQty}
									</td>
									<td className='px-4 py-3'>
										<StatusBadge {...productStatusMeta[product.status]} />
									</td>
									<td className='px-4 py-3'>
										<div className='flex justify-end gap-2'>
											<ActionIconLink
												icon={Pencil}
												label={`Редактировать ${product.name}`}
												to={`/admin/products/${product.id}/edit`}
											/>
											{product.status === 'archived' ? (
												<button
													className='inline-flex h-8 items-center rounded-md px-3 font-medium text-blue-600 text-xs transition hover:bg-blue-50'
													type='button'
												>
													Восстановить
												</button>
											) : (
												<ActionIconButton
													icon={Archive}
													label={`Архивировать ${product.name}`}
												/>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</AdminContentShell>
	)
}

interface ActionIconProperties {
	icon: LucideIcon
	label: string
}

interface ActionIconLinkProperties extends ActionIconProperties {
	to: string
}

function ActionIconLink({icon: Icon, label, to}: ActionIconLinkProperties) {
	return (
		<Link
			aria-label={label}
			className='inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600'
			to={to}
		>
			<Icon aria-hidden={true} className='size-4' />
		</Link>
	)
}

function ActionIconButton({icon: Icon, label}: ActionIconProperties) {
	return (
		<button
			aria-label={label}
			className='inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600'
			type='button'
		>
			<Icon aria-hidden={true} className='size-4' />
		</button>
	)
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Форма товара сверстана целиком до подключения form-state и API.
export function AdminProductEditor() {
	const {productId} = useParams()
	const isNewProduct = productId === 'new'
	const product = useMemo(() => {
		if (isNewProduct) {
			return adminProducts[0]
		}

		return adminProducts.find(item => item.id === productId)
	}, [isNewProduct, productId])

	if (!product) {
		return <Navigate replace={true} to='/admin/products' />
	}

	return (
		<section className='px-4 py-7 sm:px-6 lg:px-9'>
			<div className='mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
				<div>
					<Link
						className='inline-flex items-center gap-2 text-slate-500 text-sm italic transition hover:text-foreground'
						to='/admin/products'
					>
						<ArrowLeft aria-hidden={true} className='size-4' />
						Назад к списку товаров
					</Link>
					<h1 className='mt-2 font-bold text-3xl tracking-normal'>
						{isNewProduct ? 'Добавить товар' : 'Редактировать товар'}
					</h1>
				</div>
				<div className='flex flex-col gap-2 sm:flex-row'>
					<Button
						className='h-11 bg-background text-slate-600 hover:bg-slate-50'
						variant='outline'
					>
						<Archive aria-hidden={true} className='size-4' />
						Архивировать
					</Button>
					<Button className='h-11 bg-blue-600 px-5 text-white hover:bg-blue-700'>
						<Save aria-hidden={true} className='size-4' />
						Сохранить изменения
					</Button>
				</div>
			</div>

			<div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
				<form
					className='rounded-lg border bg-background p-6 shadow-xs'
					onSubmit={preventFormSubmit}
				>
					<h2 className='font-semibold text-lg'>Основная информация</h2>
					<div className='mt-5 grid gap-4 md:grid-cols-2'>
						<FormField className='md:col-span-2' label='Наименование товара *'>
							<Input
								aria-label='Наименование товара'
								className='h-11'
								defaultValue={product.name}
								placeholder='Название товара'
							/>
						</FormField>
						<FormField label='Артикул (SKU) *'>
							<Input
								aria-label='Артикул товара'
								className='h-11'
								defaultValue={product.sku}
								placeholder='SKU'
							/>
						</FormField>
						<FormField label='Категория'>
							<div className='relative'>
								<select
									aria-label='Категория товара'
									className={cn('w-full appearance-none', formControlClass)}
									defaultValue={product.categoryId}
								>
									{adminCategories.map(category => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
								<ChevronDown
									aria-hidden={true}
									className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
								/>
							</div>
						</FormField>
						<FormField className='md:col-span-2' label='Краткое описание'>
							<textarea
								aria-label='Краткое описание товара'
								className={cn('w-full resize-none', formControlClass)}
								defaultValue={product.shortDescription}
								placeholder='Краткое описание для карточки'
								rows={3}
							/>
						</FormField>
						<FormField label='Цена (₽) *'>
							<Input
								aria-label='Цена товара'
								className='h-11'
								defaultValue={String(product.price)}
								inputMode='decimal'
							/>
						</FormField>
						<FormField label='Остаток (шт.) *'>
							<Input
								aria-label='Остаток товара'
								className='h-11'
								defaultValue={String(product.stockQty)}
								inputMode='numeric'
							/>
						</FormField>
						<FormField className='md:col-span-2' label='Статус публикации'>
							<label className='flex h-11 items-center gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-emerald-700'>
								<input
									aria-label='Опубликован'
									className='size-5 accent-emerald-500'
									defaultChecked={product.status === 'active'}
									type='checkbox'
								/>
								<span className='font-medium text-sm'>Опубликован</span>
							</label>
						</FormField>
					</div>
				</form>

				<section className='h-max rounded-lg border bg-background p-6 shadow-xs'>
					<h2 className='font-semibold text-lg'>Изображения товара</h2>
					<img
						alt={product.images[0].alt}
						className='mt-5 aspect-[3/2] w-full rounded-md border-2 border-blue-600 object-cover'
						height={220}
						src={product.images[0].src}
						width={332}
					/>
					<Button
						className='mt-4 h-10 w-full border-blue-600 text-blue-600 hover:bg-blue-50'
						variant='outline'
					>
						<ImagePlus aria-hidden={true} className='size-4' />
						Загрузить фото
					</Button>
					<div className='mt-4 grid grid-cols-4 gap-2'>
						{product.images.map(image => (
							<button
								className={cn(
									'aspect-square overflow-hidden rounded-md border bg-slate-100 p-1 transition hover:border-blue-600',
									image.isMain && 'border-2 border-blue-600'
								)}
								key={image.id}
								type='button'
							>
								<img
									alt={image.alt}
									className='size-full rounded-sm object-cover'
									height={64}
									src={image.src}
									width={64}
								/>
							</button>
						))}
						<button
							aria-label='Добавить изображение товара'
							className='flex aspect-square items-center justify-center rounded-md border bg-slate-100 text-slate-400 transition hover:border-blue-600 hover:text-blue-600'
							type='button'
						>
							<Plus aria-hidden={true} className='size-6' />
						</button>
					</div>
				</section>
			</div>
		</section>
	)
}

interface FormFieldProperties {
	children: ReactNode
	className?: string
	label: string
}

function FormField({children, className, label}: FormFieldProperties) {
	return (
		<div className={cn('grid gap-2 text-sm', className)}>
			<span className='font-medium'>{label}</span>
			{children}
		</div>
	)
}

export function AdminOrders() {
	const [selectedOrderId, setSelectedOrderId] = useState(adminOrders[0].id)
	const selectedOrder =
		adminOrders.find(order => order.id === selectedOrderId) ?? adminOrders[0]

	return (
		<section className='grid min-h-screen bg-slate-100 xl:grid-cols-[minmax(0,1fr)_34rem]'>
			<div className='px-4 py-7 sm:px-6 lg:px-7'>
				<h1 className='font-bold text-3xl tracking-normal'>Список заказов</h1>
				<div className='mt-5 flex gap-2 overflow-x-auto'>
					{orderTabs.map(tab => (
						<button
							className={cn(
								'h-9 shrink-0 rounded-md border px-4 font-medium text-sm transition',
								tab.value === 'all'
									? 'border-blue-600 bg-blue-600 text-white'
									: 'bg-background text-slate-500 hover:bg-slate-50'
							)}
							key={tab.value}
							type='button'
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className='mt-6 space-y-4'>
					{adminOrders.slice(0, 3).map(order => (
						<OrderListItem
							isSelected={order.id === selectedOrder.id}
							key={order.id}
							onSelect={setSelectedOrderId}
							order={order}
						/>
					))}
				</div>
			</div>
			<OrderDetails order={selectedOrder} />
		</section>
	)
}

interface OrderListItemProperties {
	isSelected: boolean
	onSelect: (orderId: string) => void
	order: AdminOrder
}

function OrderListItem({isSelected, onSelect, order}: OrderListItemProperties) {
	const handleSelect = useCallback(() => {
		onSelect(order.id)
	}, [onSelect, order.id])

	return (
		<button
			className={cn(
				'grid w-full gap-3 rounded-lg border bg-background p-4 text-left shadow-xs transition sm:grid-cols-[minmax(0,1fr)_auto]',
				isSelected && 'border-blue-600 bg-blue-50'
			)}
			onClick={handleSelect}
			type='button'
		>
			<div>
				<div className='flex flex-wrap items-center gap-3'>
					<p className='font-bold text-blue-600'>#{order.orderNumber}</p>
					<StatusBadge {...orderStatusMeta[order.status]} />
				</div>
				<p className='mt-2 text-slate-500 text-sm italic'>
					{order.companyName ?? order.customerName} ·{' '}
					{order.createdAt.split(',')[0]} · {order.items.length} товара
				</p>
			</div>
			<p className='self-center font-bold text-xl'>
				{formatPrice(order.totalAmount)}
			</p>
		</button>
	)
}

function OrderDetails({order}: {order: AdminOrder}) {
	return (
		<aside className='border-slate-200 border-l bg-background px-4 py-7 sm:px-6 lg:px-8'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h2 className='font-bold text-2xl'>Заказ #{order.orderNumber}</h2>
					<p className='mt-5 text-slate-400 text-sm italic'>
						{order.createdAt}
					</p>
				</div>
				<StatusBadge {...orderStatusMeta[order.status]} />
			</div>

			<section className='mt-6 rounded-lg border bg-slate-50 p-4'>
				<h3 className='font-semibold'>Изменить статус</h3>
				<div className='mt-3 flex flex-wrap gap-2'>
					{(['new', 'confirmed', 'processing', 'completed'] as const).map(
						status => (
							<button
								className={cn(
									'h-9 rounded-md border bg-background px-3 font-medium text-slate-500 text-sm transition hover:bg-slate-100',
									status === order.status && 'border-amber-500 text-amber-600'
								)}
								key={status}
								type='button'
							>
								{orderStatusMeta[status].label}
							</button>
						)
					)}
					<button
						className='h-9 rounded-md border border-red-500 bg-background px-3 font-medium text-red-500 text-sm transition hover:bg-red-50'
						type='button'
					>
						Отменить
					</button>
				</div>
			</section>

			<section className='mt-6 rounded-lg border p-4'>
				<h3 className='font-semibold'>Контактные данные</h3>
				<dl className='mt-4 grid gap-3 text-sm'>
					<DetailRow label='Клиент' value={order.customerName} />
					<DetailRow label='Телефон' value={order.phone} />
					<DetailRow label='E-mail' value={order.email} />
					<DetailRow label='Адрес' value={order.deliveryAddress} />
				</dl>
			</section>

			<section className='mt-5 overflow-hidden rounded-lg border'>
				<div className='border-b px-4 py-3'>
					<h3 className='font-semibold'>Состав заказа</h3>
				</div>
				<div className='divide-y'>
					{order.items.map(item => (
						<div
							className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3 text-sm'
							key={item.sku}
						>
							<p className='italic'>
								{item.productName} · {item.quantity} шт. ×{' '}
								{formatPrice(item.unitPrice)}
							</p>
							<p className='font-bold'>{formatPrice(item.lineTotal)}</p>
						</div>
					))}
					<div className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-4'>
						<p className='font-bold'>Итого</p>
						<p className='font-bold text-2xl'>
							{formatPrice(order.totalAmount)}
						</p>
					</div>
				</div>
			</section>
		</aside>
	)
}

function DetailRow({label, value}: {label: string; value: string}) {
	return (
		<div className='grid grid-cols-[7rem_minmax(0,1fr)] gap-4'>
			<dt className='text-slate-500 italic'>{label}</dt>
			<dd className='text-right font-medium'>{value}</dd>
		</div>
	)
}

export function AdminInquiries() {
	const [selectedInquiryId, setSelectedInquiryId] = useState(inquiries[0].id)
	const selectedInquiry =
		inquiries.find(inquiry => inquiry.id === selectedInquiryId) ?? inquiries[0]

	return (
		<section className='grid min-h-screen bg-slate-100 xl:grid-cols-[minmax(0,1fr)_40rem]'>
			<div className='px-4 py-7 sm:px-6 lg:px-7'>
				<h1 className='font-bold text-3xl tracking-normal'>
					Обращения (3 новых)
				</h1>
				<div className='mt-5 space-y-4'>
					{inquiries.map(inquiry => (
						<InquiryListItem
							inquiry={inquiry}
							isSelected={inquiry.id === selectedInquiry.id}
							key={inquiry.id}
							onSelect={setSelectedInquiryId}
						/>
					))}
				</div>
			</div>
			<InquiryDetails inquiry={selectedInquiry} />
		</section>
	)
}

interface InquiryListItemProperties {
	inquiry: Inquiry
	isSelected: boolean
	onSelect: (inquiryId: string) => void
}

function InquiryListItem({
	inquiry,
	isSelected,
	onSelect
}: InquiryListItemProperties) {
	const handleSelect = useCallback(() => {
		onSelect(inquiry.id)
	}, [inquiry.id, onSelect])

	return (
		<button
			className={cn(
				'w-full rounded-lg border bg-background p-4 text-left shadow-xs transition hover:border-blue-300',
				isSelected && 'border-red-500'
			)}
			onClick={handleSelect}
			type='button'
		>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<p className='font-semibold'>{inquiry.subject}</p>
					<p className='mt-2 text-slate-500 text-sm italic'>
						{inquiry.name} · {inquiry.email}
					</p>
				</div>
				<StatusBadge {...inquiryStatusMeta[inquiry.status]} />
			</div>
			<p className='mt-3 line-clamp-1 text-slate-500 text-sm italic'>
				{inquiry.message}
			</p>
			<p className='mt-3 text-slate-400 text-xs italic'>{inquiry.createdAt}</p>
		</button>
	)
}

function InquiryDetails({inquiry}: {inquiry: Inquiry}) {
	return (
		<aside className='border-slate-200 border-l bg-background px-4 py-8 sm:px-6 lg:px-8'>
			<div className='flex items-start justify-between gap-4'>
				<h2 className='font-bold text-2xl'>{inquiry.subject}</h2>
				<StatusBadge {...inquiryStatusMeta[inquiry.status]} />
			</div>

			<section className='mt-6 rounded-lg bg-slate-50 p-5'>
				<p className='font-semibold text-slate-400 text-sm'>Отправитель</p>
				<p className='mt-2 font-semibold'>{inquiry.name}</p>
				<p className='mt-2 text-slate-500 text-sm'>
					{inquiry.phone}
					<span className='mx-3 text-slate-300'>·</span>
					<a
						className='text-blue-600 hover:underline'
						href={`mailto:${inquiry.email}`}
					>
						{inquiry.email}
					</a>
				</p>
				<p className='mt-2 text-slate-400 text-sm italic'>
					{inquiry.createdAt}
				</p>
			</section>

			<section className='mt-6 rounded-lg border p-5'>
				<p className='font-semibold text-slate-400 text-sm'>Текст обращения</p>
				<p className='mt-3 italic leading-7'>{inquiry.message}</p>
			</section>

			<section className='mt-6 rounded-lg border bg-slate-50 p-5'>
				<h3 className='font-semibold'>Изменить статус</h3>
				<div className='mt-4 flex flex-wrap gap-2'>
					{(['new', 'processing', 'answered', 'closed', 'spam'] as const).map(
						status => (
							<button
								className={cn(
									'h-9 rounded-md border bg-background px-3 font-medium text-slate-500 text-sm transition hover:bg-slate-100',
									status === inquiry.status && 'border-red-500 text-red-500'
								)}
								key={status}
								type='button'
							>
								{inquiryStatusMeta[status].label}
							</button>
						)
					)}
				</div>
			</section>
		</aside>
	)
}

interface AdminAuthProperties {
	mode: 'login' | 'register'
}

function AdminAuth({mode}: AdminAuthProperties) {
	const isRegister = mode === 'register'
	const title = isRegister ? 'Регистрация администратора' : 'Вход в админку'
	const description = isRegister
		? 'Создайте учетную запись для управления каталогом и заказами.'
		: 'Авторизуйтесь, чтобы перейти к управлению магазином.'

	return (
		<>
			<Head title={`${title} - ЛампоЗавод`} />
			<main className='min-h-screen bg-slate-100 px-4 py-8'>
				<div className='mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border bg-background shadow-sm lg:grid-cols-[minmax(0,1fr)_27rem]'>
					<section className='flex flex-col justify-between bg-[#17191d] p-8 text-white'>
						<AdminLogo compact={true} />
						<div className='max-w-xl py-16'>
							<p className='font-semibold text-blue-400 text-sm uppercase tracking-[0.22em]'>
								Панель управления
							</p>
							<h1 className='mt-5 font-bold text-4xl tracking-normal'>
								Каталог, заказы и обращения в одном рабочем пространстве
							</h1>
							<p className='mt-5 text-slate-300'>
								Пока это только верстка: формы и статусы подготовлены под
								подключение к бэкенду на следующем шаге.
							</p>
						</div>
						<div className='grid gap-3 text-slate-300 text-sm sm:grid-cols-3'>
							<AuthFeature icon={Package} label='Товары' />
							<AuthFeature icon={Truck} label='Заказы' />
							<AuthFeature icon={MessageSquare} label='Обращения' />
						</div>
					</section>

					<section className='flex items-center px-6 py-10 sm:px-10'>
						<form className='w-full' onSubmit={preventFormSubmit}>
							<div className='mb-8'>
								<div className='mb-5 inline-flex rounded-md border bg-slate-50 p-1'>
									<AuthModeLink active={!isRegister} to='/admin/login'>
										Вход
									</AuthModeLink>
									<AuthModeLink active={isRegister} to='/admin/register'>
										Регистрация
									</AuthModeLink>
								</div>
								<h2 className='font-bold text-3xl tracking-normal'>{title}</h2>
								<p className='mt-3 text-slate-500 text-sm'>{description}</p>
							</div>

							<div className='grid gap-4'>
								{isRegister ? (
									<FormField label='Имя администратора'>
										<Input
											aria-label='Имя администратора'
											autoComplete='name'
											className='h-11'
											placeholder='Иван Петров'
										/>
									</FormField>
								) : null}
								<FormField label='E-mail'>
									<Input
										aria-label='E-mail'
										autoComplete='email'
										className='h-11'
										placeholder='admin@lampozavod.ru'
										type='email'
									/>
								</FormField>
								<FormField label='Пароль'>
									<Input
										aria-label='Пароль'
										autoComplete={
											isRegister ? 'new-password' : 'current-password'
										}
										className='h-11'
										placeholder='Введите пароль'
										type='password'
									/>
								</FormField>
								{isRegister ? (
									<FormField label='Повторите пароль'>
										<Input
											aria-label='Повторите пароль'
											autoComplete='new-password'
											className='h-11'
											placeholder='Повторите пароль'
											type='password'
										/>
									</FormField>
								) : (
									<label className='flex items-center gap-2 text-slate-500 text-sm'>
										<input className='size-4 accent-blue-600' type='checkbox' />
										Запомнить меня
									</label>
								)}
							</div>

							<Link
								className='mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-sm text-white shadow-xs transition hover:bg-blue-700'
								to='/admin/dashboard'
							>
								{isRegister ? (
									<UserPlus aria-hidden={true} className='size-4' />
								) : (
									<BadgeCheck aria-hidden={true} className='size-4' />
								)}
								{isRegister ? 'Создать аккаунт' : 'Войти'}
							</Link>
							<Link
								className='mt-3 inline-flex h-10 w-full items-center justify-center rounded-md text-slate-500 text-sm transition hover:bg-slate-50 hover:text-foreground'
								to='/catalog'
							>
								Вернуться в каталог
							</Link>
						</form>
					</section>
				</div>
			</main>
		</>
	)
}

function AuthModeLink({
	active,
	children,
	to
}: {
	active: boolean
	children: ReactNode
	to: string
}) {
	return (
		<Link
			className={cn(
				'rounded-sm px-4 py-2 font-medium text-sm transition',
				active
					? 'bg-background text-foreground shadow-xs'
					: 'text-slate-500 hover:text-foreground'
			)}
			to={to}
		>
			{children}
		</Link>
	)
}

function AuthFeature({icon: Icon, label}: {icon: LucideIcon; label: string}) {
	return (
		<div className='flex items-center gap-2 rounded-md bg-white/5 px-3 py-2'>
			<Icon aria-hidden={true} className='size-4 text-blue-400' />
			<span>{label}</span>
		</div>
	)
}

export function AdminLogin() {
	return <AdminAuth mode='login' />
}

export function AdminRegister() {
	return <AdminAuth mode='register' />
}

export {AdminLayout}
