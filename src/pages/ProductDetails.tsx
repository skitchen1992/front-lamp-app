import {ChevronRight, ShoppingCart} from 'lucide-react'
import {useCallback, useState} from 'react'
import {Link, Navigate, useParams} from 'react-router'
import {Head} from '@/components/Head'
import {QuantityStepper} from '@/components/QuantityStepper'
import {StoreHeader} from '@/components/StoreHeader'
import {Badge} from '@/components/ui/Badge'
import {Button} from '@/components/ui/Button'
import {findProductBySlug, type ProductImage} from '@/data/products'
import {formatPrice} from '@/lib/format'
import {addToCart} from '@/store/cartSlice'
import {useAppDispatch} from '@/store/hooks'

interface ProductThumbnailProperties {
	image: ProductImage
	isSelected: boolean
	onSelect: (src: string) => void
}

function ProductThumbnail({
	image,
	isSelected,
	onSelect
}: ProductThumbnailProperties) {
	const handleClick = useCallback(() => {
		onSelect(image.src)
	}, [image.src, onSelect])

	return (
		<button
			className='size-16 overflow-hidden rounded-md border bg-background p-1 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[selected=true]:border-primary'
			data-selected={isSelected}
			onClick={handleClick}
			type='button'
		>
			<img
				alt={image.alt}
				className='size-full rounded-sm object-cover'
				height={56}
				src={image.src}
				width={56}
			/>
		</button>
	)
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Product page keeps the purchase block and specs together for readability.
export function ProductDetails() {
	const dispatch = useAppDispatch()
	const {productSlug} = useParams()

	const product = findProductBySlug(productSlug)
	const productId = product ? product.id : ''

	const [quantity, setQuantity] = useState(1)
	const [selectedImageSrc, setSelectedImageSrc] = useState('')

	const handleImageSelect = useCallback((src: string) => {
		setSelectedImageSrc(src)
	}, [])

	const handleDecrement = useCallback(() => {
		setQuantity(currentQuantity => Math.max(1, currentQuantity - 1))
	}, [])

	const handleIncrement = useCallback(() => {
		setQuantity(currentQuantity => currentQuantity + 1)
	}, [])

	const handleAddToCart = useCallback(() => {
		dispatch(addToCart({productId, quantity}))
	}, [productId, quantity])

	if (!product) {
		return <Navigate replace={true} to='/catalog' />
	}

	const selectedImage =
		product.gallery.find(image => image.src === selectedImageSrc) ??
		product.gallery[0]
	const badgeVariant = product.status === 'low' ? 'warning' : 'success'

	return (
		<>
			<Head title={`${product.shortName} — ЛампоЗавод`} />
			<StoreHeader />
			<main className='min-h-screen bg-muted/40'>
				<div className='border-b bg-background'>
					<nav
						aria-label='Хлебные крошки'
						className='mx-auto flex h-11 max-w-7xl items-center gap-2 px-4 text-sm sm:px-6 lg:px-8'
					>
						<Link
							className='text-muted-foreground hover:text-foreground'
							to='/catalog'
						>
							Главная
						</Link>
						<ChevronRight
							aria-hidden={true}
							className='size-4 text-muted-foreground'
						/>
						<span className='text-muted-foreground'>
							{product.categoryLabel}
						</span>
						<ChevronRight
							aria-hidden={true}
							className='size-4 text-muted-foreground'
						/>
						<span className='truncate font-medium'>{product.shortName}</span>
					</nav>
				</div>

				<section className='mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,28rem)_1fr] lg:px-8'>
					<div>
						<div className='overflow-hidden rounded-md border bg-background'>
							<img
								alt={selectedImage.alt}
								className='aspect-[4/3] size-full object-cover'
								height={405}
								src={selectedImage.src}
								width={540}
							/>
						</div>
						<div className='mt-3 flex gap-2'>
							{product.gallery.map(image => (
								<ProductThumbnail
									image={image}
									isSelected={image.src === selectedImage.src}
									key={image.src}
									onSelect={handleImageSelect}
								/>
							))}
						</div>
					</div>

					<div>
						<p className='text-muted-foreground text-sm italic'>
							Артикул: {product.sku}
						</p>
						<h1 className='mt-4 max-w-3xl font-bold text-3xl tracking-normal'>
							{product.name}
						</h1>
						<div className='mt-4 flex items-center gap-2'>
							<Badge variant={badgeVariant}>{product.statusLabel}</Badge>
							<span className='text-emerald-600 text-sm'>
								{product.stock} шт.
							</span>
						</div>
						<p className='mt-5 font-bold text-4xl'>
							{formatPrice(product.price)} / шт.
						</p>
						<p className='mt-4 text-muted-foreground text-sm italic'>
							Цена без НДС. При заказе от 1000 шт. — скидка 10%
						</p>

						<div className='mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row'>
							<QuantityStepper
								onDecrement={handleDecrement}
								onIncrement={handleIncrement}
								quantity={quantity}
							/>
							<Button className='h-10 flex-1' onClick={handleAddToCart}>
								<ShoppingCart aria-hidden={true} className='size-4' />
								Добавить в корзину
							</Button>
						</div>

						<div className='mt-6 overflow-hidden rounded-md border bg-background'>
							<div className='grid grid-cols-2 border-b'>
								<div className='border-primary border-b-2 px-4 py-3 font-medium text-primary text-sm'>
									Характеристики
								</div>
								<div className='px-4 py-3 text-muted-foreground text-sm'>
									Описание
								</div>
							</div>
							<div>
								{product.specs.map(spec => (
									<div
										className='grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3 odd:bg-muted/50'
										key={spec.name}
									>
										<span className='text-muted-foreground text-sm italic'>
											{spec.name}
										</span>
										<span className='text-sm'>{spec.value}</span>
									</div>
								))}
							</div>
							<p className='border-t px-4 py-4 text-muted-foreground text-sm'>
								{product.description}
							</p>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
