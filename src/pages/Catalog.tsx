import {Factory, Mail, MapPin, Phone, Truck} from 'lucide-react'
import {type ChangeEvent, useCallback, useId, useMemo, useState} from 'react'
import {Link} from 'react-router'
import {Head} from '@/components/Head'
import {ProductCard} from '@/components/ProductCard'
import {StoreHeader} from '@/components/StoreHeader'
import {productCategories, products} from '@/data/products'
import {cn} from '@/lib/utils'

interface CategoryFilterButtonProperties {
	active: boolean
	item: (typeof productCategories)[number]
	onSelect: (value: string) => void
}

function CategoryFilterButton({
	active,
	item,
	onSelect
}: CategoryFilterButtonProperties) {
	const handleClick = useCallback(() => {
		onSelect(item.value)
	}, [item.value, onSelect])

	return (
		<button
			className={cn(
				'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent',
				active ? 'bg-accent font-medium text-primary' : 'text-muted-foreground'
			)}
			onClick={handleClick}
			type='button'
		>
			<span
				className={cn(
					'size-4 rounded-sm border',
					active && 'border-primary bg-primary'
				)}
			/>
			{item.label}
		</button>
	)
}

export function Catalog() {
	const searchId = useId()

	const [category, setCategory] = useState('all')
	const [query, setQuery] = useState('')

	const handleCategorySelect = useCallback((value: string) => {
		setCategory(value)
	}, [])

	const handleQueryChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value)
		},
		[]
	)

	const visibleProducts = useMemo(
		() =>
			products.filter(product => {
				const matchesCategory =
					category === 'all' || product.category === category
				const normalizedQuery = query.trim().toLowerCase()
				const matchesQuery =
					normalizedQuery.length === 0 ||
					product.name.toLowerCase().includes(normalizedQuery) ||
					product.sku.toLowerCase().includes(normalizedQuery)

				return matchesCategory && matchesQuery
			}),
		[category, query]
	)

	return (
		<>
			<Head title='ЛампоЗавод — каталог' />
			<StoreHeader />
			<main className='min-h-screen bg-muted/40'>
				<section className='bg-primary text-primary-foreground'>
					<div className='mx-auto flex min-h-44 max-w-7xl flex-col justify-center gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'>
						<div>
							<h1 className='font-bold text-3xl tracking-normal sm:text-4xl'>
								Лампы промышленного качества
							</h1>
							<p className='mt-3 max-w-2xl text-primary-foreground/80'>
								Прямые поставки с завода · Оптовые и розничные заказы
							</p>
						</div>
						<Link
							className='inline-flex h-12 w-full items-center justify-center rounded-md bg-background px-6 font-medium text-primary text-sm shadow-xs transition hover:bg-background/90 sm:w-auto'
							to='#products'
						>
							Смотреть каталог
						</Link>
					</div>
				</section>

				<div className='mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_1fr] lg:px-8'>
					<aside className='rounded-md border bg-background p-4 lg:sticky lg:top-24 lg:h-max'>
						<p className='font-semibold text-muted-foreground text-xs uppercase tracking-widest'>
							Фильтры
						</p>
						<div className='mt-5'>
							<p className='font-semibold text-sm'>Категория</p>
							<div className='mt-3 space-y-1'>
								{productCategories.map(item => (
									<CategoryFilterButton
										active={category === item.value}
										item={item}
										key={item.value}
										onSelect={handleCategorySelect}
									/>
								))}
							</div>
						</div>
						<div className='mt-6 border-t pt-5'>
							<label className='font-semibold text-sm' htmlFor={searchId}>
								Поиск
							</label>
							<input
								className='mt-3 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
								id={searchId}
								onChange={handleQueryChange}
								placeholder='Название или артикул'
								value={query}
							/>
						</div>
						<div className='mt-6 border-t pt-5'>
							<p className='font-semibold text-sm'>Наличие</p>
							<div className='mt-3 flex items-center gap-2 text-sm'>
								<span className='size-4 rounded-sm bg-primary' />
								<span>В наличии</span>
							</div>
						</div>
						<div className='mt-6 border-t pt-5'>
							<p className='font-semibold text-sm'>Цена, ₽</p>
							<div className='mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
								<input
									aria-label='Цена от'
									className='h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm'
									placeholder='от 10'
									readOnly={true}
								/>
								<span className='text-muted-foreground'>—</span>
								<input
									aria-label='Цена до'
									className='h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm'
									placeholder='до 500'
									readOnly={true}
								/>
							</div>
						</div>
					</aside>

					<section id='products'>
						<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
							<h2 className='font-bold text-xl'>
								Все товары ({visibleProducts.length})
							</h2>
							<label className='flex items-center gap-2 text-muted-foreground text-sm'>
								Сортировка:
								<select
									className='h-9 rounded-md border bg-background px-3 text-foreground'
									defaultValue='popular'
								>
									<option value='popular'>По популярности</option>
									<option value='price'>По цене</option>
								</select>
							</label>
						</div>
						<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
							{visibleProducts.map(product => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</section>
				</div>

				<section className='border-t bg-background' id='about'>
					<div className='mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8'>
						<div className='rounded-md border p-5'>
							<Factory aria-hidden={true} className='size-5 text-primary' />
							<h2 className='mt-3 font-semibold'>О заводе</h2>
							<p className='mt-2 text-muted-foreground text-sm'>
								Собственное производство и входной контроль каждой партии.
							</p>
						</div>
						<div className='rounded-md border p-5' id='delivery'>
							<Truck aria-hidden={true} className='size-5 text-primary' />
							<h2 className='mt-3 font-semibold'>Доставка</h2>
							<p className='mt-2 text-muted-foreground text-sm'>
								Самовывоз со склада или отгрузка транспортной компанией.
							</p>
						</div>
						<div className='rounded-md border p-5' id='contacts'>
							<Phone aria-hidden={true} className='size-5 text-primary' />
							<h2 className='mt-3 font-semibold'>Контакты</h2>
							<p className='mt-2 flex items-center gap-2 text-sm'>
								<Mail
									aria-hidden={true}
									className='size-4 text-muted-foreground'
								/>
								info@lampozavod.ru
							</p>
							<p className='mt-2 flex items-center gap-2 text-sm'>
								<MapPin
									aria-hidden={true}
									className='size-4 text-muted-foreground'
								/>
								г. Москва, Промышленная ул., 18
							</p>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
