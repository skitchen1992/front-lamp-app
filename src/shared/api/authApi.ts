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
			query: request => ({
				body: request,
				method: 'POST',
				url: '/login'
			})
		}),
		registerAdmin: builder.mutation<AuthResponse, RegisterAdminRequest>({
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

export const {useLoginAdminMutation, useRegisterAdminMutation} = authApi
