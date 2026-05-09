import {Check, ShoppingBag} from 'lucide-react'
import {useEffect} from 'react'
import {Link, Navigate, useLocation} from 'react-router'
import {CheckoutHeader} from '@/components/CheckoutHeader'
import {Head} from '@/components/Head'
import {formatPrice} from '@/lib/format'
import type {OrderResponse} from '@/services/orderManagementApi'
import {clearCart} from '@/store/cartSlice'
import {useAppDispatch} from '@/store/hooks'

interface OrderConfirmationLocationState {
	order?: OrderResponse
}

export function OrderConfirmation() {
	const dispatch = useAppDispatch()
	const location = useLocation()
	const order = (location.state as null | OrderConfirmationLocationState)?.order

	useEffect(() => {
		if (order) {
			dispatch(clearCart())
		}
	}, [dispatch, order])

	if (!order) {
		return <Navigate replace={true} to='/catalog' />
	}

	return (
		<>
			<Head title='Заказ оформлен — ЛампоЗавод' />
			<CheckoutHeader currentStep='confirmation' />
			<main className='flex min-h-screen items-start justify-center bg-muted/40 px-4 py-16'>
				<section className='w-full max-w-2xl rounded-md border bg-background p-8 text-center shadow-xs'>
					<div className='mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600'>
						<Check aria-hidden={true} className='size-8' />
					</div>
					<h1 className='mt-7 font-bold text-2xl'>Заказ успешно оформлен!</h1>
					<p className='mt-5 font-semibold text-primary'>
						Ваш номер заказа: {order.orderNumber}
					</p>
					<p className='mx-auto mt-7 max-w-xl text-muted-foreground italic'>
						Менеджер завода свяжется с вами по указанному телефону или e-mail
						для подтверждения заказа и уточнения деталей доставки.
					</p>

					<div className='my-7 border-t' />
					<h2 className='font-semibold'>Состав заказа</h2>
					<div className='mt-5 space-y-4 text-left'>
						{order.items.map(item => (
							<div
								className='flex items-center justify-between gap-4'
								key={item.id}
							>
								<span className='text-muted-foreground italic'>
									{item.productName} — {item.quantity} шт.
								</span>
								<span className='font-medium'>
									{formatPrice(Number(item.lineTotal))}
								</span>
							</div>
						))}
					</div>
					<div className='my-7 border-t' />
					<div className='flex items-center justify-between gap-4 text-left'>
						<span className='font-semibold'>Итого к оплате</span>
						<span className='font-bold text-2xl'>
							{formatPrice(Number(order.totalAmount))}
						</span>
					</div>
					<Link
						className='mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-primary-foreground text-sm shadow-xs transition hover:bg-primary/90'
						to='/catalog'
					>
						<ShoppingBag aria-hidden={true} className='size-4' />
						Вернуться в каталог
					</Link>
				</section>
			</main>
		</>
	)
}
