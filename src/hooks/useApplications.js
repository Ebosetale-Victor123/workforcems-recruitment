import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useApplications(jobId = null) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('applications')
      .select('*, jobs(title, department)')
      .order('created_at', { ascending: false })
    if (jobId) query = query.eq('job_id', jobId)
    const { data, error: err } = await query
    if (err) {
      setError(err.message)
    } else {
      setApplications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [jobId])

  const updateStage = async (id, stage) => {
    const { error: err } = await supabase
      .from('applications')
      .update({ stage })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetchApplications()
  }

  const updateBlindScore = async (id, blind_score, ai_summary) => {
    const { error: err } = await supabase
      .from('applications')
      .update({ blind_score, ai_summary })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetchApplications()
  }

  return { applications, loading, error, refetch: fetchApplications, updateStage, updateBlindScore }
}
