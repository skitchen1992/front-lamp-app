import {formatCartLineCount, formatPrice} from './format'

it('formats prices with russian thousands separators', () => {
	expect(formatPrice(3615)).toBe('3 615 ₽')
})

it('formats cart line count labels', () => {
	expect(formatCartLineCount(1)).toBe('1 товар')
	expect(formatCartLineCount(3)).toBe('3 товара')
	expect(formatCartLineCount(7)).toBe('7 товаров')
})
