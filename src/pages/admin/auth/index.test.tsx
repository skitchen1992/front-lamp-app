import {HttpResponse, http} from 'msw'
import {App} from '@/app/App'
import {adminAuthStorageKey} from '@/shared/api/authApi'
import {productManagementServer} from '@/test/productManagementServer'
import {render, screen, waitFor} from '@/test/test-utils'

const adminAuthResponse = {
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
}

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

			return HttpResponse.json(adminAuthResponse, {status: 201})
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
})

it('stores login tokens and opens the admin dashboard', async () => {
	let requestBody: unknown
	productManagementServer.use(
		http.post('*/login', async ({request}) => {
			requestBody = await request.json()

			return HttpResponse.json({
				...adminAuthResponse,
				accessToken: 'login-access-token',
				refreshToken: 'login-refresh-token',
				user: {
					...adminAuthResponse.user,
					fullName: null
				}
			})
		})
	)

	const {user} = render(<App />, {route: '/admin/login'})

	await user.type(screen.getByLabelText('E-mail'), 'admin@example.com')
	await user.type(screen.getByLabelText('Пароль'), 'password123')
	await user.click(screen.getByRole('button', {name: 'Войти'}))

	await expect(
		screen.findByRole('heading', {name: 'Дашборд'})
	).resolves.toBeInTheDocument()
	expect(requestBody).toEqual({
		email: 'admin@example.com',
		password: 'password123'
	})
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toContain(
		'login-access-token'
	)
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toContain(
		'login-refresh-token'
	)
})

it('redirects admin routes without stored tokens', async () => {
	render(<App />, {route: '/admin/dashboard'})

	await expect(
		screen.findByRole('heading', {name: 'Вход в админку'})
	).resolves.toBeInTheDocument()
})

it('logs out by clearing tokens and returning to login', async () => {
	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify(adminAuthResponse)
	)
	let logoutRequestBody: unknown
	let authorization: null | string = null
	productManagementServer.use(
		http.post('*/logout', async ({request}) => {
			logoutRequestBody = await request.json()
			authorization = request.headers.get('authorization')

			return new HttpResponse(null, {status: 204})
		})
	)

	const {user} = render(<App />, {route: '/admin/dashboard'})

	await expect(
		screen.findByRole('heading', {name: 'Дашборд'})
	).resolves.toBeInTheDocument()
	await user.click(screen.getByRole('button', {name: 'Выйти из админки'}))

	await waitFor(() => {
		expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toBeNull()
	})
	expect(logoutRequestBody).toEqual({refreshToken: 'refresh-token'})
	expect(authorization).toBe('Bearer access-token')
	await expect(
		screen.findByRole('heading', {name: 'Вход в админку'})
	).resolves.toBeInTheDocument()
})
