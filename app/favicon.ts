import { MetadataRoute } from 'next'

export default function favicon(): MetadataRoute.Favicon {
  return new URL('/favicon.ico', 'https://example.com')
}
