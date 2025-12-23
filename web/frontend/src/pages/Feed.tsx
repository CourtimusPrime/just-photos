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
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '@/types/photo'

function Feed() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error('Failed to fetch photos', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Just Photos</h1>
      <Link to="/upload">Upload Photo</Link>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {photos.map(photo => (
          <PhotoItem key={photo.id} photo={photo} />
        ))}
      </div>
    </div>
  )
}

function PhotoItem({ photo }: { photo: Photo }) {
  const [imageUrl, setImageUrl] = useState<string>('')

  const fetchSignedUrl = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${photo.id}/signed-url`)
      if (response.ok) {
        const data = await response.json()
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('Failed to fetch signed URL', error)
    }
  }, [photo.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSignedUrl()
  }, [fetchSignedUrl])

  return (
    <div>
      {imageUrl ? <img src={imageUrl} alt={photo.caption || ''} style={{ width: '100%', height: 'auto' }} /> : <div>Loading image...</div>}
      <p>{photo.caption}</p>
    </div>
  )
}

export default Feed