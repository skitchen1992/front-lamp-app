import {Zap} from 'lucide-react'
import {Link} from 'react-router'

export function BrandLogo() {
	return (
		<Link
			className='inline-flex items-center gap-2 font-bold text-2xl tracking-normal'
			to='/catalog'
		>
			<Zap aria-hidden={true} className='size-6 text-primary' />
			<span>ЛампоЗавод</span>
		</Link>
	)
}
