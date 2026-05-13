import type {LucideIcon} from 'lucide-react'
import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {cn} from '@/shared/lib/utils'
import type {StatusMeta} from './data'

export function StatusBadge({className, label}: StatusMeta) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-md px-2 py-1 font-semibold text-xs',
				className
			)}
		>
			{label}
		</span>
	)
}

interface ActionIconProperties {
	icon: LucideIcon
	label: string
}

interface ActionIconLinkProperties extends ActionIconProperties {
	to: string
}

export function ActionIconLink({
	icon: Icon,
	label,
	to
}: ActionIconLinkProperties) {
	return (
		<Link
			aria-label={label}
			className='inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600'
			to={to}
		>
			<Icon aria-hidden={true} className='size-4' />
		</Link>
	)
}

export function ActionIconButton({icon: Icon, label}: ActionIconProperties) {
	return (
		<button
			aria-label={label}
			className='inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600'
			type='button'
		>
			<Icon aria-hidden={true} className='size-4' />
		</button>
	)
}

interface FormFieldProperties {
	children: ReactNode
	className?: string
	label: string
}

export function FormField({children, className, label}: FormFieldProperties) {
	return (
		<div className={cn('grid gap-2 text-sm', className)}>
			<span className='font-medium'>{label}</span>
			{children}
		</div>
	)
}
