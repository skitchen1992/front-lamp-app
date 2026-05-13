import {formatCartLineCount, formatPrice, parsePriceFilter} from './format'

it('formats prices with russian thousands separators', () => {
	expect(formatPrice(3615)).toBe('3 615 ₽')
})

it('formats cart line count labels', () => {
	expect(formatCartLineCount(1)).toBe('1 товар')
	expect(formatCartLineCount(3)).toBe('3 товара')
	expect(formatCartLineCount(7)).toBe('7 товаров')
})

it('parses catalog price filter input', () => {
	expect(parsePriceFilter('')).toBeUndefined()
	expect(parsePriceFilter('   ')).toBeUndefined()
	expect(parsePriceFilter('100')).toBe(100)
	expect(parsePriceFilter('100,50')).toBe(100.5)
	expect(parsePriceFilter('abc')).toBeUndefined()
	expect(parsePriceFilter('-3')).toBeUndefined()
})
