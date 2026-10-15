import * as React from "react"

// Below lg the sidebar is a sheet: on a tablet an open rail leaves the pages too little room.
const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Phone width, for layouts that stack instead of sitting side by side.
const phone = typeof window === "undefined" ? null : window.matchMedia("(max-width: 639px)")
export function useIsPhone() {
  return React.useSyncExternalStore(
    (cb) => (phone?.addEventListener("change", cb), () => phone?.removeEventListener("change", cb)),
    () => phone?.matches ?? false,
    () => false,
  )
}
