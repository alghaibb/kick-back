import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Use modern addEventListener
    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Memoize the boolean conversion to prevent unnecessary re-renders
  return React.useMemo(() => !!isMobile, [isMobile])
}
