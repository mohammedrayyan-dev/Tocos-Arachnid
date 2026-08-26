import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx"
import { CartProvider } from "./context/CartContext.jsx"
import { StoreSettingsProvider } from "./context/StoreSettingsContext.jsx"
import { Toaster } from "sonner"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster 
              richColors 
              position="top-center" 
              closeButton 
              duration={3500} 
              toastOptions={{
                style: {
                  zIndex: 99999
                }
              }}
            />
            <App />
          </BrowserRouter>
        </CartProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
