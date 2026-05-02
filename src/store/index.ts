import {configureStore} from '@reduxjs/toolkit'
import {cartReducer} from './cartSlice'

const reducer = {
	cart: cartReducer
}

export function createAppStore() {
	return configureStore({
		reducer
	})
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
