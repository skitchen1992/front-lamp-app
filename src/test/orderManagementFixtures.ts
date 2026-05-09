import type {
	CartCalculationRequest,
	CartCalculationResponse,
	CreateOrderRequest,
	OrderResponse
} from '@/services/orderManagementApi'
import {productResponses} from './productManagementFixtures'

export const orderNumber = 'ORD-2026-00001'

export function createCartCalculationResponse(
	request: CartCalculationRequest
): CartCalculationResponse {
	const items = request.items.map(item => {
		const product = productResponses.find(
			productResponse => productResponse.id === item.productId
		)

		if (!product) {
			return {
				available: false,
				error: `Товар ${item.productId} недоступен`,
				lineTotal: '0.00',
				productId: item.productId,
				quantity: item.quantity
			}
		}

		return {
			available: true,
			lineTotal: (Number(product.price) * item.quantity).toFixed(2),
			productId: item.productId,
			productName: product.name,
			quantity: item.quantity,
			sku: product.sku,
			unitPrice: product.price
		}
	})
	const subtotal = items.reduce(
		(total, item) => total + Number(item.lineTotal),
		0
	)
	const delivery = request.deliveryType === 'delivery' ? 500 : 0
	const errors = items
		.map(item => item.error)
		.filter((error): error is string => Boolean(error))

	return {
		currency: 'RUB',
		deliveryAmount: delivery.toFixed(2),
		errors,
		items,
		subtotalAmount: subtotal.toFixed(2),
		totalAmount: (subtotal + delivery).toFixed(2),
		valid: errors.length === 0
	}
}

export function createOrderResponse(
	request: CreateOrderRequest
): OrderResponse {
	const calculation = createCartCalculationResponse(request)

	return {
		comment: request.comment as null | string,
		companyName: request.companyName as null | string,
		createdAt: '2026-05-09T09:00:00.000Z',
		customerName: request.customerName,
		deliveryAddress: request.deliveryAddress as null | string,
		deliveryAmount: calculation.deliveryAmount,
		email: request.email,
		id: '90000000-0000-0000-0000-000000000000',
		items: calculation.items.map((item, index) => ({
			id: `90000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
			lineTotal: item.lineTotal,
			productId: item.productId,
			productName: item.productName as string,
			quantity: item.quantity,
			sku: item.sku as string,
			unitPrice: item.unitPrice as string
		})),
		orderNumber,
		phone: request.phone,
		status: 'new',
		statusHistory: [
			{
				changedAt: '2026-05-09T09:00:00.000Z',
				changedBy: 'system',
				id: '90000000-0000-0000-0000-000000000099',
				newStatus: 'new',
				oldStatus: null
			}
		],
		subtotalAmount: calculation.subtotalAmount,
		totalAmount: calculation.totalAmount,
		updatedAt: '2026-05-09T09:00:00.000Z'
	}
}
