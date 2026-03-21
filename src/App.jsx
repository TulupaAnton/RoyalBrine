import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { Home } from './pages/Home/Home'
import { About } from './pages/About/About'
import { Contacts } from './pages/Contact/Contact'

import { ProductDetail } from './pages/ProductDetail/ProductDetail'
import { CartPage } from './pages/CartPage/CartPage'
import { Catalog } from './pages/Catalog/Catalog'
import { Payment } from './pages/Payment/Payment'
// import { All } from './pages/Catalog/All'
import ComingSoon from './pages/ComingSoon/ComingSoon'
import { Toaster } from 'react-hot-toast'
import { Terms } from './components/Terms/Terms'
import { Privacy } from './components/Privacy/Privacy'
import { Refund } from './components/Refund/Refund'
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop'
import { CookieBanner } from './components/CookieBanner/CookieBanner'
import { Footer } from './components/Footer/Footer'
import PaskaProductPage from './components/Paska/Paska'

function App () {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Toaster position='bottom-right' reverseOrder={true} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contacts />} />
        {/* <Route path='/All' element={<All />} /> */}
        <Route path='/catalog/:category' element={<Catalog />} />
        <Route path='/Terms' element={<Terms />} />
        <Route path='/Privacy' element={<Privacy />} />
        <Route path='/Refund' element={<Refund />} />
        <Route path='/product/:category/:id' element={<ProductDetail />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/ComingSoon' element={<ComingSoon />} />
        <Route path='/product/paska/:id' element={<PaskaProductPage />} />
      </Routes>
      <Footer />
      <CookieBanner />
    </>
  )
}

export default App
