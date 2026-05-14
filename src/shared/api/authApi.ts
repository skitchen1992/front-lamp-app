import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export interface RegisterRequest {
	email: string
	fullName?: string
	password: string
}

export interface RegisterAdminRequest extends RegisterRequest {
	accessToken: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface LogoutRequest {
	accessToken: string
	refreshToken: string
}

export interface UserResponse {
	createdAt: string
	email: string
	fullName?: null | string
	id: string
	isActive: boolean
	updatedAt: string
}

export interface AuthResponse {
	accessToken: string
	expiresIn: number
	refreshToken: string
	tokenType: string
	user: UserResponse
}

export const adminAuthStorageKey = 'lampozavod.admin.auth'

export function storeAdminAuth(auth: AuthResponse) {
	globalThis.localStorage.setItem(adminAuthStorageKey, JSON.stringify(auth))
}

export function clearStoredAdminAuth() {
	globalThis.localStorage.removeItem(adminAuthStorageKey)
}

export function getStoredAdminAuth(): Partial<AuthResponse> | undefined {
	let storedAuth: Partial<AuthResponse> | undefined

	try {
		const rawAuth = globalThis.localStorage.getItem(adminAuthStorageKey)
		if (!rawAuth) {
			return storedAuth
		}

		const auth = JSON.parse(rawAuth)
		if (isRecord(auth)) {
			storedAuth = auth as Partial<AuthResponse>
		}
	} catch {
		clearStoredAdminAuth()
	}

	return storedAuth
}

export function getStoredAdminAccessToken(): string | undefined {
	const auth = getStoredAdminAuth()
	const {accessToken: storedAccessToken} = auth ?? {}
	let accessToken: string | undefined

	if (typeof storedAccessToken === 'string' && storedAccessToken.trim()) {
		accessToken = storedAccessToken
	}

	return accessToken
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

const defaultAuthBaseUrl = globalThis.location.origin

export const authBaseUrl = (
	import.meta.env.VITE_AUTH_API_URL ?? defaultAuthBaseUrl
).replace(/\/+$/u, '')

export const authApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: authBaseUrl
	}),
	endpoints: builder => ({
		loginAdmin: builder.mutation<AuthResponse, LoginRequest>({
			async onQueryStarted(_, {queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					storeAdminAuth(data)
				} catch {
					// Failed login attempts must not mutate the stored admin session.
				}
			},
			query: request => ({
				body: request,
				method: 'POST',
				url: '/login'
			})
		}),
		logoutAdmin: builder.mutation<void, LogoutRequest>({
			query: ({accessToken, refreshToken}) => ({
				body: {refreshToken},
				headers: {
					authorization: `Bearer ${accessToken}`
				},
				method: 'POST',
				url: '/logout'
			})
		}),
		registerAdmin: builder.mutation<AuthResponse, RegisterAdminRequest>({
			async onQueryStarted(_, {queryFulfilled}) {
				try {
					const {data} = await queryFulfilled
					storeAdminAuth(data)
				} catch {
					// Keep the previous session if admin registration fails.
				}
			},
			query: ({accessToken, ...request}) => ({
				body: request,
				headers: {
					authorization: `Bearer ${accessToken}`
				},
				method: 'POST',
				url: '/register'
			})
		})
	}),
	reducerPath: 'authApi'
})

export const {
	useLoginAdminMutation,
	useLogoutAdminMutation,
	useRegisterAdminMutation
} = authApi
