import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

import { Product } from '../../components/Product/product'
import ContactSection from '../../components/ContactSection/ContactSection'
import { Ingredients } from '../../components/Ingredients/Ingredients'
import { Block } from '../Block/Block'
import { Footer } from '../../components/Footer/Footer'

// Импортируем пасхальные компоненты
import {
  EasterAnnouncementBar,
  EasterSection
} from '../../components/EasterAnnouncementBar/EasterAnnouncementBar'

// Импорт фото паски (у вас уже есть этот ассет)
import paskaImg from '../../assets/paska.jpg'

export function Home () {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      mirror: false
    })
  }, [])

  return (
    <div className='relative overflow-hidden'>
      <EasterAnnouncementBar />

      <div>
        <Block />
      </div>

      <EasterSection paskaImage={paskaImg} />

      {/* Каталог продуктов */}
      <div>
        <Product />
      </div>

      {/* Ингредиенты */}
      <div>
        <Ingredients />
      </div>

      {/* Контакты */}
      <ContactSection />
    </div>
  )
}
