import {Navigate, Route, Routes} from 'react-router'
import {Cart} from '@/pages/Cart'
import {Catalog} from '@/pages/Catalog'
import {Checkout} from '@/pages/Checkout'
import {OrderConfirmation} from '@/pages/OrderConfirmation'
import {ProductDetails} from '@/pages/ProductDetails'

export function App() {
	return (
		<Routes>
			<Route element={<Navigate replace={true} to='/catalog' />} index={true} />
			<Route element={<Catalog />} path='catalog' />
			<Route element={<ProductDetails />} path='products/:productSlug' />
			<Route element={<Cart />} path='cart' />
			<Route element={<Checkout />} path='checkout' />
			<Route element={<OrderConfirmation />} path='order-confirmation' />
			<Route element={<Navigate replace={true} to='/catalog' />} path='*' />
		</Routes>
	)
}
