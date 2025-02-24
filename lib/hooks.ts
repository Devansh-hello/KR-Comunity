import { useState, useEffect } from 'react'

export function useGroups(search: string = '') {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups?search=${encodeURIComponent(search)}`)
        const data = await response.json()
        
        if (response.ok) {
          setGroups(data)
        } else {
          setError(data.error)
        }
      } catch (error) {
        setError('Failed to fetch groups')
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [search])

  return { groups, loading, error }
}

interface LostFoundItem {
  id: string
  title: string
  description: string
  type: 'LOST' | 'FOUND'
  location: string
  date: string
  image?: string
  author: {
    name: string
    image?: string
  }
}

export function useLostFound(search: string = '', type: string = 'all') {
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = new URLSearchParams({ search })
        if (type !== 'all') {
          params.append('type', type)
        }
        
        const response = await fetch(`/api/lost-found?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setItems(data)
        } else {
          setError(data.error)
        }
      } catch (error) {
        setError('Failed to fetch items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [search, type])

  return { items, loading, error }
} 