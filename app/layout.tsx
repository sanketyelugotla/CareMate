import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import SiteHeaderWrapper from "@/components/site-header-wrapper"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "CareMate",
  description: "Intelligent hospital management system",
  generator: "Sanket Yelugotla",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Public+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}} />
      </head>
      <body className={`font-body-md text-body-md overflow-x-hidden antialiased bg-background text-on-background`}>
        <Suspense fallback={<div>Loading...</div>}>
          <SiteHeaderWrapper />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
