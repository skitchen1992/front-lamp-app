// biome-ignore-all lint/nursery/noExcessiveLinesPerFile: Admin products integration tests keep related API scenarios together.
import {HttpResponse, http} from 'msw'
import {vi} from 'vitest'
import {App} from '@/app/App'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import {
	halogenCategoryResponse,
	halogenFixtureProduct,
	industrialFixtureProduct,
	ledCategoryResponse,
	ledFixtureProduct,
	productListResponse,
	productResponses
} from '@/test/productManagementFixtures'
import {productManagementServer} from '@/test/productManagementServer'
import {fireEvent, render, screen, waitFor} from '@/test/test-utils'

interface CapturedCreateProductRequest {
	categoryId: string
	currency: string
	fullDescription: null | string
	isFeatured: boolean
	name: string
	price: string
	shortDescription: null | string
	sku: string
	slug: string
	status: string
	stockQty: number
}

interface CapturedUpdateProductRequest
	extends Omit<CapturedCreateProductRequest, 'status' | 'stockQty'> {}

interface CapturedStockUpdateRequest {
	deltaQty: number
	reason: string
	source: string
}

interface CapturedStatusUpdateRequest {
	status: string
}

const productIdRouteParameter = 'productId'

function getRouteProductId(
	params: Record<string, readonly string[] | string | undefined>
) {
	return String(params[productIdRouteParameter])
}

function getLedProductResponse() {
	const ledProductResponse = productResponses.find(
		product => product.id === ledFixtureProduct.id
	)
	if (!ledProductResponse) {
		throw new Error('Missing LED product fixture')
	}

	return ledProductResponse
}

function getLedProductSummaryResponse() {
	const ledProductResponse = productListResponse.items.find(
		product => product.id === ledFixtureProduct.id
	)
	if (!ledProductResponse) {
		throw new Error('Missing LED product summary fixture')
	}

	return ledProductResponse
}

