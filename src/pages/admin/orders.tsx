import {useCallback, useState} from 'react'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {type AdminOrder, adminOrders, orderStatusMeta} from './data'
import {StatusBadge} from './shared'

const orderTabs = [
	{label: 'Все (42)', value: 'all'},
	{label: 'Новые (7)', value: 'new'},
	{label: 'В работе (12)', value: 'processing'},
	{label: 'Завершенные (20)', value: 'completed'}
]

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
