it('mocks product details 404 responses', async () => {
	const response = await fetch(
		`${globalThis.location.origin}/api/v1/products/missing-product`
	)

	expect(response.status).toBe(404)
	await expect(response.json()).resolves.toEqual({detail: 'Product not found'})
})
