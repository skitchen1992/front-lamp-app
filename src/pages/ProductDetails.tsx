import {skipToken} from '@reduxjs/toolkit/query'
import {ChevronRight, ShoppingCart} from 'lucide-react'
import {useCallback, useMemo, useState} from 'react'
import {Link, Navigate, useParams} from 'react-router'
import {Head} from '@/components/Head'
import {QuantityStepper} from '@/components/QuantityStepper'
import {StoreHeader} from '@/components/StoreHeader'
import {Badge} from '@/components/ui/Badge'
import {Button} from '@/components/ui/Button'
import {
	type CategoryResponse,
	type Product,
	type ProductImage,
	toProduct
} from '@/data/products'
import {formatPrice} from '@/lib/format'
import {
	useGetProductQuery,
	useListCategoriesQuery,
	useListProductsQuery
} from '@/services/productManagementApi'
import {addToCart} from '@/store/cartSlice'
import {useAppDispatch} from '@/store/hooks'

const emptyCategories: CategoryResponse[] = []

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

export function ProductDetails() {
	const dispatch = useAppDispatch()
	const {productSlug} = useParams()
	const categoriesQuery = useListCategoriesQuery()
	const productsQuery = useListProductsQuery({
		limit: 100,
		page: 1,
		status: 'active'
	})

	const productSummary = useMemo(
		() => productsQuery.data?.items.find(item => item.slug === productSlug),
		[productSlug, productsQuery.data?.items]
	)
	const productDetailsQuery = useGetProductQuery(
		productSummary?.id ?? skipToken
	)
	const categoryData = categoriesQuery.data ?? emptyCategories
	const product = useMemo(() => {
		const apiProduct = productDetailsQuery.data ?? productSummary

		return apiProduct ? toProduct(apiProduct, categoryData) : undefined
	}, [categoryData, productDetailsQuery.data, productSummary])

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
		dispatch(addToCart({product: product as Product, quantity}))
	}, [dispatch, product, quantity])

	const isProductLoading = categoriesQuery.isLoading || productsQuery.isLoading
	const hasProductError = categoriesQuery.isError || productsQuery.isError

	if (isProductLoading) {
		return (
			<>
				<Head title='Загрузка товара — ЛампоЗавод' />
				<StoreHeader />
				<main className='min-h-screen bg-muted/40'>
					<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
						<p
							className='rounded-md border bg-background p-6 text-muted-foreground text-sm'
							role='status'
						>
							Загружаем товар...
						</p>
					</div>
				</main>
			</>
		)
	}

	if (hasProductError) {
		return (
			<>
				<Head title='Ошибка товара — ЛампоЗавод' />
				<StoreHeader />
				<main className='min-h-screen bg-muted/40'>
					<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
						<p
							className='rounded-md border border-destructive/30 bg-background p-6 text-destructive text-sm'
							role='alert'
						>
							Не удалось загрузить товар. Проверьте доступность
							product-management-service.
						</p>
					</div>
				</main>
			</>
		)
	}

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
