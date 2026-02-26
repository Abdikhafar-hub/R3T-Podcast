import type { Metadata } from "next"
import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"
import { DEFAULT_OG_IMAGE, DEFAULT_SITE_DESCRIPTION, SITE_NAME, SITE_URL, toAbsoluteUrl } from "@/lib/seo"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const defaultTitle = `${SITE_NAME} | Podcast`
const defaultOgImage = toAbsoluteUrl(DEFAULT_OG_IMAGE)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Abdikhafar Issack",
  keywords: [
    "Roots Routes Real Talk",
    "R3T podcast",
    "podcast hosts",
    "real talk podcast",
    "life and work conversations",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: DEFAULT_SITE_DESCRIPTION,
    locale: "en_US",
    images: defaultOgImage
      ? [
          {
            url: defaultOgImage,
            alt: `${SITE_NAME} logo`,
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_SITE_DESCRIPTION,
    images: defaultOgImage ? [defaultOgImage] : undefined,
  },
  icons: {
    icon: "/r3t-logo.png",
    shortcut: "/r3t-logo.png",
    apple: "/r3t-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${playfair.variable} antialiased`}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
