'use client'

import Header from './Header'
import Footer from './Footer'

export default function LayoutWrapper({ children }) {
  return (
    <>
    <div className='max-w-screen-3xl overflow-x-hidden w-full min-h-screen h-full px-2'>

      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      </div>
    </>
  )
}