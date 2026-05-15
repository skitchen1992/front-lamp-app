import {cn} from './utils'

it('merges class names and resolves tailwind conflicts', () => {
	expect(cn('px-2', false, 'px-4')).toBe('px-4')
})
