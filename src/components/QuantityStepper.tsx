import {Minus, Plus} from 'lucide-react'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'

interface QuantityStepperProperties {
	className?: string
	onDecrement: () => void
	onIncrement: () => void
	quantity: number
}

export function QuantityStepper({
	className,
	onDecrement,
	onIncrement,
	quantity
}: QuantityStepperProperties) {
	return (
		<div
			className={cn(
				'inline-grid h-10 grid-cols-[2.25rem_2.5rem_2.25rem] items-center rounded-md border bg-muted',
				className
			)}
		>
			<Button
				aria-label='Уменьшить количество'
				className='size-9 rounded-r-none border-0 bg-transparent shadow-none'
				onClick={onDecrement}
				size='icon'
				variant='ghost'
			>
				<Minus aria-hidden={true} className='size-4' />
			</Button>
			<span className='text-center font-medium text-sm'>{quantity}</span>
			<Button
				aria-label='Увеличить количество'
				className='size-9 rounded-l-none border-0 bg-transparent shadow-none'
				onClick={onIncrement}
				size='icon'
				variant='ghost'
			>
				<Plus aria-hidden={true} className='size-4' />
			</Button>
		</div>
	)
}
