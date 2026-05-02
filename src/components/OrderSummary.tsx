import type {ReactNode} from 'react'
import {formatPrice} from '@/lib/format'
import {selectCartQuantity, selectCartSubtotal} from '@/store/cartSlice'
import {useAppSelector} from '@/store/hooks'

interface OrderSummaryProperties {
	action?: ReactNode
	note?: ReactNode
}

export function OrderSummary({action, note}: OrderSummaryProperties) {
	const quantity = useAppSelector(selectCartQuantity)
	const subtotal = useAppSelector(selectCartSubtotal)

	return (
		<aside className='rounded-md border bg-card p-6 text-card-foreground shadow-xs'>
			<h2 className='font-bold text-xl'>Итого</h2>
			<div className='mt-5 space-y-4 border-b pb-5'>
				<div className='flex items-center justify-between gap-4 text-sm'>
					<span className='text-muted-foreground'>Товары ({quantity} шт.)</span>
					<span className='font-medium'>{formatPrice(subtotal)}</span>
				</div>
				<div className='flex items-center justify-between gap-4 text-sm'>
					<span className='text-muted-foreground'>Доставка</span>
					<span className='font-medium text-muted-foreground'>Уточняется</span>
				</div>
			</div>
			<div className='mt-5 flex items-center justify-between gap-4'>
				<span className='font-semibold'>К оплате</span>
				<span className='font-bold text-2xl'>{formatPrice(subtotal)}</span>
			</div>
			{action ? <div className='mt-5'>{action}</div> : null}
			{note ? (
				<p className='mt-5 text-muted-foreground text-sm'>{note}</p>
			) : null}
		</aside>
	)
}
