import {Pencil, RotateCcw, Trash2} from 'lucide-react'
import {type ReactNode, useCallback} from 'react'
import type {Product} from '@/entities/product/products'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {
	ActionIconButton,
	ActionIconLink,
	AdminPanel,
	StatusBadge
} from '../_components/shared'
import {productStatusMeta} from '../_lib/data'
import {getStockTextClass} from '../_lib/helpers'

interface AdminProductsTableProperties {
	busyProductId: string | undefined
	hasError: boolean
	isLoading: boolean
	onDeleteProduct: (product: Product) => void
	onRestoreProduct: (product: Product) => void
	products: Product[]
}

export function AdminProductsTable({
	busyProductId,
	hasError,
	isLoading,
	onDeleteProduct,
	onRestoreProduct,
	products
}: AdminProductsTableProperties) {
	if (isLoading) {
		return (
			<AdminProductsMessage role='status'>
				Загружаем товары...
			</AdminProductsMessage>
		)
	}

	if (hasError) {
		return (
			<AdminProductsMessage isError={true} role='alert'>
				Не удалось загрузить товары.
			</AdminProductsMessage>
		)
	}

	return (
		<AdminPanel className='mt-5 overflow-hidden rounded-md'>
			<div className='overflow-x-auto'>
				<table className='w-full min-w-[56rem] text-sm'>
					<AdminProductsTableHead />
					<AdminProductsTableBody
						busyProductId={busyProductId}
						onDeleteProduct={onDeleteProduct}
						onRestoreProduct={onRestoreProduct}
						products={products}
					/>
				</table>
			</div>
		</AdminPanel>
	)
}

function AdminProductsMessage({
	children,
	isError = false,
	role
}: {
	children: ReactNode
	isError?: boolean
	role: 'alert' | 'status'
}) {
	return (
		<AdminPanel className={cn('mt-5 p-6', isError && 'border-red-200')}>
			<p
				className={cn('text-sm', isError ? 'text-red-600' : 'text-slate-500')}
				role={role}
			>
				{children}
			</p>
		</AdminPanel>
	)
}

function AdminProductsTableHead() {
	return (
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
	)
}

function AdminProductsTableBody({
	busyProductId,
	onDeleteProduct,
	onRestoreProduct,
	products
}: {
	busyProductId: string | undefined
	onDeleteProduct: (product: Product) => void
	onRestoreProduct: (product: Product) => void
	products: Product[]
}) {
	return (
		<tbody>
			{products.length === 0 ? (
				<tr>
					<td className='border-t px-4 py-6 text-slate-500' colSpan={7}>
						Товары не найдены.
					</td>
				</tr>
			) : (
				products.map(product => (
					<AdminProductRow
						isBusy={busyProductId === product.id}
						key={product.id}
						onDeleteProduct={onDeleteProduct}
						onRestoreProduct={onRestoreProduct}
						product={product}
					/>
				))
			)}
		</tbody>
	)
}

function AdminProductRow({
	isBusy,
	onDeleteProduct,
	onRestoreProduct,
	product
}: {
	isBusy: boolean
	onDeleteProduct: (product: Product) => void
	onRestoreProduct: (product: Product) => void
	product: Product
}) {
	return (
		<tr
			className={cn(
				'border-t',
				product.apiStatus === 'archived' && 'text-slate-400'
			)}
		>
			<td className='px-4 py-3'>
				<ProductPreviewImage product={product} />
			</td>
			<td className='px-4 py-3'>
				<ProductNameCell product={product} />
			</td>
			<td className='px-4 py-3 text-slate-500 italic'>
				{product.categoryLabel}
			</td>
			<td className='px-4 py-3 text-right font-bold'>
				{formatPrice(product.price)}
			</td>
			<td
				className={cn('px-4 py-3 text-right', getStockTextClass(product.stock))}
			>
				{product.stock}
			</td>
			<td className='px-4 py-3'>
				<StatusBadge {...productStatusMeta[product.apiStatus]} />
			</td>
			<td className='px-4 py-3'>
				<ProductActionCell
					isBusy={isBusy}
					onDeleteProduct={onDeleteProduct}
					onRestoreProduct={onRestoreProduct}
					product={product}
				/>
			</td>
		</tr>
	)
}

function ProductPreviewImage({product}: {product: Product}) {
	return (
		<img
			alt={product.image.alt}
			className='size-12 rounded-md object-cover'
			height={48}
			src={product.image.src}
			width={48}
		/>
	)
}

function ProductNameCell({product}: {product: Product}) {
	return (
		<>
			<p className='font-semibold text-foreground'>{product.name}</p>
			<p className='text-slate-400 text-xs italic'>{product.sku}</p>
		</>
	)
}

function ProductActionCell({
	isBusy,
	onDeleteProduct,
	onRestoreProduct,
	product
}: {
	isBusy: boolean
	onDeleteProduct: (product: Product) => void
	onRestoreProduct: (product: Product) => void
	product: Product
}) {
	const handleDeleteProduct = useCallback(() => {
		onDeleteProduct(product)
	}, [onDeleteProduct, product])
	const handleRestoreProduct = useCallback(() => {
		onRestoreProduct(product)
	}, [onRestoreProduct, product])

	return (
		<div className='flex justify-end gap-2'>
			<ActionIconLink
				icon={Pencil}
				label={`Редактировать ${product.name}`}
				to={`/admin/products/${product.id}/edit`}
			/>
			{product.apiStatus === 'archived' ? (
				<button
					className='inline-flex h-8 items-center rounded-md px-3 font-medium text-blue-600 text-xs transition hover:bg-blue-50'
					disabled={isBusy}
					onClick={handleRestoreProduct}
					type='button'
				>
					<RotateCcw aria-hidden={true} className='mr-1 size-3.5' />
					Восстановить
				</button>
			) : (
				<ActionIconButton
					disabled={isBusy}
					icon={Trash2}
					label={`Удалить ${product.name}`}
					onClick={handleDeleteProduct}
				/>
			)}
		</div>
	)
}