it('loads admin products from the product management API and filters them', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)

	const {user} = render(<App />, {route: '/admin/products'})

	await expect(
		screen.findByText(ledFixtureProduct.name)
	).resolves.toBeInTheDocument()
	expect(
		screen.queryByText('Лампа LED E27 12Вт 4000K нейтральный белый')
	).not.toBeInTheDocument()

	await user.selectOptions(
		screen.getByLabelText('Категория'),
		halogenCategoryResponse.id
	)
	expect(screen.getByText(halogenFixtureProduct.name)).toBeInTheDocument()
	expect(screen.queryByText(ledFixtureProduct.name)).not.toBeInTheDocument()

	await user.selectOptions(screen.getByLabelText('Категория'), 'all')
	await user.type(screen.getByLabelText('Поиск по товару'), 'ind')

	await waitFor(() => {
		expect(screen.getByText(industrialFixtureProduct.name)).toBeInTheDocument()
		expect(screen.queryByText(ledFixtureProduct.name)).not.toBeInTheDocument()
	})
})

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: The scenario verifies the full edit request sequence.
it('edits a product through product, stock, and status endpoints', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)

	const ledProductResponse = getLedProductResponse()
	const updateProductRequests: unknown[] = []
	const stockUpdateRequests: unknown[] = []
	const statusUpdateRequests: unknown[] = []
	productManagementServer.use(
		http.put(
			'*/api/v1/internal/products/:productId',
			async ({params, request}) => {
				const productId = getRouteProductId(params)
				expect(request.headers.get('authorization')).toBe('Bearer admin-token')
				const requestBody =
					(await request.json()) as CapturedUpdateProductRequest
				updateProductRequests.push(requestBody)

				return HttpResponse.json({
					...ledProductResponse,
					...requestBody,
					id: productId,
					status: ledProductResponse.status,
					stockQty: ledProductResponse.stockQty,
					updatedAt: '2026-05-15T12:00:00Z'
				})
			}
		),
		http.patch(
			'*/api/v1/internal/products/:productId/stock',
			async ({params, request}) => {
				const productId = getRouteProductId(params)
				expect(request.headers.get('authorization')).toBe('Bearer admin-token')
				const requestBody = (await request.json()) as CapturedStockUpdateRequest
				stockUpdateRequests.push(requestBody)

				return HttpResponse.json({
					...ledProductResponse,
					id: productId,
					stockQty: ledProductResponse.stockQty + requestBody.deltaQty,
					updatedAt: '2026-05-15T12:00:00Z'
				})
			}
		),
		http.patch(
			'*/api/v1/internal/products/:productId/status',
			async ({params, request}) => {
				const productId = getRouteProductId(params)
				expect(request.headers.get('authorization')).toBe('Bearer admin-token')
				const requestBody =
					(await request.json()) as CapturedStatusUpdateRequest
				statusUpdateRequests.push(requestBody)

				return HttpResponse.json({
					...ledProductResponse,
					id: productId,
					status: requestBody.status,
					updatedAt: '2026-05-15T12:00:00Z'
				})
			}
		)
	)

	const {user} = render(<App />, {
		route: `/admin/products/${ledFixtureProduct.id}/edit`
	})

	await expect(
		screen.findByDisplayValue(ledFixtureProduct.name)
	).resolves.toBeInTheDocument()
	await expect(
		screen.findByRole('option', {name: ledCategoryResponse.name})
	).resolves.toBeInTheDocument()

	await user.clear(screen.getByLabelText('Наименование товара'))
	await user.type(
		screen.getByLabelText('Наименование товара'),
		'Лампа LED E27 обновленная'
	)
	await user.clear(screen.getByLabelText('Цена товара'))
	await user.type(screen.getByLabelText('Цена товара'), '99.90')
	await user.clear(screen.getByLabelText('Остаток товара'))
	await user.type(screen.getByLabelText('Остаток товара'), '850')
	await user.selectOptions(screen.getByLabelText('Статус товара'), 'draft')
	const productForm = screen
		.getByLabelText('Наименование товара')
		.closest('form')
	expect(productForm).toBeInstanceOf(HTMLFormElement)
	fireEvent.submit(productForm as HTMLFormElement)

	await waitFor(() => {
		expect(globalThis.location.pathname).toBe('/admin/products')
	})
	expect(updateProductRequests).toEqual([
		{
			categoryId: ledCategoryResponse.id,
			currency: 'RUB',
			fullDescription: ledProductResponse.fullDescription,
			isFeatured: true,
			name: 'Лампа LED E27 обновленная',
			price: '99.90',
			shortDescription: ledProductResponse.shortDescription,
			sku: ledProductResponse.sku,
			slug: ledProductResponse.slug
		}
	])
	expect(stockUpdateRequests).toEqual([
		{
			deltaQty: 3,
			reason: 'Корректировка остатка из админки',
			source: 'admin-products'
		}
	])
	expect(statusUpdateRequests).toEqual([{status: 'draft'}])
})

it('deletes a product from the admin products table', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)

	const originalConfirm = Reflect.get(globalThis, 'confirm') as
		| typeof globalThis.confirm
		| undefined
	const confirmMock = vi.fn(() => true)
	globalThis.confirm = confirmMock
	const deleteProductRequests: string[] = []
	const ledProductResponse = getLedProductResponse()
	productManagementServer.use(
		http.delete(
			'*/api/v1/internal/products/:productId',
			({params, request}) => {
				const productId = getRouteProductId(params)
				expect(request.headers.get('authorization')).toBe('Bearer admin-token')
				deleteProductRequests.push(productId)

				return HttpResponse.json({
					...ledProductResponse,
					id: productId,
					status: 'archived'
				})
			}
		)
	)

	const {user} = render(<App />, {route: '/admin/products'})

	await expect(
		screen.findByText(ledFixtureProduct.name)
	).resolves.toBeInTheDocument()
	await user.click(
		screen.getByRole('button', {name: `Удалить ${ledFixtureProduct.name}`})
	)

	await waitFor(() => {
		expect(deleteProductRequests).toEqual([ledFixtureProduct.id])
	})
	expect(confirmMock).toHaveBeenCalledWith(
		`Удалить товар «${ledFixtureProduct.name}»? Он будет перемещен в архив.`
	)
	if (originalConfirm) {
		globalThis.confirm = originalConfirm
	} else {
		Reflect.deleteProperty(globalThis, 'confirm')
	}
})

