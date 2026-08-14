"use client"
import { Provider, useDispatch } from "react-redux"
import { useEffect } from "react"
import store from "./Store"
import { fetchUser } from "./features/userSlice"
import { fetchSiteContent } from "./features/siteContentSlice"
import { getStoredToken } from "@/lib/auth-storage"

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  
  useEffect(() => {
    // Fetch site content globally
    dispatch(fetchSiteContent())

    // Fetch user if token exists
    const pathname = typeof window !== "undefined" ? window.location.pathname : ""
    const expectedRole = pathname.startsWith("/volunteer") ? "volunteer" : undefined
    const token = getStoredToken(expectedRole)
    if (token) {
      dispatch(fetchUser(expectedRole))
    }
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  )
}
