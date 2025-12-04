import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zfgqrgnapcpkmahtlohi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZ3FyZ25hcGNwa21haHRsb2hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc5ODI2NywiZXhwIjoyMDgwMzc0MjY3fQ.XiofurpQsj5bN5H7nOck4doCYyYCFMoBd2ryja3MtAY' // НЕ public а SERVICE KEY !!!
)

const json = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'))

async function importData () {
  for (const category in json) {
    for (const item of json[category]) {
      const { error } = await supabase.from('products').insert({
        category,
        name: item.name,
        description: item.description,
        price: item.price,
        weight: item.weight,
        images: item.images || [],
        compound: item.compound || '',
        bucket: item.bucket || false
      })

      if (error) {
        console.error('❌ ERROR:', error)
        return
      } else {
        console.log('✔ Added:', item.name)
      }
    }
  }
}

importData()
