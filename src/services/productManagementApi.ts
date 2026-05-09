import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {
	CategoryResponse,
	ProductLifecycleStatus,
	ProductListResponse,
	ProductResponse
} from '@/data/products'

interface ListProductsParameters {
	limit: number
	page: number
	/** Поиск по названию и артикулу (query string product-management API). */
	query?: string
	status: ProductLifecycleStatus
}

const defaultProductManagementBaseUrl = `${globalThis.location.origin}/product-management`

export const productManagementBaseUrl = (
	import.meta.env.VITE_PRODUCT_MANAGEMENT_API_URL ??
	defaultProductManagementBaseUrl
).replace(/\/+$/u, '')

export const productManagementApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: productManagementBaseUrl
	}),
	endpoints: builder => ({
		getProduct: builder.query<ProductResponse, string>({
			query: productId => `/api/v1/products/${productId}`
		}),
		listCategories: builder.query<CategoryResponse[], void>({
			query: () => '/api/v1/categories'
		}),
		listProducts: builder.query<ProductListResponse, ListProductsParameters>({
			query: parameters => ({
				params: parameters,
				url: '/api/v1/products'
			})
		})
	}),
	reducerPath: 'productManagementApi'
})

export const {
	useGetProductQuery,
	useListCategoriesQuery,
	useListProductsQuery
} = productManagementApi
