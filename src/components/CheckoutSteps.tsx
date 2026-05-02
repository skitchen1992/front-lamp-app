import {cn} from '@/lib/utils'

export type CheckoutStep = 'cart' | 'details' | 'confirmation'

const checkoutSteps: {id: CheckoutStep; label: string; number: number}[] = [
	{id: 'cart', label: 'Корзина', number: 1},
	{id: 'details', label: 'Данные', number: 2},
	{id: 'confirmation', label: 'Подтверждение', number: 3}
]

interface CheckoutStepsProperties {
	currentStep: CheckoutStep
}

export function CheckoutSteps({currentStep}: CheckoutStepsProperties) {
	const currentIndex = checkoutSteps.findIndex(step => step.id === currentStep)

	return (
		<ol className='flex w-full max-w-md items-center justify-between gap-4'>
			{checkoutSteps.map((step, index) => {
				const isActive = index <= currentIndex

				return (
					<li className='flex items-center gap-2' key={step.id}>
						<span
							className={cn(
								'inline-flex size-7 items-center justify-center rounded-full border font-medium text-sm',
								isActive
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-border bg-muted text-muted-foreground'
							)}
						>
							{step.number}
						</span>
						<span
							className={cn(
								'hidden font-medium text-sm sm:inline',
								isActive ? 'text-primary' : 'text-muted-foreground'
							)}
						>
							{step.label}
						</span>
					</li>
				)
			})}
		</ol>
	)
}
