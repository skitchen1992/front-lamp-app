/// <reference types="vite/client" />

import type DetachedWindowApi from 'happy-dom/lib/window/DetachedWindowAPI.js'

declare global {
	interface ImportMetaEnv {
		readonly VITE_ORDER_MANAGEMENT_API_URL?: string
		readonly VITE_PRODUCT_MANAGEMENT_API_URL?: string
	}

	var happyDOM: DetachedWindowApi | undefined
}
