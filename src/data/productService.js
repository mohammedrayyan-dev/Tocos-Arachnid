import { supabase } from "../lib/supabase"
import beginnerTarantula from "../assets/image/beginner-tarantula-care.webp"
import mexicanRedKnee from "../assets/image/mexican-red-knee.webp"
import brazilianBlack from "../assets/image/brazilian-black.webp"
import bioactiveMasterclass from "../assets/image/bioactive-masterclass.webp"
import isopodsCare from "../assets/image/isopods-care.webp"
import millipedeCare from "../assets/image/millipede-care.webp"
import heroImage from "../assets/image/hero-image.webp"

const FULL_PRODUCT_CATALOG = []

const resolveProductImage = (product) => {
  const thumb = product.thumbnail || product.image
  if (thumb && typeof thumb === 'string' && thumb.trim() !== '' && !thumb.includes('placehold.co')) {
    return thumb
  }
  const images = Array.isArray(product.images) ? product.images : []
  const candidate = images.find(url => url && typeof url === 'string' && url.trim() !== '' && !url.includes('placehold.co'))
  if (candidate) return candidate

  if (thumb && typeof thumb === 'string' && thumb.trim() !== '') {
    return thumb
  }

  const name = String(product.name || '').toLowerCase()
  const cat = String(product.category || '').toLowerCase()
  const sub = String(product.sub_category || '').toLowerCase()

  if (name.includes('mexican') || name.includes('hamorii') || name.includes('red knee')) return mexicanRedKnee
  if (name.includes('brazilian') || name.includes('pulchra') || name.includes('black')) return brazilianBlack
  if (cat.includes('tarantula') || sub.includes('arboreal') || sub.includes('terrestrial') || sub.includes('new world') || sub.includes('old world')) return beginnerTarantula
  if (cat.includes('enclosure') || sub.includes('acrylic') || sub.includes('glass')) return bioactiveMasterclass
  if (cat.includes('feed') || name.includes('roach') || name.includes('worm') || name.includes('fly')) return isopodsCare
  if (cat.includes('amphibian') || cat.includes('reptile') || name.includes('frog') || name.includes('snake') || name.includes('gecko')) return millipedeCare

  return heroImage
}

const categorizeProduct = (p) => {
    const name = String(p.name || '').toLowerCase()
    const sub = String(p.sub_category || '').toLowerCase()
    const cat = String(p.category || '').toLowerCase()

    let category = p.category || 'Tarantulas'
    let sub_category = p.sub_category || 'Terrestrial'
    let origin_tag = p.origin_tag || (sub.includes('old') || name.includes('metallica') ? 'OLD WORLD' : 'NEW WORLD')
    let care_level = p.care_level || (name.includes('beginner') || name.includes('hamorii') ? 'Best for Beginners' : 'Best for Collectors')
    let temperament = p.temperament || (name.includes('defensive') || name.includes('metallica') ? 'Defensive' : 'Docile')
    let residence = p.residence || (sub.includes('arboreal') || name.includes('tree') || name.includes('metallica') ? 'Arboreal' : 'Terrestrial')

    return {
        ...p,
        category,
        sub_category,
        origin_tag,
        care_level,
        temperament,
        residence
    }
}

export const isDummyProduct = (p) => {
    if (!p) return true
    const createdAt = String(p.created_at || '')
    // Batch test seed products from June 2026
    if (createdAt.startsWith('2026-06-21') || createdAt.startsWith('2026-06-22') || createdAt.startsWith('2026-06-')) {
        return true
    }
    // Placeholder image URLs from dummy seeding
    if (typeof p.image === 'string' && (p.image.includes('placehold.co') || p.image.includes('400x400') || p.image.includes('400%20x%20400'))) {
        return true
    }
    if (typeof p.thumbnail === 'string' && (p.thumbnail.includes('placehold.co') || p.thumbnail.includes('400x400') || p.thumbnail.includes('400%20x%20400'))) {
        return true
    }
    // Known test names seeded without proper origin
    const name = String(p.name || '').toLowerCase()
    if (name === 'misting bottle' || name === 'springtails (culture)' || name.startsWith('water dish') || name.startsWith('glass terrarium')) {
        if (!p.client_assigned && (!createdAt || createdAt.startsWith('2026-06-'))) return true
    }
    return false
}

