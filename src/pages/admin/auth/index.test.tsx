import {HttpResponse, http} from 'msw'
import {App} from '@/app/App'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import {productManagementServer} from '@/test/productManagementServer'
import {render, screen, waitFor} from '@/test/test-utils'

it('creates an admin account from the registration route', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: 'existing-admin-token'})
	)
	let requestBody: unknown
	let authorization: null | string = null
	productManagementServer.use(
		http.post('*/register', async ({request}) => {
			requestBody = await request.json()
			authorization = request.headers.get('authorization')

			return HttpResponse.json(
				{
					accessToken: 'access-token',
					expiresIn: 3600,
					refreshToken: 'refresh-token',
					tokenType: 'Bearer',
					user: {
						createdAt: '2026-05-14T00:00:00.000Z',
						email: 'admin@example.com',
						fullName: 'Ivan Petrov',
						id: '11111111-1111-4111-8111-111111111111',
						isActive: true,
						updatedAt: '2026-05-14T00:00:00.000Z'
					}
				},
				{status: 201}
			)
		})
	)

	const {user} = render(<App />, {route: '/admin/register'})

	await user.type(screen.getByLabelText('Имя администратора'), 'Ivan Petrov')
	await user.type(screen.getByLabelText('E-mail'), 'admin@example.com')
	await user.type(screen.getByLabelText('Пароль'), 'password123')
	await user.type(screen.getByLabelText('Повторите пароль'), 'password123')
	await user.click(screen.getByRole('button', {name: 'Создать аккаунт'}))

	await expect(
		screen.findByRole('heading', {name: 'Дашборд'})
	).resolves.toBeInTheDocument()
	await waitFor(() => {
		expect(requestBody).toEqual({
			email: 'admin@example.com',
			fullName: 'Ivan Petrov',
			password: 'password123'
		})
	})
	expect(authorization).toBe('Bearer existing-admin-token')
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toContain(
		'access-token'
	)
	globalThis.localStorage.removeItem(adminAuthStorageKey)
})
