import {App} from '@/app/App'
import {
	halogenFixtureProduct,
	ledFixtureProduct,
	luminescentFixtureProduct
} from '@/test/productManagementFixtures'
import {render, screen, waitFor} from './test-utils'

it('filters catalog by debounced price range', async () => {
	const {user} = render(<App />, {route: '/catalog'})

	await expect(
		screen.findByRole('link', {name: ledFixtureProduct.shortName})
	).resolves.toBeInTheDocument()

	await user.type(screen.getByLabelText('Цена от'), '100')
	await user.type(screen.getByLabelText('Цена до'), '500')
	await waitFor(() => {
		expect(
			screen.queryByRole('link', {name: ledFixtureProduct.shortName})
		).not.toBeInTheDocument()
		expect(
			screen.queryByRole('link', {name: halogenFixtureProduct.shortName})
		).not.toBeInTheDocument()
		expect(
			screen.getByRole('link', {name: luminescentFixtureProduct.shortName})
		).toBeInTheDocument()
	})
})
