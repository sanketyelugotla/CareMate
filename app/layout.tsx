import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import SiteHeaderWrapper from "@/components/site-header-wrapper"
import PageLoader from "@/components/PageLoader"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "CareMate",
  description: "Intelligent hospital management system",
  generator: "Sanket Yelugotla",
}

/** Full-screen spinner used as Suspense fallback */
function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
            style={{ animation: "spin 0.8s linear infinite" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-3 h-3 bg-primary rounded-full"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            ></div>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-wide">Loading CareMate...</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
      `}</style>
    </div>
  )
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
        <Suspense fallback={<FullScreenSpinner />}>
          <SiteHeaderWrapper />
          <PageLoader />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
