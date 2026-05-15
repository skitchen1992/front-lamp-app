// biome-ignore-all lint/nursery/noExcessiveLinesPerFile: The order admin page keeps tightly coupled list and detail UI together.
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
	type OrderResponse,
	type OrderStatus,
	type OrderSummaryResponse,
	useGetOrderQuery,
	useListOrdersQuery,
	useUpdateOrderStatusMutation
} from '@/shared/api/orderManagementApi'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {AdminSplitShell} from '../_components/layout'
import {AdminPanel, StatusBadge} from '../_components/shared'
import {orderStatusMeta} from '../_lib/data'

const ORDER_LIST_LIMIT = 100

type OrderStatusFilter = 'all' | OrderStatus

const orderTabs: Array<{label: string; value: OrderStatusFilter}> = [
	{label: 'Все', value: 'all'},
	{label: orderStatusMeta.new.label, value: 'new'},
	{label: orderStatusMeta.confirmed.label, value: 'confirmed'},
	{label: orderStatusMeta.processing.label, value: 'processing'},
	{label: orderStatusMeta.shipped.label, value: 'shipped'},
	{label: orderStatusMeta.completed.label, value: 'completed'},
	{label: orderStatusMeta.canceled.label, value: 'canceled'}
]

const editableOrderStatuses: OrderStatus[] = [
	'new',
	'confirmed',
	'processing',
	'shipped',
	'completed',
	'canceled'
]

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	month: 'long',
	year: 'numeric'
})

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: The admin order screen owns the selected list item and detail action state.
export function AdminOrders() {
	const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('all')
	const [selectedOrderId, setSelectedOrderId] = useState<string>()
	const listStatus = selectedStatus === 'all' ? undefined : selectedStatus
	const ordersQuery = useListOrdersQuery({
		limit: ORDER_LIST_LIMIT,
		page: 1,
		...(listStatus === undefined ? {} : {status: listStatus})
	})
	const orders = useMemo(
		() => ordersQuery.data?.items ?? [],
		[ordersQuery.data?.items]
	)
	const selectedOrderSummary = orders.find(
		order => order.id === selectedOrderId
	)

	useEffect(() => {
		if (orders.length === 0) {
			setSelectedOrderId(undefined)
			return
		}

		if (
			!(selectedOrderId && orders.some(order => order.id === selectedOrderId))
		) {
			const [firstOrder] = orders
			setSelectedOrderId(firstOrder?.id)
		}
	}, [orders, selectedOrderId])

	const selectedOrderQuery = useGetOrderQuery(selectedOrderId ?? '', {
		skip: selectedOrderId === undefined
	})

	const handleStatusSelect = useCallback((status: OrderStatusFilter) => {
		setSelectedStatus(status)
	}, [])

	return (
		<AdminSplitShell
			details={
				<OrderDetailsPane
					isError={selectedOrderQuery.isError}
					isLoading={
						selectedOrderQuery.isLoading || selectedOrderQuery.isFetching
					}
					order={selectedOrderQuery.data}
					orderSummary={selectedOrderSummary}
				/>
			}
			title='Список заказов'
		>
			<OrderStatusTabs
				onSelect={handleStatusSelect}
				selectedStatus={selectedStatus}
			/>

			<OrderListState
				hasError={ordersQuery.isError}
				isLoading={ordersQuery.isLoading || ordersQuery.isFetching}
				onSelect={setSelectedOrderId}
				orders={orders}
				selectedOrderId={selectedOrderId}
				total={ordersQuery.data?.total}
			/>
		</AdminSplitShell>
	)
}

interface OrderStatusTabsProperties {
	onSelect: (status: OrderStatusFilter) => void
	selectedStatus: OrderStatusFilter
}

function OrderStatusTabs({
	onSelect,
	selectedStatus
}: OrderStatusTabsProperties) {
	return (
		<div className='flex gap-2 overflow-x-auto'>
			{orderTabs.map(tab => (
				<OrderStatusTabButton
					isSelected={tab.value === selectedStatus}
					key={tab.value}
					label={tab.label}
					onSelect={onSelect}
					value={tab.value}
				/>
			))}
		</div>
	)
}

interface OrderStatusTabButtonProperties {
	isSelected: boolean
	label: string
	onSelect: (status: OrderStatusFilter) => void
	value: OrderStatusFilter
}

