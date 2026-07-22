'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AttachmentUploader({
  lessonId,
  moduleId,
  courseId,
}: {
  lessonId?: string
  moduleId?: string
  courseId?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const router = useRouter()

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      if (lessonId) formData.append('lessonId', lessonId)
      if (moduleId) formData.append('moduleId', moduleId)
      if (courseId) formData.append('courseId', courseId)

      await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      })
    }

    setFiles([])
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <Button onClick={handleUpload} disabled={uploading || files.length === 0} size="sm">
          {uploading ? 'جارٍ الرفع...' : 'رفع'}
        </Button>
      </div>
      {files.length > 0 && (
        <div className="text-sm text-gray-600">
          {files.length} ملف(ات) جاهزة للرفع
        </div>
      )}
    </div>
  )
}