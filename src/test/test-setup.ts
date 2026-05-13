import '@testing-library/jest-dom/vitest'
import {afterAll, afterEach, beforeAll} from 'vitest'
import {productManagementServer} from './productManagementServer'

beforeAll(() => {
	productManagementServer.listen({onUnhandledRequest: 'error'})
})

afterEach(() => {
	productManagementServer.resetHandlers()
})

afterAll(() => {
	productManagementServer.close()
})
