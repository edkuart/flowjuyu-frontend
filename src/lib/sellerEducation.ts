"use client"

export const SELLER_STORE_SHARED_KEY = "flowjuyu_seller_store_shared_v1"

export function markSellerStoreShared() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SELLER_STORE_SHARED_KEY, "1")
}

export function hasSellerStoreBeenShared() {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(SELLER_STORE_SHARED_KEY) === "1"
}
