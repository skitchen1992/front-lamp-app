import {configureStore} from '@reduxjs/toolkit'
import {cartReducer} from '@/features/cart/cartSlice'
import {catalogReducer} from '@/features/catalog/catalogSlice'
import {authApi} from '@/shared/api/authApi'
import {orderManagementApi} from '@/shared/api/orderManagementApi'
import {productManagementApi} from '@/shared/api/productManagementApi'

const reducer = {
	catalog: catalogReducer,
	cart: cartReducer,
	[authApi.reducerPath]: authApi.reducer,
	[orderManagementApi.reducerPath]: orderManagementApi.reducer,
	[productManagementApi.reducerPath]: productManagementApi.reducer
}

export function createAppStore() {
	return configureStore({
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(
				authApi.middleware,
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
