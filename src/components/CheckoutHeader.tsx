import {BrandLogo} from './BrandLogo'
import {type CheckoutStep, CheckoutSteps} from './CheckoutSteps'

interface CheckoutHeaderProperties {
	currentStep: CheckoutStep
}

export function CheckoutHeader({currentStep}: CheckoutHeaderProperties) {
	return (
		<header className='border-b bg-background'>
			<div className='mx-auto flex min-h-28 max-w-7xl flex-col items-center justify-center gap-5 px-4 py-5 sm:px-6 lg:px-8'>
				<BrandLogo />
				<CheckoutSteps currentStep={currentStep} />
			</div>
		</header>
	)
}
