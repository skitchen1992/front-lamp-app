import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {
	CategoryResponse,
	ProductLifecycleStatus,
	ProductListResponse,
	ProductResponse
} from '@/entities/product/products'

interface ListProductsParameters {
	limit: number
	page: number
	query?: string
	minPrice?: number
	maxPrice?: number
	status?: ProductLifecycleStatus
}

interface ListProductsQueryParameters {
	limit: number
	max_price?: number
	min_price?: number
	page: number
	query?: string
	status?: ProductLifecycleStatus
}

const defaultProductManagementBaseUrl = globalThis.location.origin

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
				const params: ListProductsQueryParameters = {limit, page}
				if (status !== undefined) {
					params.status = status
				}
				if (searchQuery !== undefined) {
					params.query = searchQuery
				}
				if (minPrice !== undefined) {
					params.min_price = minPrice
				}
				if (maxPrice !== undefined) {
					params.max_price = maxPrice
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
