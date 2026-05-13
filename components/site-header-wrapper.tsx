'use client'

import { usePathname } from 'next/navigation'
import SiteHeader from './site-header'

export default function SiteHeaderWrapper() {
  const pathname = usePathname()
  const hide = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')
  return <SiteHeader hide={hide} />
}