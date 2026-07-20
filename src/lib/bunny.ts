export function generateBunnyToken(videoId: string, clientIp?: string, watermark?: any) {
  return `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}?token=...`
}
