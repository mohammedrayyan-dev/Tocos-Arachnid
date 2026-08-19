import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthContext"
import { supabase } from "../lib/supabase"
import { getAllProducts } from "../data/productService"

const CartContext = createContext()

const parseItemPrice = (p) => {
    if (p === null || p === undefined) return 0
    if (typeof p === 'number') return isNaN(p) ? 0 : p
    const clean = String(p).replace(/,/g, '').replace(/[^\d.]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
}

export const CartProvider = ({ children }) => {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem("tocos_local_cart")
            return saved ? JSON.parse(saved) : []
        } catch (e) {
            return []
        }
    })
    const [loading, setLoading] = useState(true)

    // Save cart state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem("tocos_local_cart", JSON.stringify(cartItems))
        } catch (e) {}
    }, [cartItems])

    const totalAmount = cartItems.reduce((acc, item) => {
        const rawPrice = item.products?.discounted_price || item.products?.price || item.price || 0
        return acc + (parseItemPrice(rawPrice) * (item.quantity || 1))
    }, 0)

    const addItem = async (productId, quantity = 1, productObj = null) => {
        let targetProduct = productObj
        if (!targetProduct) {
            try {
                const all = await getAllProducts()
                targetProduct = all.find(p => String(p.id) === String(productId) || p.slug === productId)
            } catch (e) {}
        }

        // 1. Immediate optimistic UI update
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item => 
                String(item.product_id) === String(productId) || 
                String(item.products?.id) === String(productId)
            )
            if (existingIndex > -1) {
                const updated = [...prev]
                const item = updated[existingIndex]
                updated[existingIndex] = {
                    ...item,
                    quantity: (item.quantity || 1) + quantity,
                    products: targetProduct || item.products
                }
                return updated
            } else {
                const newItem = {
                    id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    user_id: user?.id || 'guest',
                    product_id: productId,
                    quantity: quantity,
                    products: targetProduct || { id: productId, name: 'Product', price: 0 }
                }
                return [...prev, newItem]
            }
        })

        // 2. Background DB sync if user is logged in
        if (user?.id) {
            try {
                const { data: existing } = await supabase
                    .from("cart_items")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("product_id", productId)
                    .maybeSingle()

                if (existing) {
                    await supabase
                        .from("cart_items")
                        .update({ quantity: existing.quantity + quantity })
                        .eq("id", existing.id)
                } else {
                    await supabase
                        .from("cart_items")
                        .insert({ user_id: user.id, product_id: productId, quantity })
                }
            } catch (error) {
                console.warn("Cart DB sync notice:", error)
            }
        }
    }

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            await removeItem(cartItemId)
            return
        }

        // Optimistic UI update
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item))

        if (user?.id) {
            try {
                await supabase
                    .from("cart_items")
                    .update({ quantity: newQuantity })
                    .eq("id", cartItemId)
            } catch (e) {
                console.warn("Update cart qty notice:", e)
            }
        }
    }

    const removeItem = async (cartItemId) => {
        // Optimistic UI update
        setCartItems(prev => prev.filter(item => item.id !== cartItemId))

        if (user?.id) {
            try {
                await supabase
                    .from("cart_items")
                    .delete()
                    .eq("id", cartItemId)
            } catch (e) {
                console.warn("Remove cart item notice:", e)
            }
        }
    }

    const clearCart = async () => {
        setCartItems([])
        try {
            localStorage.removeItem("tocos_local_cart")
            if (user?.id) {
                await supabase.from("cart_items").delete().eq("user_id", user.id)
            }
        } catch (e) {}
    }

    // Sync with Supabase on mount or auth user change
    useEffect(() => {
        let isSubscribed = true

        const fetchCart = async () => {
            if (!user?.id) {
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from("cart_items")
                    .select("*, products(*)")
                    .eq("user_id", user.id)

                if (!error && data && isSubscribed && data.length > 0) {
                    setCartItems(data)
                }
            } catch (e) {
                console.warn("Fetch DB cart notice:", e)
            } finally {
                if (isSubscribed) setLoading(false)
            }
        }

        fetchCart()

        return () => {
            isSubscribed = false
        }
    }, [user?.id])

    return (
        <CartContext.Provider value={{ cartItems, totalAmount, loading, addItem, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)