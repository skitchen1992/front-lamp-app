import {createSelector, createSlice, type PayloadAction} from '@reduxjs/toolkit'
import {findProductById} from '@/data/products'
import type {RootState} from '@/store'

interface CartItem {
	productId: string
	quantity: number
}

interface CartState {
	items: CartItem[]
}

const initialState: CartState = {
	items: [
		{productId: 'led-e27-12w', quantity: 10},
		{productId: 'hal-g9-40w', quantity: 5},
		{productId: 'ind-led-50w', quantity: 2}
	]
}

const MIN_QUANTITY = 1

const cartSlice = createSlice({
	initialState,
	name: 'cart',
	reducers: {
		addToCart(
			state,
			action: PayloadAction<{productId: string; quantity: number}>
		) {
			const item = state.items.find(
				cartItem => cartItem.productId === action.payload.productId
			)

			if (item) {
				item.quantity += action.payload.quantity
				return
			}

			state.items.push(action.payload)
		},
		clearCart(state) {
			state.items = []
		},
		decrementCartItem(state, action: PayloadAction<string>) {
			const item = state.items.find(
				cartItem => cartItem.productId === action.payload
			)

			if (!item) {
				return
			}

			item.quantity = Math.max(MIN_QUANTITY, item.quantity - 1)
		},
		incrementCartItem(state, action: PayloadAction<string>) {
			const item = state.items.find(
				cartItem => cartItem.productId === action.payload
			)

			if (item) {
				item.quantity += 1
			}
		},
		removeCartItem(state, action: PayloadAction<string>) {
			state.items = state.items.filter(
				item => item.productId !== action.payload
			)
		},
		setCartItemQuantity(
			state,
			action: PayloadAction<{productId: string; quantity: number}>
		) {
			const item = state.items.find(
				cartItem => cartItem.productId === action.payload.productId
			)

			if (item) {
				item.quantity = Math.max(MIN_QUANTITY, action.payload.quantity)
			}
		}
	}
})

export const {
	addToCart,
	clearCart,
	decrementCartItem,
	incrementCartItem,
	removeCartItem,
	setCartItemQuantity
} = cartSlice.actions

export const cartReducer = cartSlice.reducer

export function selectCartItems(state: RootState) {
	return state.cart.items
}

export function selectCartLineCount(state: RootState) {
	return selectCartItems(state).length
}

export function selectCartQuantity(state: RootState) {
	return selectCartItems(state).reduce(
		(total, item) => total + item.quantity,
		0
	)
}

export function selectCartSubtotal(state: RootState) {
	return selectCartItems(state).reduce((total, item) => {
		const product = findProductById(item.productId)
		return total + (product?.price ?? 0) * item.quantity
	}, 0)
}

export const selectCartViewItems = createSelector([selectCartItems], items =>
	items.flatMap(item => {
		const product = findProductById(item.productId)
		return product ? [{...item, product}] : []
	})
)
