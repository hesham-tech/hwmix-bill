// متجر السلة — يحفظ منتجات السلة في localStorage ويوفر دوال الإضافة والحذف والتحديث
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore(
  'cart',
  () => {
    // Load from localStorage initially
    const savedCart = localStorage.getItem('hwnix_store_cart')
    const items = ref(savedCart ? JSON.parse(savedCart) : [])
    // { variantId, productId, companyId, companyName, companyLogo, productName, variantSku, image, unitPrice, quantity, maxStock }
    const isDrawerOpen = ref(false)

    // Sync to localStorage on every change
    watch(items, (newItems) => {
      localStorage.setItem('hwnix_store_cart', JSON.stringify(newItems))
    }, { deep: true })

    const itemCount = computed(() =>
      items.value.reduce((sum, i) => sum + Number(i.quantity), 0)
    )

    const totalAmount = computed(() =>
      items.value.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.quantity), 0)
    )

    const groupedByVendor = computed(() => {
      const groups = {}
      for (const item of items.value) {
        if (!groups[item.companyId]) {
          groups[item.companyId] = {
            companyId: item.companyId,
            companyName: item.companyName,
            companyLogo: item.companyLogo,
            items: [],
            subtotal: 0,
          }
        }
        groups[item.companyId].items.push(item)
        groups[item.companyId].subtotal +=
          Number(item.unitPrice) * Number(item.quantity)
      }
      return Object.values(groups)
    })

    const isEmpty = computed(() => items.value.length === 0)

    function addItem({
      variantId,
      productId,
      companyId,
      companyName,
      companyLogo,
      productName,
      variantSku,
      image,
      unitPrice,
      quantity = 1,
      maxStock,
    }) {
      const existing = items.value.find((i) => i.variantId === variantId)
      if (existing) {
        const newQty = existing.quantity + quantity
        existing.quantity = Math.min(newQty, maxStock ?? 9999)
      } else {
        items.value.push({
          variantId,
          productId,
          companyId,
          companyName,
          companyLogo,
          productName,
          variantSku,
          image,
          unitPrice,
          quantity,
          maxStock,
        })
      }
      isDrawerOpen.value = true
    }

    function removeItem(variantId) {
      items.value = items.value.filter((i) => i.variantId !== variantId)
    }

    function updateQuantity(variantId, quantity) {
      const item = items.value.find((i) => i.variantId === variantId)
      if (item) {
        if (quantity <= 0) removeItem(variantId)
        else item.quantity = Math.min(quantity, item.maxStock ?? 9999)
      }
    }

    function clearCart() {
      items.value = []
    }

    function toggleDrawer() {
      isDrawerOpen.value = !isDrawerOpen.value
    }

    // بناء payload للإرسال للـ API
    function buildOrderPayload(addressId, notes = '') {
      return {
        shipping_address_id: addressId,
        payment_method: 'cod',
        notes,
        items: items.value.map((i) => ({
          variant_id: i.variantId,
          company_id: i.companyId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          total_price: Number(i.unitPrice) * Number(i.quantity),
        })),
      }
    }

    return {
      items,
      isDrawerOpen,
      itemCount,
      totalAmount,
      groupedByVendor,
      isEmpty,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleDrawer,
      buildOrderPayload,
    }
  },
  {
    // Persist cart in localStorage manually since pinia-plugin-persistedstate is not installed
    persist: false,
  }
)
