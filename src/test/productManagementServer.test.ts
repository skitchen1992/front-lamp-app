import {adminOrderResponses} from './orderManagementFixtures'

const apiOrigin = 'http://localhost'
const missingOrderId = '00000000-0000-4000-8000-000000000000'

function getFirstAdminOrder() {
	const [firstOrder] = adminOrderResponses
	if (!firstOrder) {
		throw new Error('Missing admin order fixture')
	}

	return firstOrder
}

it('serves default admin order management handlers', async () => {
	const firstOrder = getFirstAdminOrder()

	const listResponse = await fetch(`${apiOrigin}/api/v1/internal/orders`)
	expect(await listResponse.json()).toMatchObject({
		total: adminOrderResponses.length
	})

	const filteredResponse = await fetch(
		`${apiOrigin}/api/v1/internal/orders?status=processing`
	)
	expect(await filteredResponse.json()).toMatchObject({total: 1})

	const detailResponse = await fetch(
		`${apiOrigin}/api/v1/orders/${firstOrder.id}`
	)
	expect(await detailResponse.json()).toMatchObject({
		id: firstOrder.id,
		orderNumber: firstOrder.orderNumber
	})

	const missingDetailResponse = await fetch(
		`${apiOrigin}/api/v1/orders/${missingOrderId}`
	)
	expect(missingDetailResponse.status).toBe(404)

	const updateResponse = await fetch(
		`${apiOrigin}/api/v1/internal/orders/${firstOrder.id}/status`,
		{
			body: JSON.stringify({status: 'shipped'}),
			headers: {'content-type': 'application/json'},
			method: 'PATCH'
		}
	)
	expect(await updateResponse.json()).toMatchObject({
		id: firstOrder.id,
		status: 'shipped'
	})

	const missingUpdateResponse = await fetch(
		`${apiOrigin}/api/v1/internal/orders/${missingOrderId}/status`,
		{
			body: JSON.stringify({status: 'shipped'}),
			headers: {'content-type': 'application/json'},
			method: 'PATCH'
		}
	)
	expect(missingUpdateResponse.status).toBe(404)
})
