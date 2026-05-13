import {Navigate, Route, Routes} from 'react-router'
import {Cart} from '@/pages/Cart'
import {Catalog} from '@/pages/Catalog'
import {Checkout} from '@/pages/Checkout'
import {OrderConfirmation} from '@/pages/OrderConfirmation'
import {ProductDetails} from '@/pages/ProductDetails'
import {
	AdminDashboard,
	AdminInquiries,
	AdminLayout,
	AdminLogin,
	AdminOrders,
	AdminProductEditor,
	AdminProducts,
	AdminRegister
} from './pages/Admin'

export function App() {
	return (
		<Routes>
			<Route element={<Navigate replace={true} to='/catalog' />} index={true} />
			<Route element={<AdminLogin />} path='admin/login' />
			<Route element={<AdminRegister />} path='admin/register' />
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
			<Route element={<Catalog />} path='catalog' />
			<Route element={<ProductDetails />} path='products/:productSlug' />
			<Route element={<Cart />} path='cart' />
			<Route element={<Checkout />} path='checkout' />
			<Route element={<OrderConfirmation />} path='order-confirmation' />
			<Route element={<Navigate replace={true} to='/catalog' />} path='*' />
		</Routes>
	)
}
