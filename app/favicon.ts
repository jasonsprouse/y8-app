import { MetadataRoute } from 'next'

export default function favicon() {
  return new URL('/favicon.ico', 'https://example.com')
}
