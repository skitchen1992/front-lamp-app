import {HttpResponse, http} from 'msw'
import {createAppStore} from '@/app/store'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import {adminOrderResponses} from '@/test/orderManagementFixtures'
import {productManagementServer} from '@/test/productManagementServer'
import {orderManagementApi} from './orderManagementApi'

function getFirstAdminOrder() {
	const [firstOrder] = adminOrderResponses
	if (!firstOrder) {
		throw new Error('Missing admin order fixture')
	}

	return firstOrder
}

it('handles failed admin order lists without cached order tags', async () => {
	productManagementServer.use(
		http.get('*/api/v1/internal/orders', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)
	const store = createAppStore()

	const result = await store.dispatch(
		orderManagementApi.endpoints.listOrders.initiate({
			limit: 100,
			page: 1
		})
	)

	expect(result.status).toBe('rejected')
})

it('sends optional admin order status comments', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)
	const firstOrder = getFirstAdminOrder()
	const store = createAppStore()
	let requestBody: unknown
	let authorization: null | string = null

	productManagementServer.use(
		http.patch(
			'*/api/v1/internal/orders/:orderId/status',
			async ({request}) => {
				authorization = request.headers.get('authorization')
				requestBody = await request.json()

				return HttpResponse.json({
					...firstOrder,
					status: 'canceled'
				})
			}
		)
	)

	await store
		.dispatch(
			orderManagementApi.endpoints.updateOrderStatus.initiate({
				comment: 'Клиент попросил отменить заказ',
				orderId: firstOrder.id,
				status: 'canceled'
			})
		)
		.unwrap()

	expect(authorization).toBe('Bearer admin-token')
	expect(requestBody).toEqual({
		comment: 'Клиент попросил отменить заказ',
		status: 'canceled'
	})
})
