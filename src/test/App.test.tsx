import {HttpResponse, http} from 'msw'
import {App} from '@/app/App'
import {type AppStore, createAppStore} from '@/app/store'
import {OrderSummary} from '@/components/OrderSummary'
import {addToCart, clearCart} from '@/features/cart/cartSlice'
import {orderNumber} from '@/test/orderManagementFixtures'
import {
	halogenFixtureProduct,
	industrialFixtureProduct,
	ledFixtureProduct,
	productListResponse
} from '@/test/productManagementFixtures'
import {productManagementServer} from '@/test/productManagementServer'
import {render, screen, waitFor} from './test-utils'

const widths = [360, 1280]

function createStoreWithCart() {
	const store = createAppStore()
	seedCart(store)

	return store
}

function seedCart(store: AppStore) {
	store.dispatch(addToCart({product: ledFixtureProduct, quantity: 10}))
	store.dispatch(addToCart({product: halogenFixtureProduct, quantity: 5}))
	store.dispatch(addToCart({product: industrialFixtureProduct, quantity: 2}))
}

it.each(
	widths
)('shows the catalog and opens a product with %o viewport', async width => {
	globalThis.happyDOM?.setViewport({width, height: 720})
	const {user} = render(<App />, {route: '/'})

	await expect(
		screen.findByRole('heading', {name: 'Лампы промышленного качества'})
	).resolves.toBeInTheDocument()

	await user.click(
		await screen.findByRole('link', {name: ledFixtureProduct.shortName})
	)

	await expect(
		screen.findByRole('heading', {
			name: ledFixtureProduct.name
		})
	).resolves.toBeInTheDocument()
	await expect(
		screen.findByText('Статус каталога')
	).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Горящая лампа LED E27'}))
	await user.click(screen.getByRole('button', {name: 'Увеличить количество'}))
	await user.click(screen.getByRole('button', {name: 'Уменьшить количество'}))
	await user.click(screen.getByRole('button', {name: 'Добавить в корзину'}))
})

it('filters catalog products by category and search', async () => {
	const {user} = render(<App />, {route: '/catalog'})

	await expect(
		screen.findByRole('link', {name: ledFixtureProduct.shortName})
	).resolves.toBeInTheDocument()

	await user.click(
		screen.getByRole('button', {
			name: `Добавить ${ledFixtureProduct.shortName} в корзину`
		})
	)
	expect(screen.getByRole('link', {name: 'Корзина (1)'})).toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Галогеновые'}))
	expect(
		screen.getByRole('link', {name: halogenFixtureProduct.shortName})
	).toBeInTheDocument()
	expect(
		screen.queryByRole('link', {name: ledFixtureProduct.shortName})
	).not.toBeInTheDocument()

	await user.type(screen.getByLabelText('Поиск'), 'missing')
	await waitFor(() => {
		expect(
			screen.queryByRole('link', {name: halogenFixtureProduct.shortName})
		).not.toBeInTheDocument()
	})
})

it('shows catalog loading, empty, and error states', async () => {
	const {unmount} = render(<App />, {route: '/catalog'})
	expect(screen.getByRole('status')).toHaveTextContent('Загружаем каталог')
	unmount()

	productManagementServer.use(
		http.get('*/api/v1/products', () =>
			HttpResponse.json({...productListResponse, items: [], total: 0})
		)
	)
	const emptyCatalog = render(<App />, {route: '/catalog'})
	await expect(
		screen.findByText('Товары не найдены.')
	).resolves.toBeInTheDocument()
	emptyCatalog.unmount()

	productManagementServer.use(
		http.get('*/api/v1/products', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)
	render(<App />, {route: '/catalog'})
	await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
		'Не удалось загрузить товары'
	)
})

it('updates the cart and clears it', async () => {
	const {user} = render(<App />, {
		route: '/cart',
		store: createStoreWithCart()
	})

	await expect(
		screen.findByRole('heading', {name: 'Корзина — 3 товара'})
	).resolves.toBeInTheDocument()

	const incrementButtons = screen.getAllByRole('button', {
		name: 'Увеличить количество'
	})
	const [firstIncrementButton] = incrementButtons
	expect(firstIncrementButton).toBeDefined()
	await user.click(firstIncrementButton as HTMLElement)
	expect(screen.getByText('979 ₽')).toBeInTheDocument()

	const decrementButtons = screen.getAllByRole('button', {
		name: 'Уменьшить количество'
	})
	const [firstDecrementButton] = decrementButtons
	expect(firstDecrementButton).toBeDefined()
	await user.click(firstDecrementButton as HTMLElement)
	expect(screen.queryByText('979 ₽')).not.toBeInTheDocument()

	await user.click(
		screen.getByRole('button', {
			name: `Удалить ${halogenFixtureProduct.shortName}`
		})
	)
	expect(
		screen.queryByText(halogenFixtureProduct.shortName)
	).not.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: /Очистить корзину/u}))
	expect(
		screen.getByRole('heading', {name: 'Корзина пуста'})
	).toBeInTheDocument()
})

