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
	/** Минимальная цена в валюте товара (в запросе как `min_price`). */
	minPrice?: number
	/** Максимальная цена в валюте товара (в запросе как `max_price`). */
	maxPrice?: number
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
			query: ({
				limit,
				page,
				status,
				query: searchQuery,
				minPrice,
				maxPrice
			}) => {
				const params: Record<string, string | number> = {limit, page, status}
				if (searchQuery !== undefined) {
					params['query'] = searchQuery
				}
				if (minPrice !== undefined) {
					params['minPrice'] = minPrice
				}
				if (maxPrice !== undefined) {
					params['maxPrice'] = maxPrice
				}
				return {params, url: '/api/v1/products'}
			}
		})
	}),
	reducerPath: 'productManagementApi'
})

export const {
	useGetProductQuery,
	useListCategoriesQuery,
	useListProductsQuery
} = productManagementApi
