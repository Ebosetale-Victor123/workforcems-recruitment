import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function cleanupRejectedCandidates() {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const cutoff = threeDaysAgo.toISOString()

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('stage', 'rejected')
    .lt('updated_at', cutoff)
  if (error) console.error(error)
}

export function useApplications(jobId = null) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('applications')
      .select('*')
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
    const init = async () => {
      try {
        await cleanupRejectedCandidates()
      } catch (e) {
        console.error(e)
      }
      await fetchApplications()
    }
    init()
  }, [jobId])

  const updateStage = async (id, stage) => {
    const { error: err } = await supabase
      .from('applications')
      .update({ stage, updated_at: new Date().toISOString() })
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

  const deleteApplication = async (id) => {
    setApplications(prev => prev.filter(a => a.id !== id))
    const { error: err } = await supabase.from('applications').delete().eq('id', id)
    if (err) console.error(err)
  }

  return { applications, loading, error, refetch: fetchApplications, updateStage, updateBlindScore, deleteApplication }
}
