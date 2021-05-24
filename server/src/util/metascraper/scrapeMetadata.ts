import got from 'got'
import { LinkMetadata } from '@/entity'
import { uploadImageUrl } from '@/util/s3'
import isURL from 'validator/lib/isURL'
import sanitizeHtml from 'sanitize-html'
import UserAgent from 'user-agents'

const metascraperTwitterCard = () => ({
  twitterCard: [
    ({ htmlDom: $ }) => $('meta[name="twitter:card"]').attr('content'),
    ({ htmlDom: $ }) => $('meta[property="twitter:card"]').attr('content')
  ]
})

const metascraperThemeColor = () => ({
  themeColor: [
    ({ htmlDom: $ }) => $('meta[name="theme-color"]').attr('content')
  ]
})

const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-youtube')(),
  metascraperTwitterCard(),
  metascraperThemeColor()
])

const timeout = 5000

export const scrapeMetadata = async (
  targetUrl: string
): Promise<LinkMetadata> => {
  if (!isURL(targetUrl)) return null

  const userAgent = new UserAgent().toString()
  let res
  try {
    res = await got(targetUrl, {
      timeout,
      headers: {
        'user-agent': userAgent
      }
    })
  } catch (e) {
    return null
  }

  const { body: html, url } = res
  if (!isURL(url)) return null

  let meta
  try {
    meta = (await metascraper({ html, url })) as LinkMetadata
  } catch (e) {
    return null
  }

  if (!meta.title) return null

  // Strip HTML tags
  if (meta.description)
    meta.description = sanitizeHtml(meta.description, {
      allowedTags: [],
      allowedAttributes: {}
    })

  if (meta.date) meta.date = new Date(meta.date)

  const { image, logo } = meta

  if (image) {
    try {
      meta.image = await uploadImageUrl(image)
    } catch (e) {
      delete meta.image
    }
  }

  if (logo) {
    try {
      meta.logo = await uploadImageUrl(logo, { width: 256, height: 256 })
    } catch (e) {
      delete meta.logo
    }
  }

  return meta
}
