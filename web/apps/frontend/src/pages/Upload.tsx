/*
 * JustPhotos
 * Copyright (C) 2025 JustPhotos contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the LICENSE file for more details.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('caption', caption)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('Photo uploaded!')
        setFile(null)
        setCaption('')
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Upload failed', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1>Upload Photo</h1>
      <Link to="/">Back to Feed</Link>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}

export default Upload