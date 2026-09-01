import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
