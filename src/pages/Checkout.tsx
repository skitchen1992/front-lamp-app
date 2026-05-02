import {MapPin} from 'lucide-react'
import {type FormEvent, useCallback} from 'react'
import {Navigate, useNavigate} from 'react-router'
import {CheckoutHeader} from '@/components/CheckoutHeader'
import {Head} from '@/components/Head'
import {OrderSummary} from '@/components/OrderSummary'
import {Button} from '@/components/ui/Button'
import {formatPrice} from '@/lib/format'
import {useAppSelector} from '@/store/hooks'
import {selectCartPageData} from './selectors'

export function Checkout() {
	const navigate = useNavigate()

	const {items, lineCount} = useAppSelector(selectCartPageData)

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			navigate('/order-confirmation')
		},
		[navigate]
	)

	if (lineCount === 0) {
		return <Navigate replace={true} to='/cart' />
	}

	return (
		<>
			<Head title='Оформление заказа — ЛампоЗавод' />
			<CheckoutHeader currentStep='details' />
			<main className='min-h-screen bg-muted/40'>
				<form
					className='mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_21rem] lg:px-8'
					onSubmit={handleSubmit}
				>
					<section>
						<h1 className='mb-6 font-bold text-2xl'>
							Контактные данные и доставка
						</h1>
						<div className='grid gap-5 rounded-md border bg-background p-6 sm:grid-cols-2'>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>ФИО / Контактное лицо *</span>
								<input
									className='h-10 rounded-md border bg-background px-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='Иванов Иван Иванович'
									required={true}
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>Телефон *</span>
								<input
									className='h-10 rounded-md border bg-background px-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='+7 (999) 123-45-67'
									required={true}
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>E-mail *</span>
								<input
									className='h-10 rounded-md border bg-background px-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='ivan@example.com'
									required={true}
									type='email'
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>Организация (необязательно)</span>
								<input
									className='h-10 rounded-md border bg-background px-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='ООО «Свет-Электро»'
								/>
							</label>
							<label className='grid gap-2 text-sm sm:col-span-2'>
								<span className='font-medium'>Адрес доставки / самовывоз</span>
								<div className='relative'>
									<MapPin
										aria-hidden={true}
										className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
									/>
									<input
										className='h-10 w-full rounded-md border bg-background px-9 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
										defaultValue='г. Москва, ул. Ленина, 42'
									/>
								</div>
							</label>
							<label className='grid gap-2 text-sm sm:col-span-2'>
								<span className='font-medium'>Комментарий к заказу</span>
								<textarea
									className='min-h-20 resize-none rounded-md border bg-background px-3 py-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='Просьба упаковать в одну коробку...'
								/>
							</label>
						</div>
					</section>
					<div className='space-y-4'>
						<aside className='rounded-md border bg-background p-6'>
							<h2 className='font-bold text-xl'>Ваш заказ</h2>
							<div className='mt-5 space-y-4'>
								{items.map(({product, productId, quantity}) => (
									<div
										className='flex items-start justify-between gap-4 text-sm'
										key={productId}
									>
										<span className='text-muted-foreground italic'>
											{product.shortName} × {quantity}
										</span>
										<span className='font-medium'>
											{formatPrice(product.price * quantity)}
										</span>
									</div>
								))}
							</div>
						</aside>
						<OrderSummary
							action={
								<Button className='h-12 w-full' type='submit'>
									Отправить заказ
								</Button>
							}
							note='Нажимая кнопку, вы соглашаетесь с условиями обработки данных'
						/>
					</div>
				</form>
			</main>
		</>
	)
}
