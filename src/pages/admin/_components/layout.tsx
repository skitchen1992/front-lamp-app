import {
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Package,
	ShoppingBag,
	Zap
} from 'lucide-react'
import {type ReactNode, useCallback} from 'react'
import {Link, NavLink, Outlet, useNavigate} from 'react-router'
import {useAppDispatch} from '@/app/store/hooks'
import {Head} from '@/components/Head'
import {
	authApi,
	clearStoredAdminAuth,
	getStoredAdminAccessToken,
	getStoredAdminAuth,
	useLogoutAdminMutation
} from '@/shared/api/authApi'
import {orderManagementApi} from '@/shared/api/orderManagementApi'
import {productManagementApi} from '@/shared/api/productManagementApi'
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

const whitespacePattern = /\s+/u

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
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [logoutAdmin] = useLogoutAdminMutation()

	const handleLogout = useCallback(async () => {
		const {refreshToken} = getStoredAdminAuth() ?? {}
		const accessToken = getStoredAdminAccessToken()

		try {
			if (
				accessToken &&
				typeof refreshToken === 'string' &&
				refreshToken.trim()
			) {
				await logoutAdmin({accessToken, refreshToken}).unwrap()
			}
		} catch {
			// Local logout must still succeed when auth-service is unavailable.
		} finally {
			clearStoredAdminAuth()
			dispatch(authApi.util.resetApiState())
			dispatch(productManagementApi.util.resetApiState())
			dispatch(orderManagementApi.util.resetApiState())
			navigate('/admin/login', {replace: true})
		}
	}, [dispatch, logoutAdmin, navigate])

	return (
		<aside className='flex flex-col border-slate-800 border-r bg-[#17191d] text-white lg:min-h-screen'>
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
			<div className='mt-auto border-slate-800 border-t p-3'>
				<button
					aria-label='Выйти из админки'
					className='flex h-11 w-full items-center gap-3 rounded-md px-3 font-medium text-slate-400 text-sm transition hover:bg-white/5 hover:text-white'
					onClick={handleLogout}
					type='button'
				>
					<LogOut aria-hidden={true} className='size-4' />
					Выйти
				</button>
			</div>
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
	beforeTitle?: ReactNode
	children: ReactNode
	className?: string
	title: string
}

export function AdminContentShell({
	actions,
	beforeTitle,
	children,
	className,
	title
}: AdminContentShellProperties) {
	return (
		<section className={cn('px-4 py-7 sm:px-6 lg:px-9', className)}>
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					{beforeTitle}
					<h1 className='font-bold text-3xl tracking-normal'>{title}</h1>
				</div>
				{actions}
			</div>
			{children}
		</section>
	)
}

const adminSplitShellColumns = {
	default: 'xl:grid-cols-[minmax(0,1fr)_34rem]',
	wide: 'xl:grid-cols-[minmax(0,1fr)_40rem]'
} as const

interface AdminSplitShellProperties {
	actions?: ReactNode
	children: ReactNode
	details: ReactNode
	detailsSize?: keyof typeof adminSplitShellColumns
	title: string
}

export function AdminSplitShell({
	actions,
	children,
	details,
	detailsSize = 'default',
	title
}: AdminSplitShellProperties) {
	return (
		<section
			className={cn(
				'grid min-h-screen bg-slate-100',
				adminSplitShellColumns[detailsSize]
			)}
		>
			<AdminContentShell actions={actions} className='lg:px-7' title={title}>
				{children}
			</AdminContentShell>
			<aside className='border-slate-200 border-l bg-background px-4 py-7 sm:px-6 lg:px-8'>
				{details}
			</aside>
		</section>
	)
}

export function AdminUserBadge() {
	const adminName = getAdminDisplayName()
	const initials = getAdminInitials(adminName)

	return (
		<div className='flex items-center gap-3 text-slate-500'>
			<span className='hidden font-medium text-sm sm:inline'>{adminName}</span>
			<div className='flex size-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white'>
				{initials}
			</div>
		</div>
	)
}

function getAdminDisplayName() {
	const storedAuth = getStoredAdminAuth()
	const fullName = storedAuth?.user?.fullName?.trim()
	const email = storedAuth?.user?.email?.trim()

	return fullName || email || 'Администратор'
}

function getAdminInitials(name: string) {
	const [firstPart, secondPart] = name
		.split(whitespacePattern)
		.filter(Boolean)
		.map(part => part[0]?.toLocaleUpperCase('ru-RU') ?? '')

	return `${firstPart ?? 'А'}${secondPart ?? ''}`
}
