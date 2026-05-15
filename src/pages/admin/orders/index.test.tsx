import {HttpResponse, http} from 'msw'
import {App} from '@/app/App'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import type {
	OrderResponse,
	UpdateOrderStatusRequest
} from '@/shared/api/orderManagementApi'
import {
	adminOrderResponses,
	createOrderListResponse
} from '@/test/orderManagementFixtures'
import {productManagementServer} from '@/test/productManagementServer'
import {render, screen, waitFor} from '@/test/test-utils'

interface AdminOrderApiSpy {
	authorizationHeaders: Array<null | string>
	detailRequests: string[]
	listStatuses: Array<null | string>
	orders: OrderResponse[]
	statusUpdateRequests: Array<{
		body: UpdateOrderStatusRequest
		orderId: string
	}>
}

function cloneOrderResponses() {
	return adminOrderResponses.map(orderItem => ({
		...orderItem,
		items: orderItem.items.map(item => ({...item})),
		statusHistory: orderItem.statusHistory.map(item => ({...item}))
	}))
}

function setupAdminOrderApi() {
	const spy: AdminOrderApiSpy = {
		authorizationHeaders: [],
		detailRequests: [],
		listStatuses: [],
		orders: cloneOrderResponses(),
		statusUpdateRequests: []
	}

	productManagementServer.use(
		createListOrdersHandler(spy),
		createGetOrderHandler(spy),
		createUpdateOrderStatusHandler(spy)
	)

	return spy
}

function createListOrdersHandler(spy: AdminOrderApiSpy) {
	return http.get('*/api/v1/internal/orders', ({request}) => {
		spy.authorizationHeaders.push(request.headers.get('authorization'))
		const url = new URL(request.url)
		const status = url.searchParams.get('status')
		spy.listStatuses.push(status)
		const filteredOrders = status
			? spy.orders.filter(orderItem => orderItem.status === status)
			: spy.orders

		return HttpResponse.json(createOrderListResponse(filteredOrders))
	})
}

function createGetOrderHandler(spy: AdminOrderApiSpy) {
	return http.get('*/api/v1/orders/:orderId', ({params, request}) => {
		spy.authorizationHeaders.push(request.headers.get('authorization'))
		const {orderId: routeOrderId} = params
		const orderId = String(routeOrderId)
		spy.detailRequests.push(orderId)
		const selectedOrder = spy.orders.find(orderItem => orderItem.id === orderId)

		return selectedOrder
			? HttpResponse.json(selectedOrder)
			: HttpResponse.json({detail: 'Order not found'}, {status: 404})
	})
}

function createUpdateOrderStatusHandler(spy: AdminOrderApiSpy) {
	return http.patch(
		'*/api/v1/internal/orders/:orderId/status',
		async ({params, request}) => {
			spy.authorizationHeaders.push(request.headers.get('authorization'))
			const {orderId: routeOrderId} = params
			const orderId = String(routeOrderId)
			const body = (await request.json()) as UpdateOrderStatusRequest
			spy.statusUpdateRequests.push({body, orderId})
			spy.orders = spy.orders.map(orderItem =>
				orderItem.id === orderId
					? {...orderItem, status: body.status}
					: orderItem
			)
			const selectedOrder = spy.orders.find(
				orderItem => orderItem.id === orderId
			)

			return selectedOrder
				? HttpResponse.json(selectedOrder)
				: HttpResponse.json({detail: 'Order not found'}, {status: 404})
		}
	)
}

it('loads admin orders from order management and updates status', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)
	const spy = setupAdminOrderApi()

	const {user} = render(<App />, {route: '/admin/orders'})

	await expect(screen.findByText('#ORD-00847')).resolves.toBeInTheDocument()
	await expect(
		screen.findByRole('heading', {name: 'Заказ #ORD-00847'})
	).resolves.toBeInTheDocument()
	expect(spy.listStatuses).toContain(null)
	expect(spy.detailRequests).toContain(adminOrderResponses[0]?.id)
	expect(spy.authorizationHeaders).toContain('Bearer admin-token')

	const [processingTab] = screen.getAllByRole('button', {name: 'В работе'})
	expect(processingTab).toBeDefined()
	await user.click(processingTab as HTMLElement)
	await expect(screen.findByText('#ORD-00846')).resolves.toBeInTheDocument()
	await expect(
		screen.findByRole('heading', {name: 'Заказ #ORD-00846'})
	).resolves.toBeInTheDocument()
	await waitFor(() => {
		expect(spy.listStatuses).toContain('processing')
	})

	const [, shippedButton] = await screen.findAllByRole('button', {
		name: 'Отгружен'
	})
	expect(shippedButton).toBeDefined()
	await user.click(shippedButton as HTMLElement)

	await waitFor(() => {
		expect(spy.statusUpdateRequests).toEqual([
			{
				body: {status: 'shipped'},
				orderId: adminOrderResponses[1]?.id
			}
		])
	})
})
