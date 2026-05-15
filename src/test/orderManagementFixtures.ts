import type {
	CartCalculationRequest,
	CartCalculationResponse,
	CreateOrderRequest,
	OrderListResponse,
	OrderResponse
} from '@/shared/api/orderManagementApi'
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

export const adminOrderResponses: OrderResponse[] = [
	{
		comment: 'Позвонить перед доставкой.',
		companyName: null,
		createdAt: '2026-05-15T11:32:00.000Z',
		customerName: 'Иванов Иван Иванович',
		deliveryAddress: 'г. Москва, ул. Ленина, 42',
		deliveryAmount: '0.00',
		email: 'ivan@example.com',
		id: '10000000-0000-4000-8000-000000000001',
		items: [
			{
				id: '11000000-0000-4000-8000-000000000001',
				lineTotal: '890.00',
				productId: '11111111-1111-1111-1111-111111111111',
				productName: 'Лампа LED E27 12Вт',
				quantity: 10,
				sku: 'LED-E27-12W',
				unitPrice: '89.00'
			}
		],
		orderNumber: 'ORD-00847',
		phone: '+7 (999) 123-45-67',
		status: 'new',
		statusHistory: [
			{
				changedAt: '2026-05-15T11:32:00.000Z',
				changedBy: 'system',
				id: '12000000-0000-4000-8000-000000000001',
				newStatus: 'new',
				oldStatus: null
			}
		],
		subtotalAmount: '890.00',
		totalAmount: '890.00',
		updatedAt: '2026-05-15T11:32:00.000Z'
	},
	{
		comment: 'Нужен счет для оплаты по реквизитам.',
		companyName: 'ООО Свет-Электро',
		createdAt: '2026-05-15T09:10:00.000Z',
		customerName: 'Петров Алексей',
		deliveryAddress: 'г. Казань, пр-т Победы, 19',
		deliveryAmount: '600.00',
		email: 'order@svet-electro.ru',
		id: '10000000-0000-4000-8000-000000000002',
		items: [
			{
				id: '11000000-0000-4000-8000-000000000002',
				lineTotal: '12400.00',
				productId: '44444444-4444-4444-4444-444444444444',
				productName: 'Промышленный LED прожектор 50Вт',
				quantity: 8,
				sku: 'IND-LED-50W',
				unitPrice: '1550.00'
			}
		],
		orderNumber: 'ORD-00846',
		phone: '+7 (843) 555-10-20',
		status: 'processing',
		statusHistory: [
			{
				changedAt: '2026-05-15T09:10:00.000Z',
				changedBy: 'system',
				id: '12000000-0000-4000-8000-000000000002',
				newStatus: 'processing',
				oldStatus: 'confirmed'
			}
		],
		subtotalAmount: '11800.00',
		totalAmount: '12400.00',
		updatedAt: '2026-05-15T10:00:00.000Z'
	}
]

export function createOrderListResponse(
	orders: OrderResponse[] = adminOrderResponses
): OrderListResponse {
	return {
		items: orders.map(
			({
				companyName,
				createdAt,
				customerName,
				email,
				id,
				orderNumber: responseOrderNumber,
				phone,
				status,
				totalAmount,
				updatedAt
			}) => ({
				companyName,
				createdAt,
				customerName,
				email,
				id,
				orderNumber: responseOrderNumber,
				phone,
				status,
				totalAmount,
				updatedAt
			})
		),
		limit: 100,
		page: 1,
		total: orders.length
	}
}
