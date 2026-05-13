/// <reference types="vitest/config" />

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

const productManagementProxyPrefix = /^\/product-management/u
const orderManagementProxyPrefix = /^\/order-management/u

export default defineConfig(() => ({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	},
	server: {
		proxy: {
			'/order-management': {
				changeOrigin: true,
				rewrite: proxiedPath =>
					proxiedPath.replace(orderManagementProxyPrefix, ''),
				target: 'http://127.0.0.1:8002'
			},
			'/product-management': {
				changeOrigin: true,
				rewrite: proxiedPath =>
					proxiedPath.replace(productManagementProxyPrefix, ''),
				target: 'http://127.0.0.1:8001'
			}
		}
	},
	test: {
		bail: 1,
		clearMocks: true,
		coverage: {
			enabled: true,
			exclude: [
				'src/main.tsx',
				'src/pages/Admin.tsx',
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
		setupFiles: 'src/test-setup.ts'
	}
}))
