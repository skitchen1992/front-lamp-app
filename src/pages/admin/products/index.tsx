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
	toProduct,
	toProductCategories
} from '@/entities/product/products'
import {
	useListCategoriesQuery,
	useListProductsQuery
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

export function AdminProducts() {
	const [query, setQuery] = useState('')
	const [categoryId, setCategoryId] = useState(allCategoriesValue)
	const [status, setStatus] = useState<ProductStatusFilter>(allStatusesValue)
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

			<AdminProductsTable
				hasError={hasError}
				isLoading={isLoading}
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
