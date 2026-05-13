import {
	Archive,
	ArrowLeft,
	ChevronDown,
	ImagePlus,
	Pencil,
	Plus,
	Save,
	Search
} from 'lucide-react'
import {useMemo} from 'react'
import {Link, Navigate, useParams} from 'react-router'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'
import {Input} from '@/shared/ui/input'
import {adminCategories, adminProducts, productStatusMeta} from './data'
import {formControlClass, getStockTextClass, preventFormSubmit} from './helpers'
import {AdminContentShell} from './layout'
import {
	ActionIconButton,
	ActionIconLink,
	FormField,
	StatusBadge
} from './shared'

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Таблица товаров пока является цельным mock-экраном.
export function AdminProducts() {
	return (
		<AdminContentShell
			actions={
				<Link
					className='inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-sm text-white shadow-xs transition hover:bg-blue-700'
					to='/admin/products/new'
				>
					<Plus aria-hidden={true} className='size-4' />
					Добавить товар
				</Link>
			}
			title='Управление товарами'
		>
			<div className='flex flex-col gap-3 md:flex-row'>
				<div className='relative md:w-80'>
					<Search
						aria-hidden={true}
						className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
					/>
					<Input
						aria-label='Поиск по товару'
						className='h-11 bg-background pl-10'
						placeholder='Поиск по названию / артикулу...'
						type='search'
					/>
				</div>
				<div className='relative md:w-52'>
					<select
						aria-label='Категория'
						className={cn('w-full appearance-none', formControlClass)}
					>
						<option>Все категории</option>
						{adminCategories.map(category => (
							<option key={category.id}>{category.name}</option>
						))}
					</select>
					<ChevronDown
						aria-hidden={true}
						className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
					/>
				</div>
				<div className='relative md:w-44'>
					<select
						aria-label='Статус товара'
						className={cn('w-full appearance-none', formControlClass)}
					>
						<option>Все статусы</option>
						<option>Активные</option>
						<option>Черновики</option>
						<option>Архив</option>
					</select>
					<ChevronDown
						aria-hidden={true}
						className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
					/>
				</div>
			</div>

			<div className='mt-5 overflow-hidden rounded-md border bg-background'>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[56rem] text-sm'>
						<thead className='bg-slate-50 text-slate-500'>
							<tr>
								<th className='px-4 py-3 text-left font-semibold'>Фото</th>
								<th className='px-4 py-3 text-left font-semibold'>
									Наименование / Артикул
								</th>
								<th className='px-4 py-3 text-left font-semibold'>Категория</th>
								<th className='px-4 py-3 text-right font-semibold'>Цена</th>
								<th className='px-4 py-3 text-right font-semibold'>Остаток</th>
								<th className='px-4 py-3 text-left font-semibold'>Статус</th>
								<th className='px-4 py-3 text-right font-semibold'>Действия</th>
							</tr>
						</thead>
						<tbody>
							{adminProducts.slice(0, 3).map(product => (
								<tr
									className={cn(
										'border-t',
										product.status === 'archived' && 'text-slate-400'
									)}
									key={product.id}
								>
									<td className='px-4 py-3'>
										<img
											alt={product.images[0].alt}
											className='size-12 rounded-md object-cover'
											height={48}
											src={product.images[0].src}
											width={48}
										/>
									</td>
									<td className='px-4 py-3'>
										<p className='font-semibold text-foreground'>
											{product.name}
										</p>
										<p className='text-slate-400 text-xs italic'>
											{product.sku}
										</p>
									</td>
									<td className='px-4 py-3 text-slate-500 italic'>
										{product.categoryName}
									</td>
									<td className='px-4 py-3 text-right font-bold'>
										{formatPrice(product.price)}
									</td>
									<td
										className={cn(
											'px-4 py-3 text-right',
											getStockTextClass(product.stockQty)
										)}
									>
										{product.stockQty}
									</td>
									<td className='px-4 py-3'>
										<StatusBadge {...productStatusMeta[product.status]} />
									</td>
									<td className='px-4 py-3'>
										<div className='flex justify-end gap-2'>
											<ActionIconLink
												icon={Pencil}
												label={`Редактировать ${product.name}`}
												to={`/admin/products/${product.id}/edit`}
											/>
											{product.status === 'archived' ? (
												<button
													className='inline-flex h-8 items-center rounded-md px-3 font-medium text-blue-600 text-xs transition hover:bg-blue-50'
													type='button'
												>
													Восстановить
												</button>
											) : (
												<ActionIconButton
													icon={Archive}
													label={`Архивировать ${product.name}`}
												/>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</AdminContentShell>
	)
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Форма товара сверстана целиком до подключения form-state и API.
export function AdminProductEditor() {
	const {productId} = useParams()
	const isNewProduct = productId === 'new'
	const product = useMemo(() => {
		if (isNewProduct) {
			return adminProducts[0]
		}

		return adminProducts.find(item => item.id === productId)
	}, [isNewProduct, productId])

	if (!product) {
		return <Navigate replace={true} to='/admin/products' />
	}

	return (
		<section className='px-4 py-7 sm:px-6 lg:px-9'>
			<div className='mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
				<div>
					<Link
						className='inline-flex items-center gap-2 text-slate-500 text-sm italic transition hover:text-foreground'
						to='/admin/products'
					>
						<ArrowLeft aria-hidden={true} className='size-4' />
						Назад к списку товаров
					</Link>
					<h1 className='mt-2 font-bold text-3xl tracking-normal'>
						{isNewProduct ? 'Добавить товар' : 'Редактировать товар'}
					</h1>
				</div>
				<div className='flex flex-col gap-2 sm:flex-row'>
					<Button
						className='h-11 bg-background text-slate-600 hover:bg-slate-50'
						variant='outline'
					>
						<Archive aria-hidden={true} className='size-4' />
						Архивировать
					</Button>
					<Button className='h-11 bg-blue-600 px-5 text-white hover:bg-blue-700'>
						<Save aria-hidden={true} className='size-4' />
						Сохранить изменения
					</Button>
				</div>
			</div>

			<div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
				<form
					className='rounded-lg border bg-background p-6 shadow-xs'
					onSubmit={preventFormSubmit}
				>
					<h2 className='font-semibold text-lg'>Основная информация</h2>
					<div className='mt-5 grid gap-4 md:grid-cols-2'>
						<FormField className='md:col-span-2' label='Наименование товара *'>
							<Input
								aria-label='Наименование товара'
								className='h-11'
								defaultValue={product.name}
								placeholder='Название товара'
							/>
						</FormField>
						<FormField label='Артикул (SKU) *'>
							<Input
								aria-label='Артикул товара'
								className='h-11'
								defaultValue={product.sku}
								placeholder='SKU'
							/>
						</FormField>
						<FormField label='Категория'>
							<div className='relative'>
								<select
									aria-label='Категория товара'
									className={cn('w-full appearance-none', formControlClass)}
									defaultValue={product.categoryId}
								>
									{adminCategories.map(category => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
								<ChevronDown
									aria-hidden={true}
									className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
								/>
							</div>
						</FormField>
						<FormField className='md:col-span-2' label='Краткое описание'>
							<textarea
								aria-label='Краткое описание товара'
								className={cn('w-full resize-none', formControlClass)}
								defaultValue={product.shortDescription}
								placeholder='Краткое описание для карточки'
								rows={3}
							/>
						</FormField>
						<FormField label='Цена (₽) *'>
							<Input
								aria-label='Цена товара'
								className='h-11'
								defaultValue={String(product.price)}
								inputMode='decimal'
							/>
						</FormField>
						<FormField label='Остаток (шт.) *'>
							<Input
								aria-label='Остаток товара'
								className='h-11'
								defaultValue={String(product.stockQty)}
								inputMode='numeric'
							/>
						</FormField>
						<FormField className='md:col-span-2' label='Статус публикации'>
							<label className='flex h-11 items-center gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-emerald-700'>
								<input
									aria-label='Опубликован'
									className='size-5 accent-emerald-500'
									defaultChecked={product.status === 'active'}
									type='checkbox'
								/>
								<span className='font-medium text-sm'>Опубликован</span>
							</label>
						</FormField>
					</div>
				</form>

				<section className='h-max rounded-lg border bg-background p-6 shadow-xs'>
					<h2 className='font-semibold text-lg'>Изображения товара</h2>
					<img
						alt={product.images[0].alt}
						className='mt-5 aspect-[3/2] w-full rounded-md border-2 border-blue-600 object-cover'
						height={220}
						src={product.images[0].src}
						width={332}
					/>
					<Button
						className='mt-4 h-10 w-full border-blue-600 text-blue-600 hover:bg-blue-50'
						variant='outline'
					>
						<ImagePlus aria-hidden={true} className='size-4' />
						Загрузить фото
					</Button>
					<div className='mt-4 grid grid-cols-4 gap-2'>
						{product.images.map(image => (
							<button
								className={cn(
									'aspect-square overflow-hidden rounded-md border bg-slate-100 p-1 transition hover:border-blue-600',
									image.isMain && 'border-2 border-blue-600'
								)}
								key={image.id}
								type='button'
							>
								<img
									alt={image.alt}
									className='size-full rounded-sm object-cover'
									height={64}
									src={image.src}
									width={64}
								/>
							</button>
						))}
						<button
							aria-label='Добавить изображение товара'
							className='flex aspect-square items-center justify-center rounded-md border bg-slate-100 text-slate-400 transition hover:border-blue-600 hover:text-blue-600'
							type='button'
						>
							<Plus aria-hidden={true} className='size-6' />
						</button>
					</div>
				</section>
			</div>
		</section>
	)
}
