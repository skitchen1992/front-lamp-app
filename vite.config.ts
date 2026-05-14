/// <reference types="vitest/config" />

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

const apiGatewayTarget = 'http://127.0.0.1:8000'
const authProxyPaths = ['/register', '/login', '/refresh', '/logout', '/me']

export default defineConfig(() => ({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	},
	server: {
		proxy: {
			'/api': {
				changeOrigin: true,
				target: apiGatewayTarget
			},
			...Object.fromEntries(
				authProxyPaths.map(authPath => [
					authPath,
					{
						changeOrigin: true,
						target: apiGatewayTarget
					}
				])
			)
		}
	},
	test: {
		bail: 1,
		clearMocks: true,
		coverage: {
			enabled: true,
			exclude: [
				'src/app/main.tsx',
				'src/pages/admin/**',
				'src/**/*.css',
				'src/**/*.d.ts'
			],
			include: ['src/**/*'],
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage',
			thresholds: {
				'100': true
			}
		},
		css: false,
		environment: 'happy-dom',
		globals: true,
		include: ['src/**/*.test.ts?(x)'],
		setupFiles: 'src/test/test-setup.ts'
	}
}))
