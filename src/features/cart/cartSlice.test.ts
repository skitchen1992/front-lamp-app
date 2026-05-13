import {createAppStore, type RootState} from '@/app/store'
import {
	halogenFixtureProduct,
	ledFixtureProduct,
	luminescentFixtureProduct
} from '@/test/productManagementFixtures'
import {
	addToCart,
	cartReducer,
	clearCart,
	decrementCartItem,
	incrementCartItem,
	removeCartItem,
	selectCartItems,
	selectCartLineCount,
	selectCartQuantity,
	selectCartSubtotal,
	selectCartViewItems,
	setCartItemQuantity
} from './cartSlice'

function stateWithCartItems(items: RootState['cart']['items']): RootState {
	return {
		...createAppStore().getState(),
		cart: {items}
	}
}

it('adds cart items and refreshes product snapshots', () => {
	let state = cartReducer(
		undefined,
		addToCart({product: ledFixtureProduct, quantity: 10})
	)
	state = cartReducer(
		state,
		addToCart({product: ledFixtureProduct, quantity: 2})
	)
	expect(
		state.items.find(item => item.productId === ledFixtureProduct.id)?.quantity
	).toBe(12)

	state = cartReducer(
		state,
		addToCart({product: luminescentFixtureProduct, quantity: 3})
	)
	expect(state.items).toContainEqual({
		product: luminescentFixtureProduct,
		productId: luminescentFixtureProduct.id,
		quantity: 3
	})
})

it('updates cart quantities, removes lines, and clears the cart', () => {
	let state = cartReducer(
		undefined,
		addToCart({product: luminescentFixtureProduct, quantity: 3})
	)
	state = cartReducer(state, decrementCartItem(luminescentFixtureProduct.id))
	expect(
		state.items.find(item => item.productId === luminescentFixtureProduct.id)
			?.quantity
	).toBe(2)

	state = cartReducer(
		state,
		setCartItemQuantity({productId: luminescentFixtureProduct.id, quantity: 0})
	)
	expect(
		state.items.find(item => item.productId === luminescentFixtureProduct.id)
			?.quantity
	).toBe(1)

	state = cartReducer(state, incrementCartItem(luminescentFixtureProduct.id))
	expect(
		state.items.find(item => item.productId === luminescentFixtureProduct.id)
			?.quantity
	).toBe(2)

	state = cartReducer(
		state,
		addToCart({product: halogenFixtureProduct, quantity: 5})
	)
	state = cartReducer(state, removeCartItem(halogenFixtureProduct.id))
	expect(
		state.items.some(item => item.productId === halogenFixtureProduct.id)
	).toBe(false)

	state = cartReducer(state, clearCart())
	expect(state.items).toEqual([])
})

it('ignores updates for unknown cart lines', () => {
	let state = cartReducer(undefined, decrementCartItem('missing-product'))
	state = cartReducer(state, incrementCartItem('missing-product'))
	state = cartReducer(
		state,
		setCartItemQuantity({productId: 'missing-product', quantity: 5})
	)

	expect(selectCartLineCount(stateWithCartItems(state.items))).toBe(0)
})

it('selects quantities, totals, and product-backed view items', () => {
	const state = stateWithCartItems([
		{
			product: ledFixtureProduct,
			productId: ledFixtureProduct.id,
			quantity: 2
		}
	])

	expect(selectCartItems(state)).toHaveLength(1)
	expect(selectCartQuantity(state)).toBe(2)
	expect(selectCartSubtotal(state)).toBe(178)
	expect(selectCartViewItems(state)).toHaveLength(1)
})
