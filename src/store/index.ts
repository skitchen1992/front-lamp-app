import {configureStore} from '@reduxjs/toolkit'
import {orderManagementApi} from '@/services/orderManagementApi'
import {productManagementApi} from '@/services/productManagementApi'
import {cartReducer} from './cartSlice'

const reducer = {
	cart: cartReducer,
	[orderManagementApi.reducerPath]: orderManagementApi.reducer,
	[productManagementApi.reducerPath]: productManagementApi.reducer
}

export function createAppStore() {
	return configureStore({
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(
				productManagementApi.middleware,
				orderManagementApi.middleware
			),
		reducer
	})
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
