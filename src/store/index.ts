import {configureStore} from '@reduxjs/toolkit'
import {fruitPreferencesReducer} from './fruitPreferencesSlice'

const reducer = {
	fruitPreferences: fruitPreferencesReducer
}

export function createAppStore() {
	return configureStore({reducer})
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
