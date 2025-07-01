import React, { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'
import image from '../../assets/organika.png'

export function Ingredients () {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      mirror: false
    })
  }, [])
  return (
    <div className='max-w-7xl mx-auto px-4 py-20'>
      <div className='flex flex-col md:flex-row gap-12 items-center'>
        <div className='md:w-1/2' data-aos='fade-right'>
          <div className='max-w-md mx-auto'>
            <span
              className='text-amber-600 font-medium mb-2 block'
              data-aos='fade-right'
              data-aos-delay='100'
            >
              Traditional Methods
            </span>
            <h2
              className='text-4xl font-bold text-gray-800 mb-6 leading-tight'
              data-aos='fade-right'
              data-aos-delay='200'
            >
              Інгредієнти та метод
            </h2>
            <p
              className='text-gray-600 mb-8 text-2xl  leading-relaxed'
              data-aos='fade-right'
              data-aos-delay='300'
            >
              Усі наші страви виготовлені з натуральних інгредієнтів без штучних
              домішок. Ми використовуємо свіже м’ясо, домашні спеції, добірні
              овочі та традиційні рецепти. Жодної хімії — тільки чистий смак і
              якість, які ви можете відчути з першого шматочка.
            </p>
          </div>
        </div>

        <div
          className='md:w-1/2 relative'
          data-aos='fade-left'
          data-aos-delay='200'
        >
          <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
            <img
              src={image}
              alt='Хлеб и ингредиенты'
              className='w-full h-auto object-cover transition-transform duration-1000 hover:scale-105'
              style={{ minHeight: '500px' }}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
          </div>
          <div
            className='absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg'
            data-aos='zoom-in'
            data-aos-delay='600'
          >
            <div className='text-amber-600 font-bold'>100% Organic</div>
          </div>
        </div>
      </div>
    </div>
  )
}
