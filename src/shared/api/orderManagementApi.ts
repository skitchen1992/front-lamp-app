import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {getStoredAdminAccessToken} from './authApi'

export type DeliveryType = 'delivery' | 'pickup'

export interface CartItemRequest {
	productId: string
	quantity: number
}

export interface CartCalculationRequest {
	deliveryType?: DeliveryType
	items: CartItemRequest[]
}

export interface CartCalculationItem {
	available: boolean
	error?: null | string
	lineTotal: string
	productId: string
	productName?: null | string
	quantity: number
	sku?: null | string
	unitPrice?: null | string
}

export interface CartCalculationResponse {
	currency: string
	deliveryAmount: string
	errors: string[]
	items: CartCalculationItem[]
	subtotalAmount: string
	totalAmount: string
	valid: boolean
}

export interface CreateOrderRequest {
	comment?: null | string
	companyName?: null | string
	customerName: string
	deliveryAddress?: null | string
	deliveryType?: DeliveryType
	email: string
	items: CartItemRequest[]
	phone: string
}

export type OrderStatus =
	| 'canceled'
	| 'completed'
	| 'confirmed'
	| 'new'
	| 'processing'
	| 'shipped'

export interface OrderItemResponse {
	id: string
	lineTotal: string
	productId: string
	productName: string
	quantity: number
	sku: string
	unitPrice: string
}

export interface OrderStatusHistoryResponse {
	changedAt: string
	changedBy: string
	comment?: null | string
	id: string
	newStatus: OrderStatus
	oldStatus?: null | OrderStatus
}

export interface OrderResponse {
	comment?: null | string
	companyName?: null | string
	createdAt: string
	customerName: string
	deliveryAddress?: null | string
	deliveryAmount: string
	email: string
	id: string
	items: OrderItemResponse[]
	orderNumber: string
	phone: string
	status: OrderStatus
	statusHistory: OrderStatusHistoryResponse[]
	subtotalAmount: string
	totalAmount: string
	updatedAt: string
}

export interface OrderSummaryResponse {
	companyName?: null | string | undefined
	createdAt: string
	customerName: string
	email: string
	id: string
	orderNumber: string
	phone: string
	status: OrderStatus
	totalAmount: string
	updatedAt: string
}

export interface OrderListResponse {
	items: OrderSummaryResponse[]
	limit: number
	page: number
	total: number
}

export interface ListOrdersParameters {
	limit: number
	page: number
	status?: OrderStatus
}

export interface UpdateOrderStatusRequest {
	comment?: null | string
	status: OrderStatus
}

export interface UpdateOrderStatusMutationRequest
	extends UpdateOrderStatusRequest {
	orderId: string
}

const defaultOrderManagementBaseUrl = globalThis.location.origin

export const orderManagementBaseUrl = (
	import.meta.env.VITE_ORDER_MANAGEMENT_API_URL ?? defaultOrderManagementBaseUrl
).replace(/\/+$/u, '')

export const orderManagementApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: orderManagementBaseUrl,
		prepareHeaders: headers => {
			const accessToken = getStoredAdminAccessToken()
			if (accessToken) {
				headers.set('authorization', `Bearer ${accessToken}`)
			}

			return headers
		}
	}),
	endpoints: builder => ({
		calculateCart: builder.query<
			CartCalculationResponse,
			CartCalculationRequest
		>({
			query: request => ({
				body: request,
				method: 'POST',
				url: '/api/v1/cart/calculate'
			})
		}),
		createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
			query: request => ({
				body: request,
				method: 'POST',
				url: '/api/v1/orders'
			})
		}),
		getOrder: builder.query<OrderResponse, string>({
			providesTags: (_result, _error, orderId) => [
				{id: orderId, type: 'Order'}
			],
			query: orderId => `/api/v1/orders/${orderId}`
		}),
		listOrders: builder.query<OrderListResponse, ListOrdersParameters>({
			providesTags: result =>
				result
					? [
							...result.items.map(order => ({
								id: order.id,
								type: 'Order' as const
							})),
							{id: 'LIST', type: 'Order'}
						]
					: [{id: 'LIST', type: 'Order'}],
			query: ({limit, page, status}) => ({
				params: {
					limit,
					page,
					...(status === undefined ? {} : {status})
				},
				url: '/api/v1/internal/orders'
			})
		}),
		updateOrderStatus: builder.mutation<
			OrderResponse,
			UpdateOrderStatusMutationRequest
		>({
			invalidatesTags: (_result, _error, {orderId}) => [
				{id: orderId, type: 'Order'},
				{id: 'LIST', type: 'Order'}
			],
			query: ({comment, orderId, status}) => ({
				body: {
					...(comment === undefined ? {} : {comment}),
					status
				},
				method: 'PATCH',
				url: `/api/v1/internal/orders/${orderId}/status`
			})
		})
	}),
	reducerPath: 'orderManagementApi',
	tagTypes: ['Order']
})

export const {
	useCalculateCartQuery,
	useCreateOrderMutation,
	useGetOrderQuery,
	useListOrdersQuery,
	useUpdateOrderStatusMutation
} = orderManagementApi
