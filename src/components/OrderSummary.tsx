import {skipToken} from '@reduxjs/toolkit/query'
import {RefreshCw} from 'lucide-react'
import type {ReactNode} from 'react'
import {useMemo} from 'react'
import {formatPrice} from '@/lib/format'
import {
	type DeliveryType,
	useCalculateCartQuery
} from '@/services/orderManagementApi'
import {
	selectCartItems,
	selectCartQuantity,
	selectCartSubtotal
} from '@/store/cartSlice'
import {useAppSelector} from '@/store/hooks'

interface OrderSummaryProperties {
	action?: ReactNode
	deliveryType?: DeliveryType
	note?: ReactNode
}

export function OrderSummary({
	action,
	deliveryType = 'delivery',
	note
}: OrderSummaryProperties) {
	const cartItems = useAppSelector(selectCartItems)
	const quantity = useAppSelector(selectCartQuantity)
	const subtotal = useAppSelector(selectCartSubtotal)

	const cartCalculationRequest = useMemo(
		() =>
			cartItems.length === 0
				? skipToken
				: {
						deliveryType,
						items: cartItems.map(item => ({
							productId: item.productId,
							quantity: item.quantity
						}))
					},
		[cartItems, deliveryType]
	)
	const cartCalculation = useCalculateCartQuery(cartCalculationRequest)
	const calculatedSubtotal = Number(
		cartCalculation.data?.subtotalAmount ?? subtotal
	)
	const calculatedTotal = Number(
		cartCalculation.data?.totalAmount ?? calculatedSubtotal
	)
	const deliveryAmount = cartCalculation.data?.deliveryAmount
	const calculationErrors = Array.from(
		new Set([
			...(cartCalculation.data?.errors ?? []),
			...(cartCalculation.data?.items ?? [])
				.map(item => item.error)
				.filter((error): error is string => Boolean(error))
		])
	)

	return (
		<aside className='rounded-md border bg-card p-6 text-card-foreground shadow-xs'>
			<h2 className='font-bold text-xl'>Итого</h2>
			<div className='mt-5 space-y-4 border-b pb-5'>
				<div className='flex items-center justify-between gap-4 text-sm'>
					<span className='text-muted-foreground'>Товары ({quantity} шт.)</span>
					<span className='font-medium'>{formatPrice(calculatedSubtotal)}</span>
				</div>
				<div className='flex items-center justify-between gap-4 text-sm'>
					<span className='text-muted-foreground'>Доставка</span>
					<span className='font-medium text-muted-foreground'>
						{deliveryAmount
							? formatPrice(Number(deliveryAmount))
							: 'Уточняется'}
					</span>
				</div>
			</div>
			<div className='mt-5 flex items-center justify-between gap-4'>
				<span className='font-semibold'>К оплате</span>
				<span className='font-bold text-2xl'>
					{formatPrice(calculatedTotal)}
				</span>
			</div>
			{cartCalculation.isFetching ? (
				<p className='mt-4 flex items-center gap-2 text-muted-foreground text-sm'>
					<RefreshCw aria-hidden={true} className='size-4 animate-spin' />
					Пересчитываем корзину...
				</p>
			) : null}
			{cartCalculation.isError ? (
				<p className='mt-4 text-destructive text-sm' role='alert'>
					Не удалось пересчитать корзину в order-management-service.
				</p>
			) : null}
			{calculationErrors.length > 0 ? (
				<ul className='mt-4 space-y-1 text-destructive text-sm'>
					{calculationErrors.map(error => (
						<li key={error}>{error}</li>
					))}
				</ul>
			) : null}
			{action ? <div className='mt-5'>{action}</div> : null}
			{note ? (
				<p className='mt-5 text-muted-foreground text-sm'>{note}</p>
			) : null}
		</aside>
	)
}
