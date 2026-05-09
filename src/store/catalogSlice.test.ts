import {
	catalogReducer,
	selectCatalogCategory,
	selectCatalogDebouncedMaxPrice,
	selectCatalogDebouncedMinPrice,
	selectCatalogDebouncedQuery,
	selectCatalogMaxPriceInput,
	selectCatalogMinPriceInput,
	selectCatalogQuery,
	setCatalogCategory,
	setCatalogDebouncedMaxPrice,
	setCatalogDebouncedMinPrice,
	setCatalogDebouncedQuery,
	setCatalogMaxPriceInput,
	setCatalogMinPriceInput,
	setCatalogQuery
} from './catalogSlice'
import {createAppStore, type RootState} from './index'

function rootWithCatalog(patch: Partial<RootState['catalog']>): RootState {
	const base = createAppStore().getState()
	return {
		...base,
		catalog: {...base.catalog, ...patch}
	}
}

it('keeps defaults until actions update catalog filters', () => {
	expect(catalogReducer(undefined, {type: '@@UNKNOWN'})).toEqual({
		category: 'all',
		debouncedMaxPrice: undefined,
		debouncedMinPrice: undefined,
		debouncedQuery: '',
		maxPriceInput: '',
		minPriceInput: '',
		query: ''
	})
})

it('updates filter fields via reducers and selectors reflect state', () => {
	let state = catalogReducer(undefined, setCatalogCategory('industrial'))
	state = catalogReducer(state, setCatalogQuery(' лампа '))
	state = catalogReducer(state, setCatalogDebouncedQuery('лампа'))
	state = catalogReducer(state, setCatalogMinPriceInput('100'))
	state = catalogReducer(state, setCatalogMaxPriceInput('500'))
	state = catalogReducer(state, setCatalogDebouncedMinPrice(100))
	state = catalogReducer(state, setCatalogDebouncedMaxPrice(undefined))

	const root = rootWithCatalog(state)
	expect(selectCatalogCategory(root)).toBe('industrial')
	expect(selectCatalogQuery(root)).toBe(' лампа ')
	expect(selectCatalogDebouncedQuery(root)).toBe('лампа')
	expect(selectCatalogMinPriceInput(root)).toBe('100')
	expect(selectCatalogMaxPriceInput(root)).toBe('500')
	expect(selectCatalogDebouncedMinPrice(root)).toBe(100)
	expect(selectCatalogDebouncedMaxPrice(root)).toBeUndefined()
})
