import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {
	CategoryResponse,
	ProductLifecycleStatus,
	ProductListResponse,
	ProductResponse
} from '@/entities/product/products'
import {getStoredAdminAccessToken} from './authApi'

interface ListProductsParameters {
	limit: number
	page: number
	query?: string
	minPrice?: number
	maxPrice?: number
	status?: ProductLifecycleStatus
}

type PriceFilterQueryParameters = Partial<
	Record<'max_price' | 'min_price', number>
>

type ListProductsQueryParameters = PriceFilterQueryParameters & {
	limit: number
	page: number
	query?: string
	status?: ProductLifecycleStatus
}

export interface CreateProductRequest {
	categoryId: string
	currency?: string
	fullDescription?: null | string
	isFeatured?: boolean
	name: string
	price: number | string
	shortDescription?: null | string
	sku: string
	slug: string
	status?: ProductLifecycleStatus
	stockQty?: number
}

export type UpdateProductRequest = Partial<CreateProductRequest>

export interface UpdateProductMutationRequest {
	productId: string
	request: UpdateProductRequest
}

export interface UpdateProductStockMutationRequest {
	deltaQty: number
	productId: string
	reason: string
	source?: string
}

export interface UpdateProductStatusMutationRequest {
	productId: string
	status: ProductLifecycleStatus
}

const defaultProductManagementBaseUrl = globalThis.location.origin

export const productManagementBaseUrl = (
	import.meta.env.VITE_PRODUCT_MANAGEMENT_API_URL ??
	defaultProductManagementBaseUrl
).replace(/\/+$/u, '')

export const productManagementApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: productManagementBaseUrl,
		prepareHeaders: headers => {
			const accessToken = getStoredAdminAccessToken()
			if (accessToken) {
				headers.set('authorization', `Bearer ${accessToken}`)
			}

			return headers
		}
	}),
	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: RTK Query endpoint declarations stay together for this API slice.
	endpoints: builder => ({
		createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
			invalidatesTags: [{id: 'LIST', type: 'Product'}],
			query: request => ({
				body: request,
				method: 'POST',
				url: '/api/v1/internal/products'
			})
		}),
		deleteProduct: builder.mutation<ProductResponse, string>({
			invalidatesTags: (_result, _error, productId) => [
				{id: productId, type: 'Product'},
				{id: 'LIST', type: 'Product'}
			],
			query: productId => ({
				method: 'DELETE',
				url: `/api/v1/internal/products/${productId}`
			})
		}),
		getProduct: builder.query<ProductResponse, string>({
			providesTags: (_result, _error, productId) => [
				{id: productId, type: 'Product'}
			],
			query: productId => `/api/v1/products/${productId}`
		}),
		listCategories: builder.query<CategoryResponse[], void>({
			query: () => '/api/v1/categories'
		}),
		listProducts: builder.query<ProductListResponse, ListProductsParameters>({
			providesTags: result =>
				result
					? [
							...result.items.map(product => ({
								id: product.id,
								type: 'Product' as const
							})),
							{id: 'LIST', type: 'Product'}
						]
					: [{id: 'LIST', type: 'Product'}],
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
		}),
		updateProduct: builder.mutation<
			ProductResponse,
			UpdateProductMutationRequest
		>({
			invalidatesTags: (_result, _error, {productId}) => [
				{id: productId, type: 'Product'},
				{id: 'LIST', type: 'Product'}
			],
			query: ({productId, request}) => ({
				body: request,
				method: 'PUT',
				url: `/api/v1/internal/products/${productId}`
			})
		}),
		updateProductStatus: builder.mutation<
			ProductResponse,
			UpdateProductStatusMutationRequest
		>({
			invalidatesTags: (_result, _error, {productId}) => [
				{id: productId, type: 'Product'},
				{id: 'LIST', type: 'Product'}
			],
			query: ({productId, status}) => ({
				body: {status},
				method: 'PATCH',
				url: `/api/v1/internal/products/${productId}/status`
			})
		}),
		updateProductStock: builder.mutation<
			ProductResponse,
			UpdateProductStockMutationRequest
		>({
			invalidatesTags: (_result, _error, {productId}) => [
				{id: productId, type: 'Product'},
				{id: 'LIST', type: 'Product'}
			],
			query: ({deltaQty, productId, reason, source}) => ({
				body: {
					deltaQty,
					reason,
					source
				},
				method: 'PATCH',
				url: `/api/v1/internal/products/${productId}/stock`
			})
		})
	}),
	reducerPath: 'productManagementApi',
	tagTypes: ['Product']
})

export const {
	useCreateProductMutation,
	useDeleteProductMutation,
	useGetProductQuery,
	useListCategoriesQuery,
	useListProductsQuery,
	useUpdateProductMutation,
	useUpdateProductStatusMutation,
	useUpdateProductStockMutation
} = productManagementApi