export const getAllProducts = async (retries = 2) => {
    try {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
        if (!error && Array.isArray(data)) {
            // Filter out dummy seed products
            const clientOnly = data.filter(p => !isDummyProduct(p))

            // Background purge dummy items in Supabase if admin is logged in
            const dummyIds = data.filter(p => isDummyProduct(p)).map(p => p.id)
            if (dummyIds.length > 0) {
                try {
                    supabase.from('products').delete().in('id', dummyIds).then(() => {}).catch(() => {})
                } catch (e) {}
            }

            // Check for locally assigned client products
            let localClientProducts = []
            try {
                const saved = localStorage.getItem('tocos_client_products')
                if (saved) {
                    localClientProducts = JSON.parse(saved).filter(p => !isDummyProduct(p))
                }
            } catch (e) {}

            const mergedMap = new Map()
            clientOnly.forEach(p => mergedMap.set(String(p.id), p))
            localClientProducts.forEach(p => mergedMap.set(String(p.id), p))

            const finalItems = Array.from(mergedMap.values())
            return finalItems.map(p => {
                const resolvedImg = resolveProductImage(p)
                const priceNum = Number(p.price) || 0
                const formatted = {
                    ...p,
                    price: priceNum,
                    thumbnail: resolvedImg,
                    image: resolvedImg,
                    in_stock: p.in_stock !== false && (p.stock === undefined || p.stock === null || Number(p.stock) > 0)
                }
                return categorizeProduct(formatted)
            })
        }
    } catch (e) {
        console.warn("Supabase client fetch notice, executing direct REST fetch:", e)
    }

    // Direct REST fetch fallback if supabase-js client encounters Chrome HTTP2 errors
    try {
        const baseUrl = (import.meta.env.DEV && typeof window !== 'undefined')
            ? `${window.location.origin}/supabase-rest`
            : import.meta.env.VITE_SUPABASE_URL
        const url = `${baseUrl}/rest/v1/products?select=*&order=created_at.desc`
        const res = await fetch(url, {
            headers: {
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            cache: 'no-store'
        })
        if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) {
                const clientOnly = data.filter(p => !isDummyProduct(p))
                let localClientProducts = []
                try {
                    const saved = localStorage.getItem('tocos_client_products')
                    if (saved) localClientProducts = JSON.parse(saved).filter(p => !isDummyProduct(p))
                } catch (e) {}

                const mergedMap = new Map()
                clientOnly.forEach(p => mergedMap.set(String(p.id), p))
                localClientProducts.forEach(p => mergedMap.set(String(p.id), p))

                const finalItems = Array.from(mergedMap.values())
                return finalItems.map(p => {
                    const resolvedImg = resolveProductImage(p)
                    const priceNum = Number(p.price) || 0
                    const formatted = {
                        ...p,
                        price: priceNum,
                        thumbnail: resolvedImg,
                        image: resolvedImg,
                        in_stock: p.in_stock !== false && (p.stock === undefined || p.stock === null || Number(p.stock) > 0)
                    }
                    return categorizeProduct(formatted)
                })
            }
        }
    } catch (directErr) {
        console.error("Direct fetch error:", directErr)
    }

    if (retries > 0) {
        await new Promise(r => setTimeout(r, 400))
        return getAllProducts(retries - 1)
    }

    // Check localStorage fallback for client products
    try {
        const saved = localStorage.getItem('tocos_client_products')
        if (saved) {
            const parsed = JSON.parse(saved).filter(p => !isDummyProduct(p))
            if (parsed.length > 0) {
                return parsed.map(p => {
                    const resolvedImg = resolveProductImage(p)
                    const priceNum = Number(p.price) || 0
                    const formatted = {
                        ...p,
                        price: priceNum,
                        thumbnail: resolvedImg,
                        image: resolvedImg,
                        in_stock: p.in_stock !== false && (p.stock === undefined || p.stock === null || Number(p.stock) > 0)
                    }
                    return categorizeProduct(formatted)
                })
            }
        }
    } catch (e) {}

    return []
}

export const getProductBySlug = async (slug) => {
    if (!slug) return null
    const all = await getAllProducts()
    const cleanSlug = String(slug).toLowerCase()
    return all.find(p => p.slug?.toLowerCase() === cleanSlug || String(p.id) === cleanSlug) || null
}

