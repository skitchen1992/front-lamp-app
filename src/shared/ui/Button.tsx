import type {ButtonHTMLAttributes} from 'react'
import {cn} from '@/shared/lib/utils'

const variantClasses = {
	default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
	destructive:
		'border border-destructive text-destructive shadow-xs hover:bg-destructive/10',
	ghost: 'hover:bg-accent hover:text-accent-foreground',
	outline:
		'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
	secondary:
		'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80'
} as const

const sizeClasses = {
	default: 'h-10 px-4 py-2',
	icon: 'size-9',
	lg: 'h-12 px-6',
	sm: 'h-8 px-3'
} as const

interface ButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
	size?: keyof typeof sizeClasses
	variant?: keyof typeof variantClasses
}

export function Button({
	className,
	size = 'default',
	type = 'button',
	variant = 'default',
	...properties
}: ButtonProperties) {
	return (
		<button
			className={cn(
				'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
				variantClasses[variant],
				sizeClasses[size],
				className
			)}
			type={type}
			{...properties}
		/>
	)
}
