import {Navigate, Outlet, Route, Routes, useLocation} from 'react-router'
import {AdminLayout} from '@/pages/admin/_components/layout'
import {AdminLogin, AdminRegister} from '@/pages/admin/auth'
import {AdminDashboard} from '@/pages/admin/dashboard'
import {AdminInquiries} from '@/pages/admin/inquiries'
import {AdminOrders} from '@/pages/admin/orders'
import {AdminProductEditor} from '@/pages/admin/product-editor'
import {AdminProducts} from '@/pages/admin/products'
import {Cart} from '@/pages/cart'
import {Catalog} from '@/pages/catalog'
import {Checkout} from '@/pages/checkout'
import {OrderConfirmation} from '@/pages/order-confirmation'
import {ProductDetails} from '@/pages/product-details'
import {getStoredAdminAccessToken} from '@/shared/api/authApi'

export function App() {
	return (
		<Routes>
			<Route element={<Navigate replace={true} to='/catalog' />} index={true} />
			<Route element={<AdminLogin />} path='admin/login' />
			<Route element={<AdminRegister />} path='admin/register' />
			<Route element={<RequireAdminAuth />}>
				<Route element={<AdminLayout />} path='admin'>
					<Route
						element={<Navigate replace={true} to='/admin/dashboard' />}
						index={true}
					/>
					<Route element={<AdminDashboard />} path='dashboard' />
					<Route element={<AdminProducts />} path='products' />
					<Route element={<AdminProductEditor />} path='products/new' />
					<Route
						element={<AdminProductEditor />}
						path='products/:productId/edit'
					/>
					<Route element={<AdminOrders />} path='orders' />
					<Route element={<AdminInquiries />} path='inquiries' />
				</Route>
			</Route>
			<Route element={<Catalog />} path='catalog' />
			<Route element={<ProductDetails />} path='products/:productSlug' />
			<Route element={<Cart />} path='cart' />
			<Route element={<Checkout />} path='checkout' />
			<Route element={<OrderConfirmation />} path='order-confirmation' />
			<Route element={<Navigate replace={true} to='/catalog' />} path='*' />
		</Routes>
	)
}

function RequireAdminAuth() {
	const location = useLocation()

	if (!getStoredAdminAccessToken()) {
		return (
			<Navigate
				replace={true}
				state={{from: location.pathname}}
				to='/admin/login'
			/>
		)
	}

	return <Outlet />
}