export const getProductsByCategory = async (category) => {
    const all = await getAllProducts()
    if (!category || category === "Shop All" || category === "All Products" || category === "All" || category.toLowerCase().includes("shop-all")) return all
    const search = String(category).toLowerCase().replace(/-/g, " ").trim()

    const matched = all.filter(p => {
        const cat = String(p.category || "").toLowerCase()
        const sub = String(p.sub_category || "").toLowerCase()
        const name = String(p.name || "").toLowerCase()
        const desc = String(p.description || "").toLowerCase()

        if (search.includes("tarantula")) {
            return cat.includes("tarantula") || sub.includes("world") || sub.includes("terrestrial") || sub.includes("arboreal") || !cat || cat === "no_category"
        }
        if (search.includes("enclosure") || search.includes("terrarium")) {
            return cat.includes("enclosure") || sub.includes("enclosure") || name.includes("enclosure") || name.includes("terrarium") || name.includes("crib")
        }
        if (search.includes("feed") || search.includes("feeder")) {
            return cat.includes("feed") || sub.includes("feed") || name.includes("roach") || name.includes("worm") || name.includes("fly")
        }
        if (search.includes("amphibian") || search.includes("frog")) {
            return cat.includes("amphibian") || sub.includes("frog") || name.includes("frog") || name.includes("pacman")
        }
        if (search.includes("reptile") || search.includes("snake") || search.includes("lizard")) {
            return cat.includes("reptile") || sub.includes("snake") || name.includes("snake") || name.includes('gecko')
        }

        return cat.includes(search) || search.includes(cat) || sub.includes(search) || name.includes(search) || desc.includes(search)
    })

    return matched
}

export const getProductsBySubCategory = async (subCategory) => {
    const all = await getAllProducts()
    if (!subCategory || subCategory === "All" || subCategory === "Shop All" || subCategory === "All Products") return all
    const search = String(subCategory).toLowerCase().replace(/-/g, " ").trim()

    const matched = all.filter(p => {
        const sub = String(p.sub_category || "").toLowerCase()
        const origin = String(p.origin_tag || "").toLowerCase()
        const cat = String(p.category || "").toLowerCase()
        const name = String(p.name || "").toLowerCase()
        const desc = String(p.description || "").toLowerCase()
        const residence = String(p.residence || "").toLowerCase()

        if (search === "new world" || search === "old world") {
            return origin.includes(search) || sub.includes(search) || (search === "new world" && !sub.includes("old"))
        }
        if (search === "terrestrial" || search === "arboreal" || search === "fossorial") {
            return residence.includes(search) || sub.includes(search) || (search === "terrestrial" && residence !== "arboreal")
        }

        return (
            sub.includes(search) ||
            origin.includes(search) ||
            search.includes(sub) ||
            search.includes(origin) ||
            cat.includes(search) ||
            name.includes(search) ||
            desc.includes(search)
        )
    })

    return matched
}

export const searchProducts = async (query) => {
    if (!query || query.trim() === "") return []
    const all = await getAllProducts()
    const cleanQuery = query.trim().toLowerCase()
    
    return all.filter(p => 
        p.name?.toLowerCase().includes(cleanQuery) || 
        p.common_name?.toLowerCase().includes(cleanQuery) || 
        p.scientific_name?.toLowerCase().includes(cleanQuery) ||
        p.category?.toLowerCase().includes(cleanQuery) ||
        p.sub_category?.toLowerCase().includes(cleanQuery) ||
        p.origin_tag?.toLowerCase().includes(cleanQuery)
    ).slice(0, 8)
}

export const getFeaturedByType = async (type, limit = 4) => {
    const all = await getAllProducts()
    if (!type) return all.slice(0, limit)
    const search = String(type).toLowerCase()

    const matched = all.filter(p => {
        const feat = String(p.featured || "").toLowerCase()
        const featType = String(p.featured_type || "").toLowerCase()
        const care = String(p.care_level || "").toLowerCase()
        const temp = String(p.temperament || "").toLowerCase()
        return (
            feat.includes(search) ||
            featType.includes(search) ||
            (search.includes("beginner") && (care.includes("beginner") || temp.includes("docile"))) ||
            (search.includes("collector") && (care.includes("collector") || temp.includes("defensive")))
        )
    })

    return matched.slice(0, limit)
}

export const getAllFeaturedByType = async (type) => {
    const all = await getAllProducts()
    if (!type) return all
    const search = String(type).toLowerCase()

    const matched = all.filter(p => {
        const feat = String(p.featured || "").toLowerCase()
        const featType = String(p.featured_type || "").toLowerCase()
        const care = String(p.care_level || "").toLowerCase()
        const temp = String(p.temperament || "").toLowerCase()
        return (
            feat.includes(search) ||
            featType.includes(search) ||
            (search.includes("beginner") && (care.includes("beginner") || temp.includes("docile"))) ||
            (search.includes("collector") && (care.includes("collector") || temp.includes("defensive")))
        )
    })

    return matched
}

export const addProduct = async (product) => {
    const { data, error } = await supabase.from("products").insert(product)
    if (error) throw error
    return data
}

export const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
    if (error) throw error
    return data
}

export const deleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) throw error
}