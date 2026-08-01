import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const createJob = async (jobData) => {
    const { data, error: err } = await supabase
      .from('jobs')
      .insert([{ ...jobData, status: 'open' }])
      .select()
    if (err) throw new Error(err.message)
    await fetchJobs()
    return data
  }

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    const { error: err } = await supabase.from('jobs').delete().eq('id', id)
    if (err) console.error(err)
  }

  const updateJob = async (id, updates) => {
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
    if (!error) {
      setJobs(prev => prev.map(j =>
        j.id === id ? { ...j, ...updates } : j
      ))
    }
    return { error }
  }

  return { jobs, loading, error, refetch: fetchJobs, createJob, deleteJob, updateJob }
}
