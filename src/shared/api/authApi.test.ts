import {HttpResponse, http} from 'msw'
import {createAppStore} from '@/app/store'
import {productManagementServer} from '@/test/productManagementServer'
import {authApi, type LoginRequest, type RegisterRequest} from './authApi'

it('registers admin users through auth-service', async () => {
	let requestBody: RegisterRequest | undefined
	let authorization: null | string = null
	productManagementServer.use(
		http.post('*/register', async ({request}) => {
			requestBody = (await request.json()) as RegisterRequest
			authorization = request.headers.get('authorization')

			return HttpResponse.json(
				{
					accessToken: 'access-token',
					expiresIn: 3600,
					refreshToken: 'refresh-token',
					tokenType: 'Bearer',
					user: {
						createdAt: '2026-05-14T00:00:00.000Z',
						email: requestBody.email,
						fullName: requestBody.fullName,
						id: '11111111-1111-4111-8111-111111111111',
						isActive: true,
						updatedAt: '2026-05-14T00:00:00.000Z'
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
})

it('logs admin users in through auth-service', async () => {
	let requestBody: LoginRequest | undefined
	productManagementServer.use(
		http.post('*/login', async ({request}) => {
			requestBody = (await request.json()) as LoginRequest

			return HttpResponse.json({
				accessToken: 'login-access-token',
				expiresIn: 3600,
				refreshToken: 'login-refresh-token',
				tokenType: 'Bearer',
				user: {
					createdAt: '2026-05-14T00:00:00.000Z',
					email: requestBody.email,
					fullName: null,
					id: '11111111-1111-4111-8111-111111111111',
					isActive: true,
					updatedAt: '2026-05-14T00:00:00.000Z'
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
})
