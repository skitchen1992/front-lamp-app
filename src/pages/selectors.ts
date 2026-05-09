import {createSelector} from '@reduxjs/toolkit'
import {selectCartLineCount, selectCartViewItems} from '@/store/cartSlice'

export const selectCartPageData = createSelector(
	[selectCartViewItems, selectCartLineCount],
	(items, lineCount) => ({items, lineCount})
)
