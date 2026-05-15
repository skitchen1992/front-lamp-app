import {Plus} from 'lucide-react'
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react'
import {Link} from 'react-router'
import {
	type CategoryResponse,
	type Product,
	toProduct,
	toProductCategories
} from '@/entities/product/products'
import {
	useDeleteProductMutation,
	useListCategoriesQuery,
	useListProductsQuery,
	useUpdateProductStatusMutation
} from '@/shared/api/productManagementApi'
import {AdminContentShell} from '../_components/layout'
import {AdminProductFilters} from './filters'
import {AdminProductsTable} from './table'
import {
	allCategoriesValue,
	allStatusesValue,
	type ProductStatusFilter
} from './types'

const SEARCH_DEBOUNCE_MS = 300
const PRODUCT_LIST_LIMIT = 100
const emptyCategories: CategoryResponse[] = []

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: The admin list owns filters plus product action callbacks.
export function AdminProducts() {
	const [query, setQuery] = useState('')
	const [categoryId, setCategoryId] = useState(allCategoriesValue)
	const [status, setStatus] = useState<ProductStatusFilter>(allStatusesValue)
	const [actionError, setActionError] = useState<string | undefined>()
	const [busyProductId, setBusyProductId] = useState<string | undefined>()
	const [deleteProduct] = useDeleteProductMutation()
	const [updateProductStatus] = useUpdateProductStatusMutation()
	const {categoryOptions, hasError, isLoading, products} = useAdminProductList({
		categoryId,
		query,
		status
	})

	const handleQueryChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value)
		},
		[]
	)

	const handleCategoryChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setCategoryId(event.target.value)
		},
		[]
	)

	const handleStatusChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setStatus(event.target.value as ProductStatusFilter)
		},
		[]
	)

	const handleDeleteProduct = useCallback(
		async (product: Product) => {
			const confirmed =
				typeof globalThis.confirm === 'function'
					? // biome-ignore lint/suspicious/noAlert: Native confirmation keeps destructive table action explicit.
						globalThis.confirm(
							`Удалить товар «${product.name}»? Он будет перемещен в архив.`
						)
					: true
			if (!confirmed) {
				return
			}

			setActionError(undefined)
			setBusyProductId(product.id)

			try {
				await deleteProduct(product.id).unwrap()
			} catch (error) {
				setActionError(getProductActionErrorMessage(error, 'delete'))
			} finally {
				setBusyProductId(undefined)
			}
		},
		[deleteProduct]
	)

	const handleRestoreProduct = useCallback(
		async (product: Product) => {
			setActionError(undefined)
			setBusyProductId(product.id)

			try {
				await updateProductStatus({
					productId: product.id,
					status: 'active'
				}).unwrap()
			} catch (error) {
				setActionError(getProductActionErrorMessage(error, 'restore'))
			} finally {
				setBusyProductId(undefined)
			}
		},
		[updateProductStatus]
	)

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
			<AdminProductFilters
				categoryId={categoryId}
				categoryOptions={categoryOptions}
				onCategoryChange={handleCategoryChange}
				onQueryChange={handleQueryChange}
				onStatusChange={handleStatusChange}
				query={query}
				status={status}
			/>

			{actionError ? (
				<p
					className='mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm'
					role='alert'
				>
					{actionError}
				</p>
			) : null}

			<AdminProductsTable
				busyProductId={busyProductId}
				hasError={hasError}
				isLoading={isLoading}
				onDeleteProduct={handleDeleteProduct}
				onRestoreProduct={handleRestoreProduct}
				products={products}
			/>
		</AdminContentShell>
	)
}

interface AdminProductListParameters {
	categoryId: string
	query: string
	status: ProductStatusFilter
}

function useAdminProductList({
	categoryId,
	query,
	status
}: AdminProductListParameters) {
	const debouncedQuery = useDebouncedQuery(query)
	const categoriesQuery = useListCategoriesQuery()
	const productStatus = status === allStatusesValue ? undefined : status
	const productsQuery = useListProductsQuery({
		limit: PRODUCT_LIST_LIMIT,
		page: 1,
		...(productStatus === undefined ? {} : {status: productStatus}),
		...(debouncedQuery.length === 0 ? {} : {query: debouncedQuery})
	})
	const categoryData = categoriesQuery.data ?? emptyCategories
	const categoryOptions = useMemo(
		() => toProductCategories(categoryData),
		[categoryData]
	)
	const products = useMemo(
		() =>
			(productsQuery.data?.items ?? []).map(product =>
				toProduct(product, categoryData)
			),
		[categoryData, productsQuery.data?.items]
	)
	const visibleProducts = useMemo(
		() =>
			products.filter(
				product =>
					categoryId === allCategoriesValue || product.categoryId === categoryId
			),
		[categoryId, products]
	)

	return {
		categoryOptions,
		hasError: categoriesQuery.isError || productsQuery.isError,
		isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
		products: visibleProducts
	}
}

function useDebouncedQuery(query: string) {
	const [debouncedQuery, setDebouncedQuery] = useState('')

	useEffect(() => {
		const handle = globalThis.setTimeout(() => {
			setDebouncedQuery(query.trim())
		}, SEARCH_DEBOUNCE_MS)

		return () => {
			globalThis.clearTimeout(handle)
		}
	}, [query])

	return debouncedQuery
}

function getProductActionErrorMessage(
	error: unknown,
	action: 'delete' | 'restore'
) {
	if (isFetchBaseQueryError(error)) {
		if (error.status === 401) {
			return 'Сессия администратора истекла. Войдите в админку заново.'
		}
		if (error.status === 404) {
			return 'Товар не найден на сервере.'
		}
		if (error.status === 422) {
			return 'Сервер не принял запрос по этому товару.'
		}
	}

	return action === 'delete'
		? 'Не удалось удалить товар. Попробуйте еще раз.'
		: 'Не удалось восстановить товар. Попробуйте еще раз.'
}

function isFetchBaseQueryError(
	error: unknown
): error is {status: number | string} {
	return typeof error === 'object' && error !== null && 'status' in error
}
