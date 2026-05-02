import {expect, test} from '@playwright/test'

const CHECKOUT_LINK_NAME = /Оформить заказ/u

test('renders the lamp catalog and opens one product', async ({page}) => {
	await page.goto('/')

	await expect(
		page.getByRole('heading', {name: 'Лампы промышленного качества'})
	).toBeVisible()

	await page.getByRole('link', {name: 'Лампа LED E27 12Вт 4000K'}).click()

	await expect(
		page.getByRole('heading', {
			name: 'Лампа светодиодная E27 12Вт 4000K нейтральный белый'
		})
	).toBeVisible()
	await expect(page.getByText('Цоколь')).toBeVisible()
})

test('moves through cart checkout and confirmation', async ({page}) => {
	await page.goto('/cart')

	await expect(
		page.getByRole('heading', {name: 'Корзина — 3 товара'})
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
