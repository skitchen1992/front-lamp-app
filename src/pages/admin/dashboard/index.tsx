import {
	Boxes,
	ListChecks,
	type LucideIcon,
	Mail,
	MessageSquare,
	PackagePlus,
	TrendingUp
} from 'lucide-react'
import {Link} from 'react-router'
import {formatPrice} from '@/shared/lib/format'
import {cn} from '@/shared/lib/utils'
import {AdminContentShell, AdminUserBadge} from '../_components/layout'
import {AdminPanel, StatusBadge} from '../_components/shared'
import {adminOrders, orderStatusMeta} from '../_lib/data'

interface DashboardCardProperties {
	icon: LucideIcon
	iconClassName: string
	label: string
	note: string
	value: string
}

function DashboardCard({
	icon: Icon,
	iconClassName,
	label,
	note,
	value
}: DashboardCardProperties) {
	return (
		<article className='rounded-lg border bg-background p-5 shadow-xs'>
			<div className='flex items-start justify-between gap-4'>
				<p className='font-medium text-slate-500 text-sm'>{label}</p>
				<div
					className={cn(
						'flex size-10 items-center justify-center rounded-lg',
						iconClassName
					)}
				>
					<Icon aria-hidden={true} className='size-5' />
				</div>
			</div>
			<p className='mt-5 font-bold text-4xl tracking-normal'>{value}</p>
			<p className='mt-3 text-slate-500 text-sm italic'>{note}</p>
		</article>
	)
}

export function AdminDashboard() {
	const recentOrders = adminOrders.slice(0, 4)

	return (
		<AdminContentShell actions={<AdminUserBadge />} title='Дашборд'>
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				<DashboardCard
					icon={Boxes}
					iconClassName='bg-blue-50 text-blue-600'
					label='Товаров в каталоге'
					note='18 активных · 2 в архиве'
					value='20'
				/>
				<DashboardCard
					icon={ListChecks}
					iconClassName='bg-amber-50 text-amber-600'
					label='Новых заказов'
					note='Требуют обработки'
					value='7'
				/>
				<DashboardCard
					icon={Mail}
					iconClassName='bg-red-50 text-red-500'
					label='Необработанных обращений'
					note='Новые обращения'
					value='3'
				/>
				<DashboardCard
					icon={TrendingUp}
					iconClassName='bg-emerald-50 text-emerald-600'
					label='Заказов за месяц'
					note='↑ 18% к прошлому'
					value='42'
				/>
			</div>

			<div className='mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]'>
				<AdminPanel className='overflow-hidden'>
					<div className='flex items-center justify-between border-b px-5 py-4'>
						<h2 className='font-semibold text-lg'>Последние заказы</h2>
						<Link
							className='inline-flex h-8 items-center justify-center rounded-md bg-blue-50 px-3 font-medium text-blue-600 text-sm transition hover:bg-blue-100'
							to='/admin/orders'
						>
							Все заказы
						</Link>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[36rem] text-sm'>
							<thead className='bg-slate-50 text-slate-500'>
								<tr>
									<th className='px-5 py-3 text-left font-semibold'>Номер</th>
									<th className='px-5 py-3 text-left font-semibold'>Дата</th>
									<th className='px-5 py-3 text-left font-semibold'>Клиент</th>
									<th className='px-5 py-3 text-left font-semibold'>Статус</th>
									<th className='px-5 py-3 text-right font-semibold'>Сумма</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map(order => (
									<tr className='border-t' key={order.id}>
										<td className='whitespace-nowrap px-5 py-4'>
											<Link
												className='font-semibold text-blue-600 hover:underline'
												to='/admin/orders'
											>
												#{order.orderNumber}
											</Link>
										</td>
										<td className='whitespace-nowrap px-5 py-4 text-slate-500 italic'>
											{order.createdAt.split(',')[0]}
										</td>
										<td className='px-5 py-4 font-medium'>
											{order.customerName}
										</td>
										<td className='px-5 py-4'>
											<StatusBadge {...orderStatusMeta[order.status]} />
										</td>
										<td className='whitespace-nowrap px-5 py-4 text-right font-bold'>
											{formatPrice(order.totalAmount)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</AdminPanel>

				<AdminPanel className='h-max p-5'>
					<h2 className='font-semibold text-lg'>Быстрые действия</h2>
					<div className='mt-4 space-y-3'>
						<QuickActionLink
							icon={PackagePlus}
							label='Добавить товар'
							to='/admin/products/new'
							variant='primary'
						/>
						<QuickActionLink
							icon={ListChecks}
							label='Все заказы'
							to='/admin/orders'
						/>
						<QuickActionLink
							icon={MessageSquare}
							label='Обращения (3 новых)'
							to='/admin/inquiries'
						/>
					</div>
				</AdminPanel>
			</div>
		</AdminContentShell>
	)
}

interface QuickActionLinkProperties {
	icon: LucideIcon
	label: string
	to: string
	variant?: 'default' | 'primary'
}

function QuickActionLink({
	icon: Icon,
	label,
	to,
	variant = 'default'
}: QuickActionLinkProperties) {
	return (
		<Link
			className={cn(
				'flex h-12 items-center gap-3 rounded-md px-4 font-medium transition',
				variant === 'primary'
					? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
			)}
			to={to}
		>
			<Icon aria-hidden={true} className='size-4' />
			{label}
		</Link>
	)
}
