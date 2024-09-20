import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import store from './store/store.js'
import {Provider} from 'react-redux'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AuthProvider>

    <Provider store={store}>

      <App />
    </Provider>
    </AuthProvider>

  </StrictMode>,
)
