import {createSelector, createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '@/app/store'

interface CatalogFiltersState {
	category: string
	debouncedMaxPrice: number | undefined
	debouncedMinPrice: number | undefined
	debouncedQuery: string
	maxPriceInput: string
	minPriceInput: string
	query: string
}

const initialState: CatalogFiltersState = {
	category: 'all',
	debouncedMaxPrice: undefined,
	debouncedMinPrice: undefined,
	debouncedQuery: '',
	maxPriceInput: '',
	minPriceInput: '',
	query: ''
}

const catalogSlice = createSlice({
	initialState,
	name: 'catalog',
	reducers: {
		setCatalogCategory(state, action: PayloadAction<string>) {
			state.category = action.payload
		},
		setCatalogDebouncedMaxPrice(
			state,
			action: PayloadAction<number | undefined>
		) {
			state.debouncedMaxPrice = action.payload
		},
		setCatalogDebouncedMinPrice(
			state,
			action: PayloadAction<number | undefined>
		) {
			state.debouncedMinPrice = action.payload
		},
		setCatalogDebouncedQuery(state, action: PayloadAction<string>) {
			state.debouncedQuery = action.payload
		},
		setCatalogMaxPriceInput(state, action: PayloadAction<string>) {
			state.maxPriceInput = action.payload
		},
		setCatalogMinPriceInput(state, action: PayloadAction<string>) {
			state.minPriceInput = action.payload
		},
		setCatalogQuery(state, action: PayloadAction<string>) {
			state.query = action.payload
		}
	}
})

export const {
	setCatalogCategory,
	setCatalogDebouncedMaxPrice,
	setCatalogDebouncedMinPrice,
	setCatalogDebouncedQuery,
	setCatalogMaxPriceInput,
	setCatalogMinPriceInput,
	setCatalogQuery
} = catalogSlice.actions

export const catalogReducer = catalogSlice.reducer

export function selectCatalogCategory(state: RootState) {
	return state.catalog.category
}

export function selectCatalogDebouncedMaxPrice(state: RootState) {
	return state.catalog.debouncedMaxPrice
}

export function selectCatalogDebouncedMinPrice(state: RootState) {
	return state.catalog.debouncedMinPrice
}

export function selectCatalogDebouncedQuery(state: RootState) {
	return state.catalog.debouncedQuery
}

export function selectCatalogMaxPriceInput(state: RootState) {
	return state.catalog.maxPriceInput
}

export function selectCatalogMinPriceInput(state: RootState) {
	return state.catalog.minPriceInput
}

export function selectCatalogQuery(state: RootState) {
	return state.catalog.query
}

export const selectCatalogFilters = createSelector(
	[(state: RootState) => state.catalog],
	catalog => ({
		category: catalog.category,
		debouncedMaxPrice: catalog.debouncedMaxPrice,
		debouncedMinPrice: catalog.debouncedMinPrice,
		debouncedQuery: catalog.debouncedQuery,
		maxPriceInput: catalog.maxPriceInput,
		minPriceInput: catalog.minPriceInput,
		query: catalog.query
	})
)
