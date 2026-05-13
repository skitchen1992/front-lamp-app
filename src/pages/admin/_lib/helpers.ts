import type {FormEvent} from 'react'

export const formControlClass =
	'min-h-11 rounded-md border border-input bg-background px-4 py-2 text-sm outline-none transition focus-visible:border-blue-600 focus-visible:ring-[3px] focus-visible:ring-blue-600/20'

export function preventFormSubmit(event: FormEvent<HTMLFormElement>) {
	event.preventDefault()
}

export function getStockTextClass(stockQty: number) {
	if (stockQty > 20) {
		return 'text-emerald-600'
	}

	if (stockQty > 0) {
		return 'text-amber-600'
	}

	return 'text-slate-400'
}
