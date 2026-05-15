import {ChevronDown, Save, Trash2} from 'lucide-react'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'
import {formControlClass} from '../_lib/helpers'
import {
	getSubmitButtonText,
	type ProductCategoryOption,
	productFormId
} from './productForm'

interface ProductEditorActionsProperties {
	isDeleteDisabled?: boolean
	isDisabled: boolean
	isLoading: boolean
	isNewProduct: boolean
	onDeleteProduct?: () => void
}

export function ProductEditorActions({
	isDeleteDisabled = false,
	isDisabled,
	isLoading,
	isNewProduct,
	onDeleteProduct
}: ProductEditorActionsProperties) {
	return (
		<div className='flex flex-col gap-2 sm:flex-row'>
			{isNewProduct ? null : (
				<Button
					className='h-11 bg-background text-slate-600 hover:bg-slate-50'
					disabled={isDeleteDisabled}
					onClick={onDeleteProduct}
					variant='outline'
				>
					<Trash2 aria-hidden={true} className='size-4' />
					Удалить
				</Button>
			)}
			<Button
				className='h-11 bg-blue-600 px-5 text-white hover:bg-blue-700'
				disabled={isDisabled}
				form={productFormId}
				type='submit'
			>
				<Save aria-hidden={true} className='size-4' />
				{getSubmitButtonText(isNewProduct, isLoading)}
			</Button>
		</div>
	)
}

interface ProductCategorySelectProperties {
	categoryOptions: ProductCategoryOption[]
	isDisabled: boolean
	isLoading: boolean
	selectedCategoryId: string
}

export function ProductCategorySelect({
	categoryOptions,
	isDisabled,
	isLoading,
	selectedCategoryId
}: ProductCategorySelectProperties) {
	return (
		<div className='relative'>
			<select
				aria-label='Категория товара'
				className={cn('w-full appearance-none', formControlClass)}
				defaultValue={selectedCategoryId}
				disabled={isDisabled}
				key={selectedCategoryId}
				name='categoryId'
				required={true}
			>
				{categoryOptions.length === 0 ? (
					<option value=''>
						{isLoading ? 'Загружаем категории...' : 'Категории недоступны'}
					</option>
				) : null}
				{categoryOptions.map(category => (
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
	)
}

interface ProductFormAlertsProperties {
	formError: string | undefined
	hasCategoryError: boolean
}

export function ProductFormAlerts({
	formError,
	hasCategoryError
}: ProductFormAlertsProperties) {
	return (
		<>
			{hasCategoryError ? (
				<ProductFormAlert>
					Не удалось загрузить категории товаров.
				</ProductFormAlert>
			) : null}
			{formError ? <ProductFormAlert>{formError}</ProductFormAlert> : null}
		</>
	)
}

function ProductFormAlert({children}: {children: string}) {
	return (
		<p
			className='mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm'
			role='alert'
		>
			{children}
		</p>
	)
}
