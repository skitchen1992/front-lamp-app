import {
	LayoutDashboard,
	MessageSquare,
	Package,
	ShoppingBag,
	Zap
} from 'lucide-react'
import type {ReactNode} from 'react'
import {Link, NavLink, Outlet} from 'react-router'
import {Head} from '@/components/Head'
import {cn} from '@/shared/lib/utils'

const adminNavigationItems = [
	{
		icon: LayoutDashboard,
		label: 'Дашборд',
		to: '/admin/dashboard'
	},
	{
		icon: Package,
		label: 'Товары',
		to: '/admin/products'
	},
	{
		icon: ShoppingBag,
		label: 'Заказы',
		to: '/admin/orders'
	},
	{
		icon: MessageSquare,
		label: 'Обращения',
		to: '/admin/inquiries'
	}
]

function getAdminNavLinkClass({isActive}: {isActive: boolean}) {
	return cn(
		'flex shrink-0 items-center gap-3 rounded-md px-3 py-3 font-medium text-sm transition',
		isActive
			? 'bg-blue-600 text-white'
			: 'text-slate-400 hover:bg-white/5 hover:text-white'
	)
}

export function AdminLogo({compact = false}: {compact?: boolean}) {
	return (
		<Link
			className={cn(
				'inline-flex items-center gap-2 font-bold tracking-normal',
				compact ? 'text-xl' : 'text-lg'
			)}
			to='/admin/dashboard'
		>
			<Zap aria-hidden={true} className='size-5 text-blue-500' />
			<span>ЛампоЗавод</span>
			<span className='text-[10px] text-slate-400 uppercase tracking-widest'>
				Admin
			</span>
		</Link>
	)
}

function AdminSidebar() {
	return (
		<aside className='border-slate-800 border-r bg-[#17191d] text-white lg:min-h-screen'>
			<div className='flex h-14 items-center border-slate-700 border-b px-5'>
				<AdminLogo />
			</div>
			<nav className='px-3 py-5'>
				<p className='mb-3 px-2 font-semibold text-[11px] text-slate-500 uppercase tracking-[0.22em]'>
					Навигация
				</p>
				<div className='flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible'>
					{adminNavigationItems.map(item => (
						<NavLink
							className={getAdminNavLinkClass}
							key={item.to}
							to={item.to}
						>
							<item.icon aria-hidden={true} className='size-4' />
							{item.label}
						</NavLink>
					))}
				</div>
			</nav>
		</aside>
	)
}

export function AdminLayout() {
	return (
		<div className='min-h-screen bg-slate-100 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]'>
			<Head title='ЛампоЗавод - админка' />
			<AdminSidebar />
			<main className='min-w-0'>
				<Outlet />
			</main>
		</div>
	)
}

interface AdminContentShellProperties {
	actions?: ReactNode
	children: ReactNode
	title: string
}

export function AdminContentShell({
	actions,
	children,
	title
}: AdminContentShellProperties) {
	return (
		<section className='px-4 py-7 sm:px-6 lg:px-9'>
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<h1 className='font-bold text-3xl tracking-normal'>{title}</h1>
				{actions}
			</div>
			{children}
		</section>
	)
}

export function AdminUserBadge() {
	return (
		<div className='flex items-center gap-3 text-slate-500'>
			<span className='hidden font-medium text-sm sm:inline'>
				Администратор
			</span>
			<div className='flex size-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white'>
				А
			</div>
		</div>
	)
}
