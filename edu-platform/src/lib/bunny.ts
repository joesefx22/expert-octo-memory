import crypto from 'crypto'

interface WatermarkData {
  text: string
  color?: string
  font?: string
  fontSize?: number
  opacity?: number
}

export function generateBunnyToken(
  videoId: string,
  clientIp?: string,
  watermark?: WatermarkData
): string {
  const apiKey = process.env.BUNNY_STREAM_API_KEY!
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME!
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY!

  const expires = Math.floor(Date.now() / 1000) + 7200

  let hashable = `${tokenKey}${videoId}${expires}${clientIp || ''}`
  if (watermark) {
    // Bunny Stream يتوقع watermark كـ base64 من JSON
    const wmString = Buffer.from(JSON.stringify(watermark)).toString('base64')
    hashable += wmString
  }

  const token = crypto.createHash('sha256').update(hashable).digest('hex')

  let url = `https://${cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`
  if (watermark) {
    const wmParam = Buffer.from(JSON.stringify(watermark)).toString('base64')
    url += `&watermark=${encodeURIComponent(wmParam)}`
  }
  return url
}