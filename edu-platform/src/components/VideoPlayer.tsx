'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@/styles/player.css' // تنسيقاتنا الفاخرة

export default function VideoPlayer({ lectureId }: { lectureId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/lectures/${lectureId}/token`)
      .then(res => res.json())
      .then(data => {
        if (data.url) setVideoUrl(data.url)
        else setError(data.reason || 'تعذر تحميل الفيديو')
      })
      .catch(() => setError('فشل الاتصال'))
  }, [lectureId])

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return

    // تهيئة المشغل بخيارات متقدمة
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      preload: 'auto',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{ src: videoUrl, type: 'application/x-mpegURL' }],
      html5: {
        vhs: {
          overrideNative: true,
          smoothQualityChange: true,
        },
      },
      // إعدادات واجهة المستخدم
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
    })

    playerRef.current = player

    // منع التحميل (تعطيل زر الفأرة الأيمن)
    const preventContextMenu = (e: Event) => e.preventDefault()
    player.on('loadedmetadata', () => {
      const el = player.el()
      el.addEventListener('contextmenu', preventContextMenu)
    })

    return () => {
      player.dispose()
    }
  }, [videoUrl])

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-red-400 h-64 rounded-xl p-4">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white h-64 rounded-xl p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="mr-2">جارٍ تحميل المشغل...</span>
      </div>
    )
  }

  return (
    <div className="video-wrapper rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-theme-fantasy"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  )
}
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
      player.el().addEventListener('contextmenu', (e) => e.preventDefault())
    })
    return () => player.dispose()
  }, [videoUrl])

  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!videoUrl) return <div className="text-white p-4">جارٍ التحميل...</div>

  return (
    <div className="video-wrapper rounded-2xl overflow-hidden shadow-2xl">
      <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-fantasy" playsInline />
    </div>
  )
}
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

    // منع النقر اليمين
    player.on('loadedmetadata', () => {
      player.el().addEventListener('contextmenu', e => e.preventDefault())
    })

    // استعادة آخر موضع (اختياري - يحتاج API)
    fetch(`/api/lessons/${lessonId}/progress`)
      .then(res => res.json())
      .then(data => {
        if (data.seconds > 0) {
          player.currentTime(data.seconds)
        }
      })

    // حفظ التقدم كل 10 ثوانٍ
    const interval = setInterval(() => {
      if (player && !player.paused()) {
        const currentTime = Math.floor(player.currentTime())
        fetch(`/api/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seconds: currentTime }),
        })
      }
    }, 10000)

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
3. تقليل ضغط Watch Progress (30 ثانية + أحداث)
تعديل src/components/VideoPlayer.tsx
tsx
// استبدال منطق حفظ التقدم القديم
useEffect(() => {
  if (!playerRef.current) return

  const player = playerRef.current
  let saveInterval: NodeJS.Timeout

  // حفظ كل 30 ثانية أثناء التشغيل
  const startSaving = () => {
    if (saveInterval) clearInterval(saveInterval)
    saveInterval = setInterval(() => {
      if (!player.paused()) {
        const currentTime = Math.floor(player.currentTime())
        fetch(`/api/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seconds: currentTime }),
        })
      }
    }, 30000)
  }

  player.on('play', startSaving)
  player.on('pause', () => {
    if (saveInterval) clearInterval(saveInterval)
    // حفظ فوري عند الإيقاف المؤقت
    const currentTime = Math.floor(player.currentTime())
    fetch(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds: currentTime }),
    })
  })
  player.on('ended', () => {
    if (saveInterval) clearInterval(saveInterval)
    // حفظ عند انتهاء الفيديو
    fetch(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds: Math.floor(player.duration()) }),
    })
  })

  // حفظ عند مغادرة الصفحة
  const handleBeforeUnload = () => {
    const currentTime = Math.floor(player.currentTime())
    navigator.sendBeacon(
      `/api/lessons/${lessonId}/progress`,
      JSON.stringify({ seconds: currentTime })
    )
  }
  window.addEventListener('beforeunload', handleBeforeUnload)

  // ... استعادة آخر موضع (كما سبق)

  return () => {
    if (saveInterval) clearInterval(saveInterval)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    player.dispose()
  }
}, [videoUrl])
ملاحظة: استخدمنا navigator.sendBeacon لضمان حفظ التقدم حتى عند إغلاق التبويب فجأة.

