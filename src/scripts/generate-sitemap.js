import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream } from 'fs'
import products from '../src/data/products.json' assert { type: 'json' }

const links = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/catalog/pickles' },
  { url: '/catalog/smoked' },
  { url: '/catalog/salads' },
  { url: '/catalog/semi-finished' }
]

// Динамические товары
Object.keys(products).forEach(category => {
  products[category].forEach(item => {
    links.push({ url: `/catalog/${category}/${item.id}` })
  })
})

const stream = new SitemapStream({ hostname: 'https://royal-brine.vercel.app' })

const writeStream = createWriteStream('./public/sitemap.xml')
streamToPromise(stream)
stream.pipe(writeStream)

links.forEach(link => stream.write(link))
stream.end()
