import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL // np. https://visit-auschwitz-lukaszs-projects-72608b75.vercel.app/

console.log('Fetching sitemap from CMS at:', `${CMS_URL}/sitemap.xml`)

async function main() {
  try {
    const res = await fetch(`${CMS_URL}/sitemap.xml`)
    if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`)
    const sitemap = await res.text()

    const publicDir = path.resolve('./public')
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
    console.log('✅ Sitemap saved to public/sitemap.xml')
  } catch (err) {
    console.error(err)
    const existing = path.resolve('./public/sitemap.xml')
    if (fs.existsSync(existing)) {
      console.log('⚠️  Using existing sitemap.xml')
    } else {
      console.log('⚠️  No existing sitemap.xml found, skipping')
    }
  }
}

main()