function OrderStatusTabButton({
	isSelected,
	label,
	onSelect,
	value
}: OrderStatusTabButtonProperties) {
	const handleSelect = useCallback(() => {
		onSelect(value)
	}, [onSelect, value])

	return (
		<button
			className={cn(
				'h-9 shrink-0 rounded-md border px-4 font-medium text-sm transition',
				isSelected
					? 'border-blue-600 bg-blue-600 text-white'
					: 'bg-background text-slate-500 hover:bg-slate-50'
			)}
			onClick={handleSelect}
			type='button'
		>
			{label}
		</button>
	)
}

interface OrderListStateProperties {
	hasError: boolean
	isLoading: boolean
	onSelect: (orderId: string) => void
	orders: OrderSummaryResponse[]
	selectedOrderId: string | undefined
	total: number | undefined
}

function OrderListState({
	hasError,
	isLoading,
	onSelect,
	orders,
	selectedOrderId,
	total
}: OrderListStateProperties) {
	if (isLoading) {
		return (
			<p
				className='mt-6 rounded-md border border-slate-200 bg-background p-4 text-slate-500 text-sm'
				role='status'
			>
				Загружаем заказы...
			</p>
		)
	}

	if (hasError) {
		return (
			<p
				className='mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-600 text-sm'
				role='alert'
			>
				Не удалось загрузить заказы из order-management.
			</p>
		)
	}

	if (orders.length === 0) {
		return (
			<p className='mt-6 rounded-md border border-slate-200 bg-background p-4 text-slate-500 text-sm'>
				Заказы не найдены.
			</p>
		)
	}

	return (
		<div className='mt-6 space-y-4'>
			{total === undefined ? null : (
				<p className='text-slate-500 text-sm'>Найдено заказов: {total}</p>
			)}
			{orders.map(order => (
				<OrderListItem
					isSelected={order.id === selectedOrderId}
					key={order.id}
					onSelect={onSelect}
					order={order}
				/>
			))}
		</div>
	)
}

interface OrderListItemProperties {
	isSelected: boolean
	onSelect: (orderId: string) => void
	order: OrderSummaryResponse
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
					{formatOrderDate(order.createdAt)} · {order.phone}
				</p>
			</div>
			<p className='self-center font-bold text-xl'>
				{formatOrderPrice(order.totalAmount)}
			</p>
		</button>
	)
}

interface OrderDetailsPaneProperties {
	isError: boolean
	isLoading: boolean
	order: OrderResponse | undefined
	orderSummary: OrderSummaryResponse | undefined
}

function OrderDetailsPane({
	isError,
	isLoading,
	order,
	orderSummary
}: OrderDetailsPaneProperties) {
	if (isLoading) {
		return (
			<p
				className='rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-500 text-sm'
				role='status'
			>
				Загружаем детали заказа...
			</p>
		)
	}

	if (isError) {
		return (
			<p
				className='rounded-md border border-red-200 bg-red-50 p-4 text-red-600 text-sm'
				role='alert'
			>
				Не удалось загрузить выбранный заказ.
			</p>
		)
	}

	if (!order) {
		return (
			<p className='rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-500 text-sm'>
				Выберите заказ из списка.
			</p>
		)
	}

	return <OrderDetails order={order} orderSummary={orderSummary} />
}

interface OrderDetailsProperties {
	order: OrderResponse
	orderSummary: OrderSummaryResponse | undefined
}

