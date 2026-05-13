import {Archive, ChevronDown, Pencil, Plus, Search} from 'lucide-react'
import {Link} from 'react-router'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {Input} from '@/shared/ui/input'
import {AdminContentShell} from '../_components/layout'
import {
	ActionIconButton,
	ActionIconLink,
	AdminPanel,
	StatusBadge
} from '../_components/shared'
import {adminCategories, adminProducts, productStatusMeta} from '../_lib/data'
import {formControlClass, getStockTextClass} from '../_lib/helpers'

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

			<AdminPanel className='mt-5 overflow-hidden rounded-md'>
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
			</AdminPanel>
		</AdminContentShell>
	)
}
