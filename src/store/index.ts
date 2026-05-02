import {configureStore} from '@reduxjs/toolkit'
import {fruitsApi} from '@/api/fruits'
import {fruitPreferencesReducer} from './fruitPreferencesSlice'

const reducer = {
	fruitPreferences: fruitPreferencesReducer,
	[fruitsApi.reducerPath]: fruitsApi.reducer
}

export function createAppStore() {
	return configureStore({
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(fruitsApi.middleware),
		reducer
	})
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
