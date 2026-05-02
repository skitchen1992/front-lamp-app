import {Search, ShoppingCart} from 'lucide-react'
import {Link} from 'react-router'
import {selectCartLineCount} from '@/store/cartSlice'
import {useAppSelector} from '@/store/hooks'
import {BrandLogo} from './BrandLogo'

const navigationItems = [
	{label: 'Каталог', to: '/catalog'},
	{label: 'О заводе', to: '/catalog#about'},
	{label: 'Доставка', to: '/catalog#delivery'},
	{label: 'Контакты', to: '/catalog#contacts'}
]

export function StoreHeader() {
	const cartLineCount = useAppSelector(selectCartLineCount)

	return (
		<header className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
			<div className='mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8'>
				<BrandLogo />
				<nav className='hidden items-center gap-7 md:flex'>
					{navigationItems.map(item => (
						<Link
							className='text-muted-foreground text-sm transition hover:text-foreground'
							key={item.label}
							to={item.to}
						>
							{item.label}
						</Link>
					))}
				</nav>
				<div className='ml-auto hidden h-9 min-w-64 items-center gap-2 rounded-md border bg-muted px-3 text-muted-foreground lg:flex'>
					<Search aria-hidden={true} className='size-4' />
					<span className='text-sm'>Поиск товаров...</span>
				</div>
				<Link
					className='inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm shadow-xs transition hover:bg-primary/90'
					to='/cart'
				>
					<ShoppingCart aria-hidden={true} className='size-4' />
					<span>Корзина ({cartLineCount})</span>
				</Link>
			</div>
		</header>
	)
}
