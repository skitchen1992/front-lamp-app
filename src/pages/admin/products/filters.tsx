import {ChevronDown, Search} from 'lucide-react'
import type {ChangeEvent, ReactNode} from 'react'
import type {ProductCategory} from '@/entities/product/products'
import {cn} from '@/shared/lib/utils'
import {Input} from '@/shared/ui/input'
import {formControlClass} from '../_lib/helpers'
import {type ProductStatusFilter, productStatusOptions} from './types'

interface AdminProductFiltersProperties {
	categoryId: string
	categoryOptions: ProductCategory[]
	onCategoryChange: (event: ChangeEvent<HTMLSelectElement>) => void
	onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void
	onStatusChange: (event: ChangeEvent<HTMLSelectElement>) => void
	query: string
	status: ProductStatusFilter
}

export function AdminProductFilters({
	categoryId,
	categoryOptions,
	onCategoryChange,
	onQueryChange,
	onStatusChange,
	query,
	status
}: AdminProductFiltersProperties) {
	return (
		<div className='flex flex-col gap-3 md:flex-row'>
			<ProductSearchControl onChange={onQueryChange} query={query} />
			<ProductCategoryControl
				categories={categoryOptions}
				categoryId={categoryId}
				onChange={onCategoryChange}
			/>
			<ProductStatusControl onChange={onStatusChange} status={status} />
		</div>
	)
}

function ProductSearchControl({
	onChange,
	query
}: {
	onChange: (event: ChangeEvent<HTMLInputElement>) => void
	query: string
}) {
	return (
		<div className='relative md:w-80'>
			<Search
				aria-hidden={true}
				className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
			/>
			<Input
				aria-label='Поиск по товару'
				className='h-11 bg-background pl-10'
				onChange={onChange}
				placeholder='Поиск по названию / артикулу...'
				type='search'
				value={query}
			/>
		</div>
	)
}

function ProductCategoryControl({
	categories,
	categoryId,
	onChange
}: {
	categories: ProductCategory[]
	categoryId: string
	onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}) {
	return (
		<AdminSelectWrapper className='md:w-52'>
			<select
				aria-label='Категория'
				className={cn('w-full appearance-none', formControlClass)}
				onChange={onChange}
				value={categoryId}
			>
				{categories.map(category => (
					<option key={category.value} value={category.value}>
						{category.label}
					</option>
				))}
			</select>
		</AdminSelectWrapper>
	)
}

function ProductStatusControl({
	onChange,
	status
}: {
	onChange: (event: ChangeEvent<HTMLSelectElement>) => void
	status: ProductStatusFilter
}) {
	return (
		<AdminSelectWrapper className='md:w-44'>
			<select
				aria-label='Статус товара'
				className={cn('w-full appearance-none', formControlClass)}
				onChange={onChange}
				value={status}
			>
				{productStatusOptions.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</AdminSelectWrapper>
	)
}

function AdminSelectWrapper({
	children,
	className
}: {
	children: ReactNode
	className: string
}) {
	return (
		<div className={cn('relative', className)}>
			{children}
			<ChevronDown
				aria-hidden={true}
				className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500'
			/>
		</div>
	)
}
