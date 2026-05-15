// biome-ignore-all lint/nursery/noExcessiveLinesPerFile: Product editor route keeps the API flow and dense form layout together.
import {ArrowLeft, ImagePlus, Plus} from 'lucide-react'
import {
	type FormEvent,
	type ReactNode,
	useCallback,
	useMemo,
	useState
} from 'react'
import {Link, useNavigate, useParams} from 'react-router'
import type {
	CategoryResponse,
	ProductLifecycleStatus,
	ProductResponse
} from '@/entities/product/products'
import {
	type UpdateProductRequest,
	useCreateProductMutation,
	useDeleteProductMutation,
	useGetProductQuery,
	useListCategoriesQuery,
	useUpdateProductMutation,
	useUpdateProductStatusMutation,
	useUpdateProductStockMutation
} from '@/shared/api/productManagementApi'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'
import {Input} from '@/shared/ui/input'
import {AdminContentShell} from '../_components/layout'
import {AdminPanel, FormField} from '../_components/shared'
import {formControlClass} from '../_lib/helpers'
import {
	ProductCategorySelect,
	ProductEditorActions,
	ProductFormAlerts
} from './productEditorParts'
import {
	getActiveApiCategories,
	getCreateProductErrorMessage,
	getCreateProductRequest,
	getDeleteProductErrorMessage,
	getUpdateProductErrorMessage,
	getUpdateProductRequest,
	productFormId
} from './productForm'

interface ProductEditorImage {
	alt: string
	id: string
	isMain: boolean
	src: string
}

interface ProductEditorProduct {
	categoryId: string
	currency: string
	fullDescription: string
	id: string
	images: [ProductEditorImage, ...ProductEditorImage[]]
	isFeatured: boolean
	name: string
	price: number
	shortDescription: string
	sku: string
	slug: string
	status: ProductLifecycleStatus
	stockQty: number
}

const defaultProductImage: ProductEditorImage = {
	alt: 'Фото товара',
	id: 'new-product-image',
	isMain: true,
	src: '/products/led-e27-card.png'
}

