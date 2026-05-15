import type {LucideIcon} from 'lucide-react'
import type {ButtonHTMLAttributes, ReactNode} from 'react'
import {Link} from 'react-router'
import {cn} from '@/shared/lib/utils'
import type {StatusMeta} from '../_lib/data'

interface AdminPanelProperties {
	children: ReactNode
	className?: string
}

export function AdminPanel({children, className}: AdminPanelProperties) {
	return (
		<section
			className={cn('rounded-lg border bg-background shadow-xs', className)}
		>
			{children}
		</section>
	)
}

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

interface ActionIconButtonProperties
	extends ActionIconProperties,
		ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string
}

export function ActionIconButton({
	className,
	icon: Icon,
	label,
	...properties
}: ActionIconButtonProperties) {
	return (
		<button
			aria-label={label}
			className={cn(
				'inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50',
				className
			)}
			type='button'
			{...properties}
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
