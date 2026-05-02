import {createSelector} from '@reduxjs/toolkit'
import {
	selectCartLineCount,
	selectCartSubtotal,
	selectCartViewItems
} from '@/store/cartSlice'

export const selectCartPageData = createSelector(
	[selectCartViewItems, selectCartLineCount],
	(items, lineCount) => ({items, lineCount})
)

export const selectOrderConfirmationPageData = createSelector(
	[selectCartViewItems, selectCartSubtotal],
	(items, subtotal) => ({items, subtotal})
)
