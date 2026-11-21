import { supabase } from './supabase'

const STORAGE_KEY_DELETED_PRODUCTS = 'tocos_deleted_product_ids'
const STORAGE_KEY_DELETED_ORDERS = 'tocos_deleted_order_ids'

// Safely get deleted product IDs
export const getDeletedProductIds = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_PRODUCTS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (e) {
    return []
  }
}

// Check if a product ID is deleted
export const isProductDeleted = (id) => {
  if (!id) return false
  const deleted = getDeletedProductIds()
  return deleted.includes(String(id))
}

// Mark an individual product permanently deleted
export const markProductDeleted = async (id) => {
  if (!id) return
  const strId = String(id)
  
  // 1. Save to local persistent blacklist
  try {
    const current = getDeletedProductIds()
    if (!current.includes(strId)) {
      current.push(strId)
      localStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(current))
    }
  } catch (e) {}

  // 2. Trigger cross-tab & cross-component sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tocos:data_changed'))
    window.dispatchEvent(new Event('storage'))
  }

  // 3. Attempt direct DB delete from Supabase
  try {
    await supabase.from('products').delete().eq('id', id)
  } catch (e) {
    console.warn('Supabase product delete notice:', e)
  }
}

// Unmark a product from deleted list (when adding, editing or re-stocking)
export const unmarkProductDeleted = (id) => {
  if (!id) return
  const strId = String(id)
  try {
    const current = getDeletedProductIds()
    const filtered = current.filter(x => x !== strId)
    localStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(filtered))
  } catch (e) {}
}

// Filter out deleted products from any array
export const filterActiveProducts = (products) => {
  if (!Array.isArray(products)) return []
  const deleted = getDeletedProductIds()
  if (deleted.length === 0) return products
  return products.filter(p => p && !deleted.includes(String(p.id)))
}

// Safely get deleted order IDs
export const getDeletedOrderIds = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_ORDERS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (e) {
    return []
  }
}

// Check if an order is deleted
export const isOrderDeleted = (orderOrId) => {
  if (!orderOrId) return false
  const deleted = getDeletedOrderIds()
  if (deleted.length === 0) return false

  if (typeof orderOrId === 'string' || typeof orderOrId === 'number') {
    return deleted.includes(String(orderOrId))
  }

  const id = orderOrId.id ? String(orderOrId.id) : null
  const rawId = orderOrId.rawId ? String(orderOrId.rawId) : null
  const orderNum = orderOrId.orderNumber || orderOrId.order_number ? String(orderOrId.orderNumber || orderOrId.order_number) : null
  const orderId = orderOrId.orderId || orderOrId.order_id ? String(orderOrId.orderId || orderOrId.order_id) : null

  return (
    (id && deleted.includes(id)) ||
    (rawId && deleted.includes(rawId)) ||
    (orderNum && deleted.includes(orderNum)) ||
    (orderId && deleted.includes(orderId))
  )
}

// Mark an order permanently deleted
export const markOrderDeleted = async (orderOrIds) => {
  if (!orderOrIds) return

  let rawUuid = null
  let displayId = null
  let orderNum = null

  if (typeof orderOrIds === 'object') {
    rawUuid = orderOrIds.rawId || orderOrIds.id
    displayId = orderOrIds.id
    orderNum = orderOrIds.orderNumber || orderOrIds.order_number
  } else {
    rawUuid = String(orderOrIds)
    displayId = String(orderOrIds)
  }

  const current = getDeletedOrderIds()
  const toAdd = [rawUuid, displayId, orderNum ? String(orderNum) : null].filter(Boolean).map(String)

  toAdd.forEach(id => {
    if (!current.includes(id)) current.push(id)
  })

  try {
    localStorage.setItem(STORAGE_KEY_DELETED_ORDERS, JSON.stringify(current))

    // Clean up local overrides if any
    const overrides = JSON.parse(localStorage.getItem('tocos_order_status_overrides') || '{}')
    toAdd.forEach(id => delete overrides[id])
    localStorage.setItem('tocos_order_status_overrides', JSON.stringify(overrides))

    const utrMap = JSON.parse(localStorage.getItem('tocos_order_utrs') || '{}')
    toAdd.forEach(id => delete utrMap[id])
    localStorage.setItem('tocos_order_utrs', JSON.stringify(utrMap))
  } catch (e) {}

  // Trigger sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tocos:data_changed'))
    window.dispatchEvent(new Event('storage'))
  }

  // Attempt database deletion in Supabase
  try {
    if (rawUuid) {
      try {
        await supabase.from('order_items').delete().eq('order_id', rawUuid)
      } catch (e) {}
      await supabase.from('orders').delete().eq('id', rawUuid)
    }
    if (orderNum) {
      await supabase.from('orders').delete().eq('order_number', orderNum)
    }
  } catch (e) {
    console.warn('Supabase order delete notice:', e)
  }
}

// Filter out deleted orders from any array
export const filterActiveOrders = (orders) => {
  if (!Array.isArray(orders)) return []
  const deleted = getDeletedOrderIds()
  if (deleted.length === 0) return orders
  return orders.filter(o => o && !isOrderDeleted(o))
}

// Clean up any stale developer cache or accidental mass-purge lockouts on boot
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tocos_admin_orders')
    localStorage.removeItem('tocos_local_products')
    localStorage.removeItem('tocos_client_products')

    // If an accidental mass purge previously wiped all products, unblock so live products show up
    const rawProds = localStorage.getItem(STORAGE_KEY_DELETED_PRODUCTS)
    if (rawProds) {
      const parsed = JSON.parse(rawProds)
      if (Array.isArray(parsed) && parsed.length > 5) {
        localStorage.removeItem(STORAGE_KEY_DELETED_PRODUCTS)
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('user_orders_') || key.startsWith('tocos_mock_'))) {
        localStorage.removeItem(key)
      }
    }
  }
} catch (e) {}
