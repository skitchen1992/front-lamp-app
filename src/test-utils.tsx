import {type RenderOptions, render as rtlRender} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {PropsWithChildren, ReactElement} from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router'
import {type AppStore, createAppStore} from '@/store'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	route?: string
	store?: AppStore
}

export function render(
	ui: ReactElement,
	{route = '/', store = createAppStore(), ...options}: ExtendedRenderOptions = {
		reactStrictMode: true
	}
) {
	globalThis.history.pushState({}, '', route)

	return {
		store,
		user: userEvent.setup(),
		...rtlRender(ui, {
			wrapper: ({children}: PropsWithChildren) => (
				<Provider store={store}>
					<BrowserRouter>{children}</BrowserRouter>
				</Provider>
			),
			...options
		})
	}
}

// biome-ignore lint: test file
export * from '@testing-library/react'
