import {App} from '@/app/App'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import {
	halogenCategoryResponse,
	halogenFixtureProduct,
	industrialFixtureProduct,
	ledFixtureProduct
} from '@/test/productManagementFixtures'
import {render, screen, waitFor} from '@/test/test-utils'

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
