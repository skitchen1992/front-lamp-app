import {createSelector, createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '@/app/store'
import type {Product} from '@/entities/product/products'

interface CartItem {
	product: Product
	productId: string
	quantity: number
}

interface CartState {
	items: CartItem[]
}

const initialState: CartState = {
	items: []
}

const MIN_QUANTITY = 1

const cartSlice = createSlice({
	initialState,
	name: 'cart',
	reducers: {
		addToCart(
			state,
			action: PayloadAction<{product: Product; quantity: number}>
		) {
			const productId = action.payload.product.id
			const item = state.items.find(
				cartItem => cartItem.productId === productId
			)

			if (item) {
				item.quantity += action.payload.quantity
				item.product = action.payload.product
				return
			}

			state.items.push({
				product: action.payload.product,
				productId,
				quantity: action.payload.quantity
			})
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
	return selectCartItems(state).reduce(
		(total, item) => total + item.product.price * item.quantity,
		0
	)
}

export const selectCartViewItems = createSelector([selectCartItems], items =>
	items.map(item => ({...item, product: item.product}))
)

export const selectCartPageData = createSelector(
	[selectCartViewItems, selectCartLineCount],
	(items, lineCount) => ({items, lineCount})
)
