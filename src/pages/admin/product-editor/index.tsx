import {
	Archive,
	ArrowLeft,
	ChevronDown,
	ImagePlus,
	Plus,
	Save
} from 'lucide-react'
import {useMemo} from 'react'
import {Link, Navigate, useParams} from 'react-router'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'
import {Input} from '@/shared/ui/input'
import {AdminContentShell} from '../_components/layout'
import {AdminPanel, FormField} from '../_components/shared'
import {adminCategories, adminProducts} from '../_lib/data'
import {formControlClass, preventFormSubmit} from '../_lib/helpers'

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Форма товара сверстана целиком до подключения form-state и API.
export function AdminProductEditor() {
	const {productId} = useParams()
	const isNewProduct = productId === undefined || productId === 'new'
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
		<AdminContentShell
			actions={
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
			}
			beforeTitle={
				<Link
					className='mb-2 inline-flex items-center gap-2 text-slate-500 text-sm italic transition hover:text-foreground'
					to='/admin/products'
				>
					<ArrowLeft aria-hidden={true} className='size-4' />
					Назад к списку товаров
				</Link>
			}
			title={isNewProduct ? 'Добавить товар' : 'Редактировать товар'}
		>
			<div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
				<AdminPanel className='p-6'>
					<form onSubmit={preventFormSubmit}>
						<h2 className='font-semibold text-lg'>Основная информация</h2>
						<div className='mt-5 grid gap-4 md:grid-cols-2'>
							<FormField
								className='md:col-span-2'
								label='Наименование товара *'
							>
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
				</AdminPanel>

				<AdminPanel className='h-max p-6'>
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
				</AdminPanel>
			</div>
		</AdminContentShell>
	)
}
