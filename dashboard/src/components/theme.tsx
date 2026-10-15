import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Moon, Sun } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"
const ThemeContext = createContext<{ theme: Theme; toggle: () => void; set: (t: Theme) => void }>({ theme: "light", toggle: () => {}, set: () => {} })

const read = (): Theme => {
  try {
    return localStorage.getItem("vg-theme") === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

// An embedded widget takes its theme from ?theme= and never changes the console's saved choice.
const embedded = () => window.location.pathname.includes("/embed/")
const embedTheme = (): Theme => (new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light")

// Light is the default; the choice is remembered per browser.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (embedded() ? embedTheme() : read()))
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    if (embedded()) return
    try {
      localStorage.setItem("vg-theme", theme)
    } catch {
      /* storage unavailable: keep the in-memory choice */
    }
  }, [theme])
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")), set: setTheme }}>{children}</ThemeContext.Provider>
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext)
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  )
}

export const useTheme = () => useContext(ThemeContext)
