import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '@/store'

interface FruitPreferencesState {
	favoriteFruitNames: string[]
}

const initialState: FruitPreferencesState = {
	favoriteFruitNames: []
}

const fruitPreferencesSlice = createSlice({
	name: 'fruitPreferences',
	initialState,
	reducers: {
		clearFavoriteFruits(state) {
			state.favoriteFruitNames = []
		},
		toggleFavoriteFruit(state, action: PayloadAction<string>) {
			const fruitName = action.payload
			const favoriteIndex = state.favoriteFruitNames.indexOf(fruitName)

			if (favoriteIndex >= 0) {
				state.favoriteFruitNames.splice(favoriteIndex, 1)
				return
			}

			state.favoriteFruitNames.push(fruitName)
		}
	}
})

export const {clearFavoriteFruits, toggleFavoriteFruit} =
	fruitPreferencesSlice.actions

export const fruitPreferencesReducer = fruitPreferencesSlice.reducer

export function selectFavoriteFruitNames(state: RootState) {
	return state.fruitPreferences.favoriteFruitNames
}

export function selectIsFavoriteFruit(state: RootState, fruitName: string) {
	return selectFavoriteFruitNames(state).includes(fruitName)
}
