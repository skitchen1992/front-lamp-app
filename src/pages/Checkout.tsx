import {MapPin} from 'lucide-react'
import {type ChangeEvent, type FormEvent, useCallback, useState} from 'react'
import {Navigate, useNavigate} from 'react-router'
import {CheckoutHeader} from '@/components/CheckoutHeader'
import {Head} from '@/components/Head'
import {OrderSummary} from '@/components/OrderSummary'
import {Button} from '@/components/ui/Button'
import {Input} from '@/components/ui/input'
import {formatPrice} from '@/lib/format'
import {
	type DeliveryType,
	useCreateOrderMutation
} from '@/services/orderManagementApi'
import {useAppSelector} from '@/store/hooks'
import {selectCartPageData} from '@/store/cartSlice'

export function Checkout() {
	const navigate = useNavigate()
	const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')
	const [createOrder, createOrderResult] = useCreateOrderMutation()

	const {items, lineCount} = useAppSelector(selectCartPageData)

	const handleDeliveryTypeChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setDeliveryType(event.target.value as DeliveryType)
		},
		[]
	)

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			const formData = new FormData(event.currentTarget)
			try {
				const order = await createOrder({
					comment: String(formData.get('comment') as string).trim(),
					companyName: String(formData.get('companyName') as string).trim(),
					customerName: String(formData.get('customerName') as string).trim(),
					deliveryAddress: String(
						formData.get('deliveryAddress') as string
					).trim(),
					deliveryType,
					email: String(formData.get('email') as string).trim(),
					items: items.map(({productId, quantity}) => ({productId, quantity})),
					phone: String(formData.get('phone') as string).trim()
				}).unwrap()

				navigate('/order-confirmation', {state: {order}})
			} catch {
				// RTK Query keeps the mutation error in state for the inline alert.
			}
		},
		[createOrder, deliveryType, items]
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
								<Input
									className='h-10 bg-background'
									defaultValue='Иванов Иван Иванович'
									name='customerName'
									required={true}
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>Телефон *</span>
								<Input
									className='h-10 bg-background'
									defaultValue='+7 (999) 123-45-67'
									name='phone'
									required={true}
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>E-mail *</span>
								<Input
									className='h-10 bg-background'
									defaultValue='ivan@example.com'
									name='email'
									required={true}
									type='email'
								/>
							</label>
							<label className='grid gap-2 text-sm'>
								<span className='font-medium'>Организация (необязательно)</span>
								<Input
									className='h-10 bg-background'
									defaultValue='ООО «Свет-Электро»'
									name='companyName'
								/>
							</label>
							<label className='grid gap-2 text-sm sm:col-span-2'>
								<span className='font-medium'>Способ получения *</span>
								<select
									className='h-10 rounded-md border bg-background px-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									name='deliveryType'
									onChange={handleDeliveryTypeChange}
									required={true}
									value={deliveryType}
								>
									<option value='delivery'>Доставка</option>
									<option value='pickup'>Самовывоз</option>
								</select>
							</label>
							<label className='grid gap-2 text-sm sm:col-span-2'>
								<span className='font-medium'>Адрес доставки / самовывоз</span>
								<div className='relative'>
									<MapPin
										aria-hidden={true}
										className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
									/>
									<Input
										className='h-10 bg-background pl-9'
										defaultValue='г. Москва, ул. Ленина, 42'
										name='deliveryAddress'
									/>
								</div>
							</label>
							<label className='grid gap-2 text-sm sm:col-span-2'>
								<span className='font-medium'>Комментарий к заказу</span>
								<textarea
									className='min-h-20 resize-none rounded-md border bg-background px-3 py-3 outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
									defaultValue='Просьба упаковать в одну коробку...'
									name='comment'
								/>
							</label>
							{createOrderResult.isError ? (
								<p
									className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm sm:col-span-2'
									role='alert'
								>
									Не удалось создать заказ. Проверьте данные и доступность
									order-management-service.
								</p>
							) : null}
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
								<Button
									className='h-12 w-full'
									disabled={createOrderResult.isLoading}
									type='submit'
								>
									{createOrderResult.isLoading
										? 'Отправляем заказ...'
										: 'Отправить заказ'}
								</Button>
							}
							deliveryType={deliveryType}
							note='Нажимая кнопку, вы соглашаетесь с условиями обработки данных'
						/>
					</div>
				</form>
			</main>
		</>
	)
}