it('moves from cart to checkout and confirmation', async () => {
	const {user} = render(<App />, {
		route: '/cart',
		store: createStoreWithCart()
	})

	await expect(
		screen.findByRole('link', {name: /Оформить заказ/u})
	).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('link', {name: /Оформить заказ/u}))
	await expect(
		screen.findByRole('heading', {name: 'Контактные данные и доставка'})
	).resolves.toBeInTheDocument()

	await user.selectOptions(screen.getByLabelText(/Способ получения/u), 'pickup')
	await user.click(screen.getByRole('button', {name: 'Отправить заказ'}))
	await expect(
		screen.findByRole('heading', {name: 'Заказ успешно оформлен!'})
	).resolves.toBeInTheDocument()
	expect(
		screen.getByText(`Ваш номер заказа: ${orderNumber}`)
	).toBeInTheDocument()
	expect(screen.getByText('3 615 ₽')).toBeInTheDocument()
})

it('redirects empty checkout back to the cart', async () => {
	const store = createAppStore()
	store.dispatch(clearCart())
	render(<App />, {route: '/checkout', store})

	await expect(
		screen.findByRole('heading', {name: 'Корзина пуста'})
	).resolves.toBeInTheDocument()
})

it('shows checkout errors when order creation fails', async () => {
	productManagementServer.use(
		http.post('*/api/v1/orders', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)
	const {user} = render(<App />, {
		route: '/checkout',
		store: createStoreWithCart()
	})

	await expect(
		screen.findByRole('heading', {name: 'Контактные данные и доставка'})
	).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Отправить заказ'}))
	await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
		'Не удалось создать заказ'
	)
})

it('shows cart calculation errors from order management', async () => {
	const unavailableProduct = {
		...ledFixtureProduct,
		id: '55555555-5555-5555-5555-555555555555',
		name: 'Снятая с производства лампа',
		shortName: 'Снятая с производства лампа'
	}
	const store = createAppStore()
	store.dispatch(addToCart({product: unavailableProduct, quantity: 1}))

	render(<App />, {route: '/cart', store})

	await expect(
		screen.findByText(`Товар ${unavailableProduct.id} недоступен`)
	).resolves.toBeInTheDocument()
})

it('shows cart calculation transport errors', async () => {
	productManagementServer.use(
		http.post('*/api/v1/cart/calculate', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)

	render(<App />, {
		route: '/cart',
		store: createStoreWithCart()
	})

	await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
		'Не удалось пересчитать корзину'
	)
})

it('redirects confirmation without order data to catalog', async () => {
	render(<App />, {route: '/order-confirmation'})

	await expect(
		screen.findByRole('heading', {name: 'Лампы промышленного качества'})
	).resolves.toBeInTheDocument()
})

it('renders low-stock product details', async () => {
	render(<App />, {route: '/products/lum-t8-18w'})

	await expect(screen.findByText('Мало')).resolves.toBeInTheDocument()
})

it('shows product details loading and error states', async () => {
	const {unmount} = render(<App />, {route: '/products/led-e27-12w-4000k'})
	expect(screen.getByRole('status')).toHaveTextContent('Загружаем товар')
	unmount()

	productManagementServer.use(
		http.get('*/api/v1/products', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)
	render(<App />, {route: '/products/led-e27-12w-4000k'})
	await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
		'Не удалось загрузить товар'
	)
})

it('renders order summary without optional action blocks', () => {
	render(<OrderSummary />)

	expect(screen.getByRole('heading', {name: 'Итого'})).toBeInTheDocument()
	expect(screen.queryByText('Оформить заказ')).not.toBeInTheDocument()
})

it('redirects unknown routes to catalog', async () => {
	render(<App />, {route: '/products/invalid-product'})

	await expect(
		screen.findByRole('heading', {name: 'Лампы промышленного качества'})
	).resolves.toBeInTheDocument()
})
