import {HttpResponse, http} from 'msw'
import {setupServer} from 'msw/node'
import type {
	CartCalculationRequest,
	CreateOrderRequest
} from '@/services/orderManagementApi'
import {
	createCartCalculationResponse,
	createOrderResponse
} from './orderManagementFixtures'
import {
	categoryResponses,
	productListResponse,
	productResponses
} from './productManagementFixtures'

const orderApiUrl = '*/order-management/api/v1'
const productApiUrl = '*/product-management/api/v1'

export const productManagementHandlers = [
	http.post(`${orderApiUrl}/cart/calculate`, async ({request}) => {
		const cartRequest = (await request.json()) as CartCalculationRequest

		return HttpResponse.json(createCartCalculationResponse(cartRequest))
	}),
	http.post(`${orderApiUrl}/orders`, async ({request}) => {
		const orderRequest = (await request.json()) as CreateOrderRequest

		return HttpResponse.json(createOrderResponse(orderRequest), {status: 201})
	}),
	http.get(`${productApiUrl}/categories`, () =>
		HttpResponse.json(categoryResponses)
	),
	http.get(`${productApiUrl}/products`, ({request}) => {
		const search = new URL(request.url).searchParams.get('query')?.trim()
		const normalized = search?.toLowerCase() ?? ''
		const items = normalized
			? productListResponse.items.filter(
					product =>
						product.name.toLowerCase().includes(normalized) ||
						product.sku.toLowerCase().includes(normalized)
				)
			: productListResponse.items

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
