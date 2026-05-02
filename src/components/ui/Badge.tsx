import type {HTMLAttributes} from 'react'
import {cn} from '@/lib/utils'

const badgeClasses = {
	default: 'bg-primary text-primary-foreground',
	success: 'bg-emerald-500 text-white',
	warning: 'bg-amber-500 text-white'
} as const

interface BadgeProperties extends HTMLAttributes<HTMLSpanElement> {
	variant?: keyof typeof badgeClasses
}

export function Badge({
	className,
	variant = 'default',
	...properties
}: BadgeProperties) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-md px-2 py-1 font-medium text-xs',
				badgeClasses[variant],
				className
			)}
			{...properties}
		/>
	)
}
