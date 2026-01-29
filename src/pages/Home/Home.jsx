import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faPhone
} from '@fortawesome/free-solid-svg-icons'

import { Product } from '../../components/Product/product'

import { Description } from '../../components/Description/Description'
import ContactSection from '../../components/ContactSection/ContactSection'
import { Ingredients } from '../../components/Ingredients/Ingredients'
import { Block } from '../Block/Block'
import { Footer } from '../../components/Footer/Footer'
// import { BuffetPage } from '../../components/Buffer/Buffer'

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
      {/* Первый блок с контентом - Hero секция */}
      <div>
        <Block />
      </div>
      {/* Параллакс-секция с продуктами */}
      <div>
        <Product />
      </div>
      {/* Секция с ингредиентами */}
      <div>
        <Ingredients />
      </div>

      {/* Секция с сортами хлеба */}
      <div>{/* <Description /> */}</div>

      {/* Секция с контактами */}
      <ContactSection />
      {/* <BuffetPage /> */}
    </div>
  )
}
