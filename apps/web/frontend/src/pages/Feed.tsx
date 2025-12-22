import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '@web/types'

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

  useEffect(() => {
    fetchSignedUrl()
  }, [])

  const fetchSignedUrl = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${photo.id}/signed-url`)
      if (response.ok) {
        const data = await response.json()
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('Failed to fetch signed URL', error)
    }
  }

  return (
    <div>
      {imageUrl ? <img src={imageUrl} alt={photo.caption || ''} style={{ width: '100%', height: 'auto' }} /> : <div>Loading image...</div>}
      <p>{photo.caption}</p>
    </div>
  )
}

export default Feed