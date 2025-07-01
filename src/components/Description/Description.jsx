import React, { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import products from '../../data/products.json'
import { Link } from 'react-router-dom'

export function Description () {
  useEffect(() => {
    AOS.init({ duration: 1000 })
  }, [])

  const limitedProducts = [
    ...products.pickles,
    ...products.smoked,
    ...products.salads,
    ...products['semi-finished']
  ].slice(0, 9)

  return (
    <div className='relative'>
      <div
        className='min-h-[65rem] bg-cover bg-center bg-no-repeat bg-fixed relative py-20 overflow-hidden'
        style={{ backgroundImage: `url(${rekaImage})` }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-black/40 to-black/60'></div>
        <div className='absolute inset-0 bg-noise opacity-10'></div>

        <div className='relative z-10 container mx-auto px-4'>
          <div className='text-center mb-16'>
            <span
              className='text-amber-300 font-medium mb-4 block'
              data-aos='fade-down'
            >
              Асортимент
            </span>
            <h1
              className='text-4xl md:text-5xl font-bold text-white mb-6'
              data-aos='fade-down'
              data-aos-delay='100'
            >
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-white'>
                Наша продукція
              </span>
            </h1>
            <div
              className='w-20 h-1 bg-amber-400 mx-auto'
              data-aos='fade-down'
              data-aos-delay='200'
            ></div>
          </div>

          <div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            data-aos='fade-up'
            data-aos-delay='100'
          >
            {limitedProducts.map((item, index) => (
              <div
                key={item.id + item.name}
                className='bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group'
                data-aos='flip-up'
                data-aos-delay={200 + index * 100}
              >
                <div className='mb-6 h-1 bg-gradient-to-r from-amber-400 to-amber-600 w-16 transition-all duration-500 group-hover:w-24'></div>
                <h2 className='text-2xl font-bold mb-2 uppercase text-gray-800'>
                  {item.name}
                </h2>
                <p className='text-gray-600 mb-2'>{item.description}</p>
                <p className='text-gray-700 font-semibold mb-1'>
                  Ціна: {item.price}
                </p>
                <p className='text-gray-700 font-semibold mb-6'>
                  Вага: {item.weight}
                </p>
                <div className='flex items-center text-amber-600 font-medium'>
                  <Link
                    to={`/product/${item.id}`}
                    className='py-3 px-11 bg-orange-300 rounded-2xl text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'
                  >
                    Детальніше
                  </Link>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className='ml-2 transition-transform group-hover:translate-x-1'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
