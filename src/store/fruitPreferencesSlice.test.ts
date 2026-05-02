import {createAppStore} from '@/store'
import {
	clearFavoriteFruits,
	selectFavoriteFruitNames,
	selectIsFavoriteFruit,
	toggleFavoriteFruit
} from './fruitPreferencesSlice'

it('toggles and clears favorite fruit names', () => {
	const store = createAppStore()

	expect(selectFavoriteFruitNames(store.getState())).toEqual([])
	expect(selectIsFavoriteFruit(store.getState(), 'Apple')).toBe(false)

	store.dispatch(toggleFavoriteFruit('Apple'))

	expect(selectFavoriteFruitNames(store.getState())).toEqual(['Apple'])
	expect(selectIsFavoriteFruit(store.getState(), 'Apple')).toBe(true)

	store.dispatch(toggleFavoriteFruit('Apple'))

	expect(selectFavoriteFruitNames(store.getState())).toEqual([])

	store.dispatch(toggleFavoriteFruit('Banana'))
	store.dispatch(clearFavoriteFruits())

	expect(selectFavoriteFruitNames(store.getState())).toEqual([])
})
