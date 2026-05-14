import {HttpResponse, http} from 'msw'
import {createAppStore} from '@/app/store'
import {productManagementServer} from '@/test/productManagementServer'
import {
	type AuthResponse,
	adminAuthStorageKey,
	authApi,
	clearStoredAdminAuth,
	getStoredAdminAccessToken,
	getStoredAdminAuth,
	type LoginRequest,
	type LogoutRequest,
	type RegisterRequest,
	storeAdminAuth
} from './authApi'

const adminAuthResponse: AuthResponse = {
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

it('registers admin users through auth-service', async () => {
	let requestBody: RegisterRequest | undefined
	let authorization: null | string = null
	productManagementServer.use(
		http.post('*/register', async ({request}) => {
			requestBody = (await request.json()) as RegisterRequest
			authorization = request.headers.get('authorization')

			return HttpResponse.json(
				{
					...adminAuthResponse,
					user: {
						...adminAuthResponse.user,
						email: requestBody.email,
						fullName: requestBody.fullName
					}
				},
				{status: 201}
			)
		})
	)

	const store = createAppStore()
	const response = await store
		.dispatch(
			authApi.endpoints.registerAdmin.initiate({
				accessToken: 'existing-admin-token',
				email: 'admin@example.com',
				fullName: 'Ivan Petrov',
				password: 'password123'
			})
		)
		.unwrap()

	expect(requestBody).toEqual({
		email: 'admin@example.com',
		fullName: 'Ivan Petrov',
		password: 'password123'
	})
	expect(authorization).toBe('Bearer existing-admin-token')
	expect(response.accessToken).toBe('access-token')
	expect(response.user.email).toBe('admin@example.com')
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toContain(
		'refresh-token'
	)
})

it('logs admin users in through auth-service', async () => {
	let requestBody: LoginRequest | undefined
	productManagementServer.use(
		http.post('*/login', async ({request}) => {
			requestBody = (await request.json()) as LoginRequest

			return HttpResponse.json({
				...adminAuthResponse,
				accessToken: 'login-access-token',
				refreshToken: 'login-refresh-token',
				user: {
					...adminAuthResponse.user,
					email: requestBody.email,
					fullName: null
				}
			})
		})
	)

	const store = createAppStore()
	const response = await store
		.dispatch(
			authApi.endpoints.loginAdmin.initiate({
				email: 'admin@example.com',
				password: 'password123'
			})
		)
		.unwrap()

	expect(requestBody).toEqual({
		email: 'admin@example.com',
		password: 'password123'
	})
	expect(response.accessToken).toBe('login-access-token')
	expect(response.user.email).toBe('admin@example.com')
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toContain(
		'login-refresh-token'
	)
})

it('logs admin users out through auth-service', async () => {
	let requestBody: LogoutRequest | undefined
	let authorization: null | string = null
	productManagementServer.use(
		http.post('*/logout', async ({request}) => {
			requestBody = (await request.json()) as LogoutRequest
			authorization = request.headers.get('authorization')

			return new HttpResponse(null, {status: 204})
		})
	)

	const store = createAppStore()
	await store
		.dispatch(
			authApi.endpoints.logoutAdmin.initiate({
				accessToken: 'access-token',
				refreshToken: 'refresh-token'
			})
		)
		.unwrap()

	expect(requestBody).toEqual({refreshToken: 'refresh-token'})
	expect(authorization).toBe('Bearer access-token')
})

it('reads, clears, and ignores invalid stored admin auth', () => {
	storeAdminAuth(adminAuthResponse)
	expect(getStoredAdminAuth()?.refreshToken).toBe('refresh-token')
	expect(getStoredAdminAccessToken()).toBe('access-token')

	clearStoredAdminAuth()
	expect(getStoredAdminAuth()).toBeUndefined()
	expect(getStoredAdminAccessToken()).toBeUndefined()

	globalThis.localStorage.setItem(adminAuthStorageKey, 'not-json')
	expect(getStoredAdminAuth()).toBeUndefined()
	expect(globalThis.localStorage.getItem(adminAuthStorageKey)).toBeNull()

	globalThis.localStorage.setItem(adminAuthStorageKey, JSON.stringify('token'))
	expect(getStoredAdminAuth()).toBeUndefined()

	globalThis.localStorage.setItem(
		adminAuthStorageKey,
		JSON.stringify({accessToken: '   '})
	)
	expect(getStoredAdminAccessToken()).toBeUndefined()
})

it('keeps stored tokens after failed auth mutations', async () => {
	storeAdminAuth(adminAuthResponse)
	productManagementServer.use(
		http.post('*/login', () =>
			HttpResponse.json({detail: 'Invalid email or password'}, {status: 401})
		),
		http.post('*/register', () =>
			HttpResponse.json({detail: 'unavailable'}, {status: 500})
		)
	)

	const store = createAppStore()

	await expect(
		store
			.dispatch(
				authApi.endpoints.loginAdmin.initiate({
					email: 'admin@example.com',
					password: 'wrong-password'
				})
			)
			.unwrap()
	).rejects.toBeDefined()
	expect(getStoredAdminAccessToken()).toBe('access-token')

	await expect(
		store
			.dispatch(
				authApi.endpoints.registerAdmin.initiate({
					accessToken: 'access-token',
					email: 'new-admin@example.com',
					password: 'password123'
				})
			)
			.unwrap()
	).rejects.toBeDefined()
	expect(getStoredAdminAccessToken()).toBe('access-token')
})
