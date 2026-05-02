import {OrderSummary} from '@/components/OrderSummary'
import {createAppStore} from '@/store'
import {clearCart} from '@/store/cartSlice'
import {App} from './App'
import {render, screen} from './test-utils'

const widths = [360, 1280]

it.each(
	widths
)('shows the catalog and opens a product with %o viewport', async width => {
	globalThis.happyDOM?.setViewport({width, height: 720})
	const {user} = render(<App />, {route: '/'})

	await expect(
		screen.findByRole('heading', {name: 'Лампы промышленного качества'})
	).resolves.toBeInTheDocument()

	await user.click(
		await screen.findByRole('link', {name: 'Лампа LED E27 12Вт 4000K'})
	)

	await expect(
		screen.findByRole('heading', {
			name: 'Лампа светодиодная E27 12Вт 4000K нейтральный белый'
		})
	).resolves.toBeInTheDocument()
	await expect(screen.findByText('Цоколь')).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Горящая лампа LED E27'}))
	await user.click(screen.getByRole('button', {name: 'Увеличить количество'}))
	await user.click(screen.getByRole('button', {name: 'Уменьшить количество'}))
	await user.click(screen.getByRole('button', {name: 'Добавить в корзину'}))
})

it('filters catalog products by category and search', async () => {
	const {user} = render(<App />, {route: '/catalog'})

	await expect(
		screen.findByRole('link', {name: 'Лампа LED E27 12Вт 4000K'})
	).resolves.toBeInTheDocument()

	await user.click(
		screen.getByRole('button', {
			name: 'Добавить Люминесцентная T8 18Вт в корзину'
		})
	)
	expect(screen.getByRole('link', {name: 'Корзина (4)'})).toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Галогеновые'}))
	expect(
		screen.getByRole('link', {name: 'Галогеновая G9 40Вт 2800K'})
	).toBeInTheDocument()
	expect(
		screen.queryByRole('link', {name: 'Лампа LED E27 12Вт 4000K'})
	).not.toBeInTheDocument()

	await user.type(screen.getByLabelText('Поиск'), 'missing')
	expect(
		screen.queryByRole('link', {name: 'Галогеновая G9 40Вт 2800K'})
	).not.toBeInTheDocument()
})

it('updates the cart and clears it', async () => {
	const {user} = render(<App />, {route: '/cart'})

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
		screen.getByRole('button', {name: 'Удалить Галогеновая G9 40Вт 2800K'})
	)
	expect(
		screen.queryByText('Галогеновая G9 40Вт 2800K')
	).not.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: /Очистить корзину/u}))
	expect(
		screen.getByRole('heading', {name: 'Корзина пуста'})
	).toBeInTheDocument()
})

it('moves from cart to checkout and confirmation', async () => {
	const {user} = render(<App />, {route: '/cart'})

	await expect(
		screen.findByRole('link', {name: /Оформить заказ/u})
	).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('link', {name: /Оформить заказ/u}))
	await expect(
		screen.findByRole('heading', {name: 'Контактные данные и доставка'})
	).resolves.toBeInTheDocument()

	await user.click(screen.getByRole('button', {name: 'Отправить заказ'}))
	await expect(
		screen.findByRole('heading', {name: 'Заказ успешно оформлен!'})
	).resolves.toBeInTheDocument()
	expect(
		screen.getByText('Ваш номер заказа: #ORD-2024-00847')
	).toBeInTheDocument()
})

it('redirects empty checkout back to the cart', async () => {
	const store = createAppStore()
	store.dispatch(clearCart())
	render(<App />, {route: '/checkout', store})

	await expect(
		screen.findByRole('heading', {name: 'Корзина пуста'})
	).resolves.toBeInTheDocument()
})

it('renders low-stock product details', async () => {
	render(<App />, {route: '/products/lum-t8-18w'})

	await expect(screen.findByText('Мало')).resolves.toBeInTheDocument()
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
