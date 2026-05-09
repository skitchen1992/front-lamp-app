import {Plus} from 'lucide-react'
import {useCallback} from 'react'
import {Link} from 'react-router'
import type {Product} from '@/data/products'
import {formatPrice} from '@/lib/format'
import {addToCart} from '@/store/cartSlice'
import {useAppDispatch} from '@/store/hooks'
import {Badge} from './ui/Badge'
import {Button} from './ui/Button'

interface ProductCardProperties {
	product: Product
}

export function ProductCard({product}: ProductCardProperties) {
	const dispatch = useAppDispatch()

	const badgeVariant = product.status === 'low' ? 'warning' : 'success'

	const handleAddToCart = useCallback(() => {
		dispatch(addToCart({product, quantity: 1}))
	}, [dispatch, product])

	return (
		<article className='overflow-hidden rounded-md border bg-card text-card-foreground shadow-xs'>
			<Link
				className='block focus-visible:outline-none'
				to={`/products/${product.slug}`}
			>
				<div className='relative aspect-[16/9] bg-muted'>
					<img
						alt={product.image.alt}
						className='size-full object-cover'
						height={304}
						loading='lazy'
						src={product.image.src}
						width={540}
					/>
					<Badge className='absolute top-3 left-3' variant={badgeVariant}>
						{product.statusLabel}
					</Badge>
				</div>
			</Link>
			<div className='grid min-h-40 grid-rows-[auto_auto_1fr] gap-2 p-4'>
				<p className='text-muted-foreground text-xs italic'>
					Артикул: {product.sku}
				</p>
				<Link
					className='font-semibold leading-tight transition hover:text-primary'
					to={`/products/${product.slug}`}
				>
					{product.shortName}
				</Link>
				<div className='flex items-end justify-between gap-4'>
					<p className='font-bold text-2xl'>{formatPrice(product.price)}</p>
					<Button
						aria-label={`Добавить ${product.shortName} в корзину`}
						onClick={handleAddToCart}
						size='icon'
					>
						<Plus aria-hidden={true} className='size-5' />
					</Button>
				</div>
			</div>
		</article>
	)
}
