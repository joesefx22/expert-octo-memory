'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@/styles/player.css'

export default function VideoPlayer({ lessonId }: { lessonId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/token`)
      .then(res => res.json())
      .then(data => {
        if (data.url) setVideoUrl(data.url)
        else setError(data.reason || 'تعذر التحميل')
      })
      .catch(() => setError('فشل الاتصال'))
  }, [lessonId])

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      preload: 'auto',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{ src: videoUrl, type: 'application/x-mpegURL' }],
      html5: { vhs: { overrideNative: true } },
      controlBar: {
        children: [
          'playToggle', 'volumePanel', 'currentTimeDisplay', 'timeDivider',
          'durationDisplay', 'progressControl', 'playbackRateMenuButton', 'fullscreenToggle',
        ],
      },
    })
    playerRef.current = player
    player.on('loadedmetadata', () => {
      player.el().addEventListener('contextmenu', e => e.preventDefault())
    })

    // استعادة آخر موضع
    fetch(`/api/lessons/${lessonId}/progress`)
      .then(res => res.json())
      .then(data => {
        if (data.seconds > 0) {
          player.currentTime(data.seconds)
        }
      })

    // حفظ التقدم كل 30 ثانية
    const interval = setInterval(() => {
      if (player && !player.paused()) {
        const currentTime = Math.floor(player.currentTime())
        fetch(`/api/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seconds: currentTime }),
        })
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      player.dispose()
    }
  }, [videoUrl])

  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!videoUrl) return <div className="text-white p-4">جارٍ التحميل...</div>

  return (
    <div className="video-wrapper rounded-2xl overflow-hidden shadow-2xl">
      <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-fantasy" playsInline />
    </div>
  )
}