import {
	BadgeCheck,
	type LucideIcon,
	MessageSquare,
	Package,
	Truck,
	UserPlus
} from 'lucide-react'
import {type FormEvent, type ReactNode, useCallback, useState} from 'react'
import {Link, useNavigate} from 'react-router'
import {Head} from '@/components/Head'
import {
	getStoredAdminAccessToken,
	useLoginAdminMutation,
	useRegisterAdminMutation
} from '@/shared/api/authApi'
import {cn} from '@/shared/lib/utils'
import {Button} from '@/shared/ui/Button'
import {Input} from '@/shared/ui/input'
import {AdminLogo} from '../_components/layout'
import {FormField} from '../_components/shared'

interface AdminAuthProperties {
	mode: 'login' | 'register'
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Admin auth keeps the route form, marketing panel, and submit flow together for now.
function AdminAuth({mode}: AdminAuthProperties) {
	const isRegister = mode === 'register'
	const navigate = useNavigate()
	const [loginAdmin, loginAdminResult] = useLoginAdminMutation()
	const [registerAdmin, registerAdminResult] = useRegisterAdminMutation()
	const [authError, setAuthError] = useState<string | undefined>()
	const title = isRegister ? 'Регистрация администратора' : 'Вход в админку'
	const description = isRegister
		? 'Создайте учетную запись для управления каталогом и заказами.'
		: 'Авторизуйтесь, чтобы перейти к управлению магазином.'

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			setAuthError(undefined)

			const formData = new FormData(event.currentTarget)
			const fullName = String(formData.get('fullName') ?? '').trim()
			const email = String(formData.get('email') ?? '').trim()
			const password = String(formData.get('password') ?? '')
			const passwordConfirmation = String(
				formData.get('passwordConfirmation') ?? ''
			)

			try {
				if (!isRegister) {
					await loginAdmin({email, password}).unwrap()
					navigate('/admin/dashboard')
					return
				}

				if (password !== passwordConfirmation) {
					setAuthError('Пароли не совпадают.')
					return
				}

				const accessToken = getStoredAdminAccessToken()
				if (!accessToken) {
					setAuthError(
						'Регистрация доступна только действующему администратору. Сначала войдите в админку.'
					)
					return
				}

				const registerRequest = {
					accessToken,
					email,
					password
				}

				if (fullName) {
					Object.assign(registerRequest, {fullName})
				}

				await registerAdmin(registerRequest).unwrap()
				navigate('/admin/dashboard')
			} catch (error) {
				setAuthError(getAuthErrorMessage(error))
			}
		},
		[isRegister, loginAdmin, navigate, registerAdmin]
	)

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
								Рабочий доступ подключен к auth-service, чтобы команда могла
								быстро попасть к управлению ассортиментом.
							</p>
						</div>
						<div className='grid gap-3 text-slate-300 text-sm sm:grid-cols-3'>
							<AuthFeature icon={Package} label='Товары' />
							<AuthFeature icon={Truck} label='Заказы' />
							<AuthFeature icon={MessageSquare} label='Обращения' />
						</div>
					</section>

					<section className='flex items-center px-6 py-10 sm:px-10'>
						<form className='w-full' onSubmit={handleSubmit}>
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
											name='fullName'
											placeholder='Иван Петров'
										/>
									</FormField>
								) : null}
								<FormField label='E-mail'>
									<Input
										aria-label='E-mail'
										autoComplete='email'
										className='h-11'
										name='email'
										placeholder='admin@lampozavod.ru'
										required={true}
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
										minLength={isRegister ? 8 : undefined}
										name='password'
										placeholder='Введите пароль'
										required={true}
										type='password'
									/>
								</FormField>
								{isRegister ? (
									<FormField label='Повторите пароль'>
										<Input
											aria-label='Повторите пароль'
											autoComplete='new-password'
											className='h-11'
											minLength={8}
											name='passwordConfirmation'
											placeholder='Повторите пароль'
											required={true}
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

							{authError ? (
								<p
									className='mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm'
									role='alert'
								>
									{authError}
								</p>
							) : null}

							{isRegister ? (
								<Button
									className='mt-6 h-11 w-full bg-blue-600 text-white hover:bg-blue-700'
									disabled={registerAdminResult.isLoading}
									type='submit'
								>
									<UserPlus aria-hidden={true} className='size-4' />
									{registerAdminResult.isLoading
										? 'Создаем аккаунт...'
										: 'Создать аккаунт'}
								</Button>
							) : (
								<Button
									className='mt-6 h-11 w-full bg-blue-600 text-white hover:bg-blue-700'
									disabled={loginAdminResult.isLoading}
									type='submit'
								>
									<BadgeCheck aria-hidden={true} className='size-4' />
									{loginAdminResult.isLoading ? 'Входим...' : 'Войти'}
								</Button>
							)}
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

function getAuthErrorMessage(error: unknown) {
	if (hasData(error) && isRecord(error.data)) {
		const {detail} = error.data

		if (typeof detail === 'string') {
			if (detail === 'Bearer token is required') {
				return 'Регистрация доступна только действующему администратору. Сначала войдите в админку.'
			}

			if (detail === 'Invalid email or password') {
				return 'Неверный e-mail или пароль.'
			}

			return detail
		}

		if (Array.isArray(detail)) {
			const messages = detail
				.map(item => (hasMessage(item) ? item.msg : undefined))
				.filter((message): message is string => typeof message === 'string')

			if (messages.length > 0) {
				return messages.join(' ')
			}
		}
	}

	return 'Не удалось выполнить действие. Проверьте данные и доступность auth-service.'
}

function hasData(value: unknown): value is {data: unknown} {
	return isRecord(value) && 'data' in value
}

function hasMessage(value: unknown): value is {msg: string} {
	if (!isRecord(value)) {
		return false
	}

	const candidate = value as {msg?: unknown}

	return typeof candidate.msg === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
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
