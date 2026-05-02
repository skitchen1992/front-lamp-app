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
import type {RootState} from './index'

function stateWithCartItems(items: RootState['cart']['items']): RootState {
	return {
		cart: {items}
	}
}

it('updates cart items and keeps quantities above zero', () => {
	let state = cartReducer(
		undefined,
		addToCart({productId: 'led-e27-12w', quantity: 2})
	)
	expect(
		state.items.find(item => item.productId === 'led-e27-12w')?.quantity
	).toBe(12)

	state = cartReducer(state, addToCart({productId: 'lum-t8-18w', quantity: 3}))
	expect(state.items).toContainEqual({productId: 'lum-t8-18w', quantity: 3})

	state = cartReducer(state, decrementCartItem('lum-t8-18w'))
	expect(
		state.items.find(item => item.productId === 'lum-t8-18w')?.quantity
	).toBe(2)

	state = cartReducer(
		state,
		setCartItemQuantity({productId: 'lum-t8-18w', quantity: 0})
	)
	expect(
		state.items.find(item => item.productId === 'lum-t8-18w')?.quantity
	).toBe(1)

	state = cartReducer(state, incrementCartItem('lum-t8-18w'))
	expect(
		state.items.find(item => item.productId === 'lum-t8-18w')?.quantity
	).toBe(2)

	state = cartReducer(state, removeCartItem('hal-g9-40w'))
	expect(state.items.some(item => item.productId === 'hal-g9-40w')).toBe(false)

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

	expect(selectCartLineCount(stateWithCartItems(state.items))).toBe(3)
})

it('selects quantities, totals, and product-backed view items', () => {
	const state = stateWithCartItems([
		{productId: 'led-e27-12w', quantity: 2},
		{productId: 'missing-product', quantity: 9}
	])

	expect(selectCartItems(state)).toHaveLength(2)
	expect(selectCartQuantity(state)).toBe(11)
	expect(selectCartSubtotal(state)).toBe(178)
	expect(selectCartViewItems(state)).toHaveLength(1)
})