const newProductDraft: ProductEditorProduct = {
	categoryId: '',
	currency: 'RUB',
	fullDescription: '',
	id: 'new-product',
	images: [defaultProductImage],
	isFeatured: false,
	name: '',
	price: 0,
	shortDescription: '',
	sku: '',
	slug: '',
	status: 'active',
	stockQty: 0
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Форма товара держит API-состояния и submit-flow в одном месте.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Форма товара держит верстку и submit-flow в одном месте.
export function AdminProductEditor() {
	const {productId} = useParams()
	const navigate = useNavigate()
	const isNewProduct = productId === undefined || productId === 'new'
	const categoriesQuery = useListCategoriesQuery()
	const productQuery = useGetProductQuery(productId ?? '', {
		skip: isNewProduct || productId === undefined
	})
	const [createProduct, createProductResult] = useCreateProductMutation()
	const [deleteProduct, deleteProductResult] = useDeleteProductMutation()
	const [updateProduct, updateProductResult] = useUpdateProductMutation()
	const [updateProductStatus, updateProductStatusResult] =
		useUpdateProductStatusMutation()
	const [updateProductStock, updateProductStockResult] =
		useUpdateProductStockMutation()
	const [formError, setFormError] = useState<string | undefined>()
	const apiProduct = productQuery.data
	const product = useMemo(() => {
		if (isNewProduct) {
			return newProductDraft
		}

		return apiProduct ? toProductEditorProduct(apiProduct) : undefined
	}, [apiProduct, isNewProduct])
	const categoryOptions = useMemo(
		() => getEditorCategoryOptions(categoriesQuery.data ?? [], apiProduct),
		[apiProduct, categoriesQuery.data]
	)
	const selectedCategoryId = isNewProduct
		? (categoryOptions[0]?.id ?? '')
		: (product?.categoryId ?? '')
	const isCategorySelectDisabled =
		categoriesQuery.isLoading || categoryOptions.length === 0
	const isProductLoading = !isNewProduct && productQuery.isLoading
	const isSaving =
		createProductResult.isLoading ||
		deleteProductResult.isLoading ||
		updateProductResult.isLoading ||
		updateProductStatusResult.isLoading ||
		updateProductStockResult.isLoading
	const isSubmitDisabled =
		isSaving ||
		isCategorySelectDisabled ||
		isProductLoading ||
		product === undefined

	const handleSubmit = useCallback(
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Submit mirrors the create/update/stock/status API sequence.
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			setFormError(undefined)

			if (isNewProduct) {
				const parsedProduct = getCreateProductRequest(event.currentTarget)
				if ('error' in parsedProduct) {
					setFormError(parsedProduct.error)
					return
				}

				try {
					await createProduct(parsedProduct.request).unwrap()
					navigate('/admin/products')
				} catch (error) {
					setFormError(getCreateProductErrorMessage(error))
				}
				return
			}

			if (!apiProduct || productId === undefined) {
				return
			}

			const parsedProduct = getUpdateProductRequest(event.currentTarget)
			if ('error' in parsedProduct) {
				setFormError(parsedProduct.error)
				return
			}

			const {status, stockQty} = parsedProduct.request
			if (status === undefined || stockQty === undefined) {
				setFormError('Проверьте статус и остаток товара.')
				return
			}

			try {
				await updateProduct({
					productId,
					request: getProductDetailsUpdateRequest(parsedProduct.request)
				}).unwrap()

				const stockDelta = stockQty - apiProduct.stockQty
				if (stockDelta !== 0) {
					await updateProductStock({
						deltaQty: stockDelta,
						productId,
						reason: 'Корректировка остатка из админки',
						source: 'admin-products'
					}).unwrap()
				}

				if (status !== apiProduct.status) {
					await updateProductStatus({productId, status}).unwrap()
				}

				navigate('/admin/products')
			} catch (error) {
				setFormError(getUpdateProductErrorMessage(error))
			}
		},
		[
			apiProduct,
			createProduct,
			isNewProduct,
			navigate,
			productId,
			updateProduct,
			updateProductStatus,
			updateProductStock
		]
	)

	const handleDeleteProduct = useCallback(async () => {
		if (!product || isNewProduct) {
			return
		}

		const confirmed =
			typeof globalThis.confirm === 'function'
				? // biome-ignore lint/suspicious/noAlert: Native confirmation prevents accidental destructive product actions without adding modal state here.
					globalThis.confirm(
						`Удалить товар «${product.name}»? Он будет перемещен в архив.`
					)
				: true
		if (!confirmed) {
			return
		}

		setFormError(undefined)

		try {
			await deleteProduct(product.id).unwrap()
			navigate('/admin/products')
		} catch (error) {
			setFormError(getDeleteProductErrorMessage(error))
		}
	}, [deleteProduct, isNewProduct, navigate, product])

	const backLink = (
		<Link
			className='mb-2 inline-flex items-center gap-2 text-slate-500 text-sm italic transition hover:text-foreground'
			to='/admin/products'
		>
			<ArrowLeft aria-hidden={true} className='size-4' />
			Назад к списку товаров
		</Link>
	)

	if (isProductLoading) {
		return (
			<AdminProductEditorShell
				beforeTitle={backLink}
				title='Редактировать товар'
			>
				<ProductEditorMessage role='status'>
					Загружаем товар...
				</ProductEditorMessage>
			</AdminProductEditorShell>
		)
	}

	if (!isNewProduct && (productQuery.isError || product === undefined)) {
		return (
			<AdminProductEditorShell
				beforeTitle={backLink}
				title='Редактировать товар'
			>
				<ProductEditorMessage isError={true} role='alert'>
					Не удалось загрузить товар.
				</ProductEditorMessage>
			</AdminProductEditorShell>
		)
	}

	if (product === undefined) {
		return null
	}

	return (
		<AdminContentShell
			actions={
				<ProductEditorActions
					isDeleteDisabled={isSaving}
					isDisabled={isSubmitDisabled}
					isLoading={isSaving}
					isNewProduct={isNewProduct}
					onDeleteProduct={handleDeleteProduct}
				/>
			}
			beforeTitle={backLink}
			title={isNewProduct ? 'Добавить товар' : 'Редактировать товар'}
		>
			<div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
				<AdminPanel className='p-6'>
					<form id={productFormId} key={product.id} onSubmit={handleSubmit}>
						<input defaultValue={product.slug} name='slug' type='hidden' />
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
									name='name'
									placeholder='Название товара'
									required={true}
								/>
							</FormField>
							<FormField label='Артикул (SKU) *'>
								<Input
									aria-label='Артикул товара'
									className='h-11'
									defaultValue={product.sku}
									maxLength={64}
									name='sku'
									placeholder='SKU'
									required={true}
								/>
							</FormField>
							<FormField label='Категория'>
								<ProductCategorySelect
									categoryOptions={categoryOptions}
									isDisabled={isCategorySelectDisabled}
									isLoading={categoriesQuery.isLoading}
									selectedCategoryId={selectedCategoryId}
								/>
							</FormField>
							<FormField className='md:col-span-2' label='Краткое описание'>
								<textarea
									aria-label='Краткое описание товара'
									className={cn('w-full resize-none', formControlClass)}
									defaultValue={product.shortDescription}
									maxLength={500}
									name='shortDescription'
									placeholder='Краткое описание для карточки'
									rows={3}
								/>
							</FormField>
							<FormField className='md:col-span-2' label='Полное описание'>
								<textarea
									aria-label='Полное описание товара'
									className={cn('w-full resize-none', formControlClass)}
									defaultValue={product.fullDescription}
									name='fullDescription'
									placeholder='Подробное описание для карточки товара'
									rows={5}
								/>
							</FormField>
							<FormField label='Цена (₽) *'>
								<Input
									aria-label='Цена товара'
									className='h-11'
									defaultValue={getNumberDefaultValue(
										isNewProduct,
										product.price
									)}
									inputMode='decimal'
									min={0}
									name='price'
									required={true}
									step='0.01'
									type='number'
								/>
							</FormField>
							<FormField label='Остаток (шт.) *'>
								<Input
									aria-label='Остаток товара'
									className='h-11'
									defaultValue={getNumberDefaultValue(
										isNewProduct,
										product.stockQty
									)}
									inputMode='numeric'
									min={0}
									name='stockQty'
									required={true}
									step={1}
									type='number'
								/>
							</FormField>
							<FormField label='Статус публикации'>
								<ProductStatusSelect selectedStatus={product.status} />
							</FormField>
							<FormField label='Продвижение'>
								<label className='flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-700'>
									<input
										aria-label='Рекомендованный товар'
										className='size-5 accent-blue-600'
										defaultChecked={product.isFeatured}
										name='isFeatured'
										type='checkbox'
									/>
									<span className='font-medium text-sm'>Рекомендованный</span>
								</label>
							</FormField>
						</div>
						<ProductFormAlerts
							formError={formError}
							hasCategoryError={categoriesQuery.isError}
						/>
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

function AdminProductEditorShell({
	beforeTitle,
	children,
	title
}: {
	beforeTitle: ReactNode
	children: ReactNode
	title: string
}) {
	return (
		<AdminContentShell beforeTitle={beforeTitle} title={title}>
			{children}
		</AdminContentShell>
	)
}

function ProductEditorMessage({
	children,
	isError = false,
	role
}: {
	children: string
	isError?: boolean
	role: 'alert' | 'status'
}) {
	return (
		<AdminPanel className={cn('p-6', isError && 'border-red-200')}>
			<p
				className={cn('text-sm', isError ? 'text-red-600' : 'text-slate-500')}
				role={role}
			>
				{children}
			</p>
		</AdminPanel>
	)
}

function ProductStatusSelect({
	selectedStatus
}: {
	selectedStatus: ProductLifecycleStatus
}) {
	return (
		<div className='relative'>
			<select
				aria-label='Статус товара'
				className={cn('w-full appearance-none', formControlClass)}
				defaultValue={selectedStatus}
				name='status'
			>
				<option value='active'>Активен</option>
				<option value='draft'>Черновик</option>
				<option value='archived'>Архив</option>
			</select>
		</div>
	)
}

function toProductEditorProduct(
	apiProduct: ProductResponse
): ProductEditorProduct {
	return {
		categoryId: apiProduct.categoryId,
		currency: apiProduct.currency,
		fullDescription: apiProduct.fullDescription ?? '',
		id: apiProduct.id,
		images: getProductEditorImages(apiProduct),
		isFeatured: apiProduct.isFeatured,
		name: apiProduct.name,
		price: Number(apiProduct.price),
		shortDescription: apiProduct.shortDescription ?? '',
		sku: apiProduct.sku,
		slug: apiProduct.slug,
		status: apiProduct.status,
		stockQty: apiProduct.stockQty
	}
}

function getEditorCategoryOptions(
	categories: CategoryResponse[],
	apiProduct?: ProductResponse
) {
	const options = getActiveApiCategories(categories)
	const hasCurrentCategory = options.some(
		category => category.id === apiProduct?.categoryId
	)

	if (!apiProduct || hasCurrentCategory) {
		return options
	}

	const currentCategory = apiProduct.category
		? {
				id: apiProduct.category.id,
				name: `${apiProduct.category.name} (неактивна)`
			}
		: {
				id: apiProduct.categoryId,
				name: 'Текущая категория'
			}

	return [...options, currentCategory]
}

function getProductDetailsUpdateRequest(request: UpdateProductRequest) {
	const {status: _status, stockQty: _stockQty, ...productRequest} = request

	return productRequest
}

function getProductEditorImages(
	apiProduct: ProductResponse
): [ProductEditorImage, ...ProductEditorImage[]] {
	const detailImages = (apiProduct.images ?? [])
		.toSorted(
			(left, right) =>
				Number(right.isMain) - Number(left.isMain) ||
				left.sortOrder - right.sortOrder
		)
		.map(image => ({
			alt: image.altText ?? apiProduct.name,
			id: image.id,
			isMain: image.isMain,
			src: image.imageUrl
		}))
	const mainImage = apiProduct.mainImageUrl
		? [
				{
					alt: apiProduct.name,
					id: `${apiProduct.id}-main-image`,
					isMain: detailImages.length === 0,
					src: apiProduct.mainImageUrl
				}
			]
		: []
	const images: ProductEditorImage[] = []

	for (const image of [
		...detailImages,
		...mainImage,
		{...defaultProductImage, alt: apiProduct.name}
	]) {
		if (!images.some(existingImage => existingImage.src === image.src)) {
			images.push(image)
		}
	}

	const [firstImage = defaultProductImage, ...restImages] = images.map(
		(image, index) => ({
			...image,
			isMain: index === 0
		})
	)

	return [firstImage, ...restImages]
}

function getNumberDefaultValue(isNewProduct: boolean, value: number) {
	return isNewProduct && value === 0 ? '' : String(value)
}
