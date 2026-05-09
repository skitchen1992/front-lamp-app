import {type APIRequestContext, expect, test} from '@playwright/test'
import type {
	ProductListResponse,
	ProductSummaryResponse
} from '../src/data/products'

const CHECKOUT_LINK_NAME = /Оформить заказ/u

async function getLiveProduct(request: APIRequestContext) {
	const response = await request.get(
		'/product-management/api/v1/products?limit=100&page=1&status=active'
	)
	expect(response.ok()).toBe(true)

	const products = (await response.json()) as ProductListResponse
	expect(products.items.length).toBeGreaterThan(0)

	const [product] = products.items
	expect(product).toBeDefined()

	return product as ProductSummaryResponse
}

test('renders the live lamp catalog and opens one product', async ({
	page,
	request
}) => {
	const product = await getLiveProduct(request)

	await page.goto('/')

	await expect(
		page.getByRole('heading', {name: 'Лампы промышленного качества'})
	).toBeVisible()
	await expect(
		page.locator(`a[href="/products/${product.slug}"]`).first()
	).toBeVisible()

	await page.locator(`a[href="/products/${product.slug}"]`).first().click()

	await expect(page.getByRole('heading', {name: product.name})).toBeVisible()
	await expect(page.getByText('Статус каталога')).toBeVisible()
})

test('moves through cart checkout and confirmation with live products', async ({
	page,
	request
}) => {
	const product = await getLiveProduct(request)

	await page.goto('/catalog')
	await expect(
		page.locator(`a[href="/products/${product.slug}"]`).first()
	).toBeVisible()
	await page
		.getByRole('button', {name: `Добавить ${product.name} в корзину`})
		.first()
		.click()

	await page.getByRole('link', {name: 'Корзина (1)'}).click()
	await expect(
		page.getByRole('heading', {name: 'Корзина — 1 товар'})
	).toBeVisible()
	await page.getByRole('link', {name: CHECKOUT_LINK_NAME}).click()
	await expect(
		page.getByRole('heading', {name: 'Контактные данные и доставка'})
	).toBeVisible()

	await page.getByRole('button', {name: 'Отправить заказ'}).click()
	await expect(
		page.getByRole('heading', {name: 'Заказ успешно оформлен!'})
	).toBeVisible()
})
