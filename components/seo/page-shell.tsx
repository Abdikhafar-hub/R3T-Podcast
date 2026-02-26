import Link from "next/link"
import type { ReactNode } from "react"
import { SITE_NAME } from "@/lib/seo"

export type SeoNavItem = {
  href: string
  label: string
  description: string
}

export const SEO_NAV_ITEMS: SeoNavItem[] = [
  {
    href: "/about",
    label: "About",
    description: "What R3T is about and what kind of conversations to expect.",
  },
  {
    href: "/hosts",
    label: "Hosts",
    description: "Meet the R3T hosts and producer behind the podcast.",
  },
  {
    href: "/episodes",
    label: "Episodes",
    description: "Browse featured videos and listening platforms for R3T episodes.",
  },
  {
    href: "/contact",
    label: "Contact",
    description: "Contact the R3T team and find official social channels.",
  },
]

type SeoPageShellProps = {
  currentPath: string
  title: string
  description?: string
  children: ReactNode
}

function isCurrentPath(currentPath: string, href: string): boolean {
  return currentPath === href
}

export function SeoPageLinks({
  currentPath,
  title = "Explore R3T Pages",
  compact = false,
}: {
  currentPath?: string
  title?: string
  compact?: boolean
}) {
  return (
    <section
      aria-labelledby="r3t-seo-pages-heading"
      className={`rounded-2xl border border-border bg-card/60 backdrop-blur-sm ${
        compact ? "p-4 sm:p-6" : "p-6 sm:p-8"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
        <h2 id="r3t-seo-pages-heading" className={`${compact ? "text-lg" : "text-xl sm:text-2xl"} font-serif font-semibold`}>
          {title}
        </h2>
        <Link href="/" className="text-sm text-primary hover:underline">
          Home
        </Link>
      </div>

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        {SEO_NAV_ITEMS.map((item) => {
          const active = currentPath ? isCurrentPath(currentPath, item.href) : false
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl border p-4 transition-colors ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/50 hover:border-primary/50"
              }`}
            >
              <div className="font-medium">{item.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function SeoPageShell({ currentPath, title, description, children }: SeoPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/" className="font-serif text-xl sm:text-2xl font-semibold tracking-tight hover:text-primary transition-colors">
                {SITE_NAME}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">Podcast conversations on roots, routes, and real talk.</p>
            </div>
            <nav aria-label="Primary" className="flex flex-wrap gap-2">
              <Link
                href="/"
                className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                  currentPath === "/" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                Home
              </Link>
              {SEO_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrentPath(currentPath, item.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                    isCurrentPath(currentPath, item.href)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            {" / "}
            <span>{title}</span>
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-balance">{title}</h1>
          {description ? <p className="mt-4 max-w-3xl text-base sm:text-lg text-muted-foreground">{description}</p> : null}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {children}
        <SeoPageLinks currentPath={currentPath} compact />
      </section>
    </main>
  )
}

