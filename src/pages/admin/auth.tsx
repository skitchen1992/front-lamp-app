import {
	BadgeCheck,
	type LucideIcon,
	MessageSquare,
	Package,
	Truck,
	UserPlus
} from 'lucide-react'
import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {Head} from '@/components/Head'
import {cn} from '@/shared/lib/utils'
import {Input} from '@/shared/ui/input'
import {preventFormSubmit} from './helpers'
import {AdminLogo} from './layout'
import {FormField} from './shared'

interface AdminAuthProperties {
	mode: 'login' | 'register'
}

function AdminAuth({mode}: AdminAuthProperties) {
	const isRegister = mode === 'register'
	const title = isRegister ? 'Регистрация администратора' : 'Вход в админку'
	const description = isRegister
		? 'Создайте учетную запись для управления каталогом и заказами.'
		: 'Авторизуйтесь, чтобы перейти к управлению магазином.'

	return (
		<>
			<Head title={`${title} - ЛампоЗавод`} />
			<main className='min-h-screen bg-slate-100 px-4 py-8'>
				<div className='mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border bg-background shadow-sm lg:grid-cols-[minmax(0,1fr)_27rem]'>
					<section className='flex flex-col justify-between bg-[#17191d] p-8 text-white'>
						<AdminLogo compact={true} />
						<div className='max-w-xl py-16'>
							<p className='font-semibold text-blue-400 text-sm uppercase tracking-[0.22em]'>
								Панель управления
							</p>
							<h1 className='mt-5 font-bold text-4xl tracking-normal'>
								Каталог, заказы и обращения в одном рабочем пространстве
							</h1>
							<p className='mt-5 text-slate-300'>
								Пока это только верстка: формы и статусы подготовлены под
								подключение к бэкенду на следующем шаге.
							</p>
						</div>
						<div className='grid gap-3 text-slate-300 text-sm sm:grid-cols-3'>
							<AuthFeature icon={Package} label='Товары' />
							<AuthFeature icon={Truck} label='Заказы' />
							<AuthFeature icon={MessageSquare} label='Обращения' />
						</div>
					</section>

					<section className='flex items-center px-6 py-10 sm:px-10'>
						<form className='w-full' onSubmit={preventFormSubmit}>
							<div className='mb-8'>
								<div className='mb-5 inline-flex rounded-md border bg-slate-50 p-1'>
									<AuthModeLink active={!isRegister} to='/admin/login'>
										Вход
									</AuthModeLink>
									<AuthModeLink active={isRegister} to='/admin/register'>
										Регистрация
									</AuthModeLink>
								</div>
								<h2 className='font-bold text-3xl tracking-normal'>{title}</h2>
								<p className='mt-3 text-slate-500 text-sm'>{description}</p>
							</div>

							<div className='grid gap-4'>
								{isRegister ? (
									<FormField label='Имя администратора'>
										<Input
											aria-label='Имя администратора'
											autoComplete='name'
											className='h-11'
											placeholder='Иван Петров'
										/>
									</FormField>
								) : null}
								<FormField label='E-mail'>
									<Input
										aria-label='E-mail'
										autoComplete='email'
										className='h-11'
										placeholder='admin@lampozavod.ru'
										type='email'
									/>
								</FormField>
								<FormField label='Пароль'>
									<Input
										aria-label='Пароль'
										autoComplete={
											isRegister ? 'new-password' : 'current-password'
										}
										className='h-11'
										placeholder='Введите пароль'
										type='password'
									/>
								</FormField>
								{isRegister ? (
									<FormField label='Повторите пароль'>
										<Input
											aria-label='Повторите пароль'
											autoComplete='new-password'
											className='h-11'
											placeholder='Повторите пароль'
											type='password'
										/>
									</FormField>
								) : (
									<label className='flex items-center gap-2 text-slate-500 text-sm'>
										<input className='size-4 accent-blue-600' type='checkbox' />
										Запомнить меня
									</label>
								)}
							</div>

							<Link
								className='mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-semibold text-sm text-white shadow-xs transition hover:bg-blue-700'
								to='/admin/dashboard'
							>
								{isRegister ? (
									<UserPlus aria-hidden={true} className='size-4' />
								) : (
									<BadgeCheck aria-hidden={true} className='size-4' />
								)}
								{isRegister ? 'Создать аккаунт' : 'Войти'}
							</Link>
							<Link
								className='mt-3 inline-flex h-10 w-full items-center justify-center rounded-md text-slate-500 text-sm transition hover:bg-slate-50 hover:text-foreground'
								to='/catalog'
							>
								Вернуться в каталог
							</Link>
						</form>
					</section>
				</div>
			</main>
		</>
	)
}

function AuthModeLink({
	active,
	children,
	to
}: {
	active: boolean
	children: ReactNode
	to: string
}) {
	return (
		<Link
			className={cn(
				'rounded-sm px-4 py-2 font-medium text-sm transition',
				active
					? 'bg-background text-foreground shadow-xs'
					: 'text-slate-500 hover:text-foreground'
			)}
			to={to}
		>
			{children}
		</Link>
	)
}

function AuthFeature({icon: Icon, label}: {icon: LucideIcon; label: string}) {
	return (
		<div className='flex items-center gap-2 rounded-md bg-white/5 px-3 py-2'>
			<Icon aria-hidden={true} className='size-4 text-blue-400' />
			<span>{label}</span>
		</div>
	)
}

export function AdminLogin() {
	return <AdminAuth mode='login' />
}

export function AdminRegister() {
	return <AdminAuth mode='register' />
}
