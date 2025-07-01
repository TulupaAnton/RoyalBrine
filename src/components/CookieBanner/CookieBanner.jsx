import React, { useState, useEffect } from 'react'

export function CookieBanner () {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookieConsent')
    if (!accepted) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-amber-100/95 text-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.1)] backdrop-blur-sm border-t border-amber-300'>
      <p className='text-sm mb-2 md:mb-0 max-w-xl'>
        Ми використовуємо cookies для зберігання ваших налаштувань і обробки
        персональних даних для доставки. Продовжуючи користуватись сайтом, ви
        погоджуєтесь з цим.
      </p>
      <button
        onClick={handleAccept}
        className='mt-2 md:mt-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-shadow shadow-sm hover:shadow-md'
      >
        Добре, зрозуміло
      </button>
    </div>
  )
}