function OrderDetails({order, orderSummary}: OrderDetailsProperties) {
	const [actionError, setActionError] = useState<string | undefined>()
	const [updateOrderStatus, updateOrderStatusState] =
		useUpdateOrderStatusMutation()

	const handleStatusChange = useCallback(
		async (status: OrderStatus) => {
			if (status === order.status) {
				return
			}

			setActionError(undefined)

			try {
				await updateOrderStatus({orderId: order.id, status}).unwrap()
			} catch (error) {
				setActionError(getOrderActionErrorMessage(error))
			}
		},
		[order.id, order.status, updateOrderStatus]
	)

	return (
		<>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h2 className='font-bold text-2xl'>Заказ #{order.orderNumber}</h2>
					<p className='mt-5 text-slate-400 text-sm italic'>
						{formatOrderDate(order.createdAt)}
					</p>
					{orderSummary ? (
						<p className='mt-2 text-slate-500 text-sm'>
							В списке обновлен {formatOrderDate(orderSummary.updatedAt)}
						</p>
					) : null}
				</div>
				<StatusBadge {...orderStatusMeta[order.status]} />
			</div>

			<AdminPanel className='mt-6 bg-slate-50 p-4'>
				<h3 className='font-semibold'>Изменить статус</h3>
				<div className='mt-3 flex flex-wrap gap-2'>
					{editableOrderStatuses.map(status => (
						<OrderStatusActionButton
							currentStatus={order.status}
							isLoading={updateOrderStatusState.isLoading}
							key={status}
							onSelect={handleStatusChange}
							status={status}
						/>
					))}
				</div>
				{actionError ? (
					<p className='mt-3 text-red-600 text-sm' role='alert'>
						{actionError}
					</p>
				) : null}
			</AdminPanel>

			<AdminPanel className='mt-6 p-4'>
				<h3 className='font-semibold'>Контактные данные</h3>
				<dl className='mt-4 grid gap-3 text-sm'>
					<DetailRow label='Клиент' value={order.customerName} />
					<DetailRow label='Компания' value={order.companyName} />
					<DetailRow label='Телефон' value={order.phone} />
					<DetailRow label='E-mail' value={order.email} />
					<DetailRow label='Адрес' value={order.deliveryAddress} />
					<DetailRow label='Комментарий' value={order.comment} />
				</dl>
			</AdminPanel>

			<AdminPanel className='mt-5 overflow-hidden'>
				<div className='border-b px-4 py-3'>
					<h3 className='font-semibold'>Состав заказа</h3>
				</div>
				<div className='divide-y'>
					{order.items.map(item => (
						<div
							className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3 text-sm'
							key={item.id}
						>
							<p className='italic'>
								{item.productName} · {item.quantity} шт. ×{' '}
								{formatOrderPrice(item.unitPrice)}
							</p>
							<p className='font-bold'>{formatOrderPrice(item.lineTotal)}</p>
						</div>
					))}
					<div className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3 text-sm'>
						<p className='text-slate-500'>Доставка</p>
						<p className='font-bold'>
							{formatOrderPrice(order.deliveryAmount)}
						</p>
					</div>
					<div className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-4'>
						<p className='font-bold'>Итого</p>
						<p className='font-bold text-2xl'>
							{formatOrderPrice(order.totalAmount)}
						</p>
					</div>
				</div>
			</AdminPanel>
		</>
	)
}

interface OrderStatusActionButtonProperties {
	currentStatus: OrderStatus
	isLoading: boolean
	onSelect: (status: OrderStatus) => void
	status: OrderStatus
}

function OrderStatusActionButton({
	currentStatus,
	isLoading,
	onSelect,
	status
}: OrderStatusActionButtonProperties) {
	const handleSelect = useCallback(() => {
		onSelect(status)
	}, [onSelect, status])

	return (
		<button
			aria-pressed={status === currentStatus}
			className={getStatusButtonClass(status, currentStatus)}
			disabled={isLoading}
			onClick={handleSelect}
			type='button'
		>
			{orderStatusMeta[status].label}
		</button>
	)
}

function DetailRow({
	label,
	value
}: {
	label: string
	value: null | string | undefined
}) {
	return (
		<div className='grid grid-cols-[7rem_minmax(0,1fr)] gap-4'>
			<dt className='text-slate-500 italic'>{label}</dt>
			<dd className='text-right font-medium'>{value || 'Не указано'}</dd>
		</div>
	)
}

function getStatusButtonClass(status: OrderStatus, currentStatus: OrderStatus) {
	return cn(
		'h-9 rounded-md border bg-background px-3 font-medium text-slate-500 text-sm transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-60',
		status === currentStatus && 'border-amber-500 text-amber-600',
		status === 'canceled' && 'border-red-200 text-red-500 hover:bg-red-50'
	)
}

function formatOrderPrice(value: string) {
	return formatPrice(Number(value))
}

function formatOrderDate(value: string) {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		return value
	}

	return dateFormatter.format(date)
}

function getOrderActionErrorMessage(error: unknown) {
	if (isFetchBaseQueryError(error)) {
		if (error.status === 401) {
			return 'Сессия администратора истекла. Войдите в админку заново.'
		}
		if (error.status === 404) {
			return 'Заказ не найден на сервере.'
		}
		if (error.status === 422) {
			return 'Сервер не принял новый статус заказа.'
		}
	}

	return 'Не удалось обновить статус заказа. Попробуйте еще раз.'
}

function isFetchBaseQueryError(
	error: unknown
): error is {status: number | string} {
	return typeof error === 'object' && error !== null && 'status' in error
}
