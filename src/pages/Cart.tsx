import {ArrowRight, ShoppingBag, Trash2} from 'lucide-react'
import {useCallback} from 'react'
import {Link} from 'react-router'
import {Head} from '@/components/Head'
import {OrderSummary} from '@/components/OrderSummary'
import {QuantityStepper} from '@/components/QuantityStepper'
import {StoreHeader} from '@/components/StoreHeader'
import {Button} from '@/components/ui/Button'
import type {Product} from '@/data/products'
import {formatCartLineCount, formatPrice} from '@/lib/format'
import {
	clearCart,
	decrementCartItem,
	incrementCartItem,
	removeCartItem
} from '@/store/cartSlice'
import {useAppDispatch, useAppSelector} from '@/store/hooks'
import {selectCartPageData} from './selectors'

interface CartLineItemProperties {
	product: Product
	productId: string
	quantity: number
}

function CartLineItem({product, productId, quantity}: CartLineItemProperties) {
	const dispatch = useAppDispatch()

	const handleDecrement = useCallback(() => {
		dispatch(decrementCartItem(productId))
	}, [productId])

	const handleIncrement = useCallback(() => {
		dispatch(incrementCartItem(productId))
	}, [productId])

	const handleRemove = useCallback(() => {
		dispatch(removeCartItem(productId))
	}, [productId])

	return (
		<article className='grid gap-4 rounded-md border bg-background p-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center'>
			<img
				alt={product.image.alt}
				className='size-20 rounded-md object-cover'
				height={80}
				src={product.image.src}
				width={80}
			/>
			<div>
				<h2 className='font-semibold'>{product.shortName}</h2>
				<p className='mt-1 text-muted-foreground text-sm italic'>
					Арт. {product.sku}
				</p>
				<p className='mt-1 text-muted-foreground text-sm'>
					{formatPrice(product.price)} / шт.
				</p>
			</div>
			<div className='flex items-center justify-between gap-4 sm:flex-col sm:items-end'>
				<QuantityStepper
					onDecrement={handleDecrement}
					onIncrement={handleIncrement}
					quantity={quantity}
				/>
				<p className='font-bold text-lg'>
					{formatPrice(product.price * quantity)}
				</p>
				<Button
					aria-label={`Удалить ${product.shortName}`}
					className='text-destructive hover:text-destructive'
					onClick={handleRemove}
					size='icon'
					variant='ghost'
				>
					<Trash2 aria-hidden={true} className='size-4' />
				</Button>
			</div>
		</article>
	)
}

export function Cart() {
	const dispatch = useAppDispatch()

	const {items, lineCount} = useAppSelector(selectCartPageData)

	const handleClearCart = useCallback(() => {
		dispatch(clearCart())
	}, [])

	return (
		<>
			<Head title='Корзина — ЛампоЗавод' />
			<StoreHeader />
			<main className='min-h-screen bg-muted/40'>
				<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
					<div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
						<h1 className='font-bold text-2xl'>
							Корзина — {formatCartLineCount(lineCount)}
						</h1>
						<Link
							className='inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-4 font-medium text-sm shadow-xs transition hover:bg-accent'
							to='/catalog'
						>
							<ShoppingBag aria-hidden={true} className='size-4' />
							Продолжить покупки
						</Link>
					</div>

					{items.length === 0 ? (
						<section className='rounded-md border bg-background p-10 text-center'>
							<h2 className='font-semibold text-xl'>Корзина пуста</h2>
							<p className='mt-2 text-muted-foreground'>
								Каталог уже рядом, можно собрать заказ заново.
							</p>
							<Link
								className='mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm shadow-xs transition hover:bg-primary/90'
								to='/catalog'
							>
								Вернуться в каталог
							</Link>
						</section>
					) : (
						<div className='grid gap-6 lg:grid-cols-[1fr_21rem]'>
							<section className='space-y-3'>
								{items.map(({product, productId, quantity}) => (
									<CartLineItem
										key={productId}
										product={product}
										productId={productId}
										quantity={quantity}
									/>
								))}
								<div className='flex justify-end'>
									<Button
										className='text-destructive hover:text-destructive'
										onClick={handleClearCart}
										variant='outline'
									>
										<Trash2 aria-hidden={true} className='size-4' />
										Очистить корзину
									</Button>
								</div>
							</section>
							<OrderSummary
								action={
									<Link
										className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-medium text-primary-foreground text-sm shadow-xs transition hover:bg-primary/90'
										to='/checkout'
									>
										Оформить заказ
										<ArrowRight aria-hidden={true} className='size-4' />
									</Link>
								}
								note='Цены актуальны на момент оформления. Перед созданием заказа корзина пересчитывается по текущим ценам.'
							/>
						</div>
					)}
				</div>
			</main>
		</>
	)
}
