import './global.css'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router'
import {App} from './App'
import {store} from './store'

const container = document.querySelector('#root')

if (container) {
	const root = createRoot(container)
	root.render(
		<StrictMode>
			<Provider store={store}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</Provider>
		</StrictMode>
	)
}