it('restores an archived product from the admin products table', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)

	const archivedProduct = {
		...getLedProductSummaryResponse(),
		status: 'archived' as const
	}
	const statusUpdateRequests: unknown[] = []
	productManagementServer.use(
		http.get('*/api/v1/products', () =>
			HttpResponse.json({
				...productListResponse,
				items: [archivedProduct],
				total: 1
			})
		),
		http.patch(
			'*/api/v1/internal/products/:productId/status',
			async ({params, request}) => {
				const productId = getRouteProductId(params)
				expect(request.headers.get('authorization')).toBe('Bearer admin-token')
				const requestBody =
					(await request.json()) as CapturedStatusUpdateRequest
				statusUpdateRequests.push(requestBody)

				return HttpResponse.json({
					...archivedProduct,
					id: productId,
					status: requestBody.status,
					updatedAt: '2026-05-15T12:00:00Z'
				})
			}
		)
	)

	const {user} = render(<App />, {route: '/admin/products'})

	await expect(
		screen.findByText(ledFixtureProduct.name)
	).resolves.toBeInTheDocument()
	await user.click(screen.getByRole('button', {name: 'Восстановить'}))

	await waitFor(() => {
		expect(statusUpdateRequests).toEqual([{status: 'active'}])
	})
})

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: The scenario keeps API mock, form fill, and request assertion together.
it('creates a product from the admin product editor', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'admin-token'})
	)

	const createProductRequests: unknown[] = []
	productManagementServer.use(
		http.post('*/api/v1/internal/products', async ({request}) => {
			expect(request.headers.get('authorization')).toBe('Bearer admin-token')
			const requestBody = (await request.json()) as CapturedCreateProductRequest
			createProductRequests.push(requestBody)

			return HttpResponse.json(
				{
					category: ledCategoryResponse,
					categoryId: requestBody.categoryId,
					createdAt: '2026-05-15T12:00:00Z',
					currency: requestBody.currency,
					fullDescription: requestBody.fullDescription,
					id: '55555555-5555-5555-5555-555555555555',
					images: [],
					isFeatured: requestBody.isFeatured,
					name: requestBody.name,
					price: requestBody.price,
					shortDescription: requestBody.shortDescription,
					sku: requestBody.sku,
					slug: requestBody.slug,
					status: requestBody.status,
					stockQty: requestBody.stockQty,
					updatedAt: '2026-05-15T12:00:00Z'
				},
				{status: 201}
			)
		})
	)

	const {user} = render(<App />, {route: '/admin/products/new'})

	await expect(
		screen.findByText(ledCategoryResponse.name)
	).resolves.toBeInTheDocument()
	await user.type(screen.getByLabelText('Наименование товара'), 'Тестовая LED')
	await user.type(screen.getByLabelText('Артикул товара'), 'NEW-LED-15W')
	await user.type(
		screen.getByLabelText('Краткое описание товара'),
		'Новая позиция для каталога'
	)
	await user.type(screen.getByLabelText('Цена товара'), '159.90')
	await user.type(screen.getByLabelText('Остаток товара'), '24')
	expect(
		screen.getByRole('button', {name: /создать товар/iu})
	).toBeInTheDocument()
	const productForm = screen
		.getByLabelText('Наименование товара')
		.closest('form')
	expect(productForm).toBeInstanceOf(HTMLFormElement)
	fireEvent.submit(productForm as HTMLFormElement)

	await waitFor(() => {
		expect(globalThis.location.pathname).toBe('/admin/products')
	})
	expect(createProductRequests).toEqual([
		{
			categoryId: ledCategoryResponse.id,
			currency: 'RUB',
			fullDescription: null,
			isFeatured: false,
			name: 'Тестовая LED',
			price: '159.90',
			shortDescription: 'Новая позиция для каталога',
			sku: 'NEW-LED-15W',
			slug: 'new-led-15w',
			status: 'active',
			stockQty: 24
		}
	])
})
