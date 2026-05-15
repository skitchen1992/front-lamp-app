import {HttpResponse, http} from 'msw'
import {setupServer} from 'msw/node'
import type {
	CartCalculationRequest,
	CreateOrderRequest,
	UpdateOrderStatusRequest
} from '@/shared/api/orderManagementApi'
import {
	adminOrderResponses,
	createCartCalculationResponse,
	createOrderListResponse,
	createOrderResponse
} from './orderManagementFixtures'
import {
	categoryResponses,
	productListResponse,
	productResponses
} from './productManagementFixtures'

const orderApiUrl = '*/api/v1'
const productApiUrl = '*/api/v1'

export const productManagementHandlers = [
	http.post(`${orderApiUrl}/cart/calculate`, async ({request}) => {
		const cartRequest = (await request.json()) as CartCalculationRequest

		return HttpResponse.json(createCartCalculationResponse(cartRequest))
	}),
	http.post(`${orderApiUrl}/orders`, async ({request}) => {
		const orderRequest = (await request.json()) as CreateOrderRequest

		return HttpResponse.json(createOrderResponse(orderRequest), {status: 201})
	}),
	http.get(`${orderApiUrl}/orders/:orderId`, ({params}) => {
		const {orderId} = params
		const order = adminOrderResponses.find(item => item.id === orderId)

		return order
			? HttpResponse.json(order)
			: HttpResponse.json({detail: 'Order not found'}, {status: 404})
	}),
	http.get(`${orderApiUrl}/internal/orders`, ({request}) => {
		const url = new URL(request.url)
		const status = url.searchParams.get('status')?.trim()
		const orders = status
			? adminOrderResponses.filter(order => order.status === status)
			: adminOrderResponses

		return HttpResponse.json(createOrderListResponse(orders))
	}),
	http.patch(
		`${orderApiUrl}/internal/orders/:orderId/status`,
		async ({params, request}) => {
			const {orderId} = params
			const requestBody = (await request.json()) as UpdateOrderStatusRequest
			const order = adminOrderResponses.find(item => item.id === orderId)

			return order
				? HttpResponse.json({
						...order,
						status: requestBody.status,
						updatedAt: '2026-05-15T12:30:00.000Z'
					})
				: HttpResponse.json({detail: 'Order not found'}, {status: 404})
		}
	),
	http.get(`${productApiUrl}/categories`, () =>
		HttpResponse.json(categoryResponses)
	),
	http.get(`${productApiUrl}/products`, ({request}) => {
		const url = new URL(request.url)
		const search = url.searchParams.get('query')?.trim()
		const normalized = search?.toLowerCase() ?? ''
		const status = url.searchParams.get('status')?.trim()
		let items = normalized
			? productListResponse.items.filter(
					product =>
						product.name.toLowerCase().includes(normalized) ||
						product.sku.toLowerCase().includes(normalized)
				)
			: [...productListResponse.items]

		if (status) {
			items = items.filter(product => product.status === status)
		}

		const minRaw = url.searchParams.get('min_price')
		const maxRaw = url.searchParams.get('max_price')
		const minPrice =
			minRaw !== null && minRaw !== '' ? Number(minRaw) : undefined
		const maxPrice =
			maxRaw !== null && maxRaw !== '' ? Number(maxRaw) : undefined

		if (minPrice !== undefined && Number.isFinite(minPrice)) {
			items = items.filter(product => Number(product.price) >= minPrice)
		}
		if (maxPrice !== undefined && Number.isFinite(maxPrice)) {
			items = items.filter(product => Number(product.price) <= maxPrice)
		}

		return HttpResponse.json({
			...productListResponse,
			items,
			total: items.length
		})
	}),
	http.get(`${productApiUrl}/products/:productId`, ({params}) => {
		const {productId} = params
		const product = productResponses.find(item => item.id === productId)

		return product
			? HttpResponse.json(product)
			: HttpResponse.json({detail: 'Product not found'}, {status: 404})
	})
]

export const productManagementServer = setupServer(...productManagementHandlers)
