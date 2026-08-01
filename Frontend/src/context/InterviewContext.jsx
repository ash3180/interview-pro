import React, { createContext, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
  const [reports, setReports] = useState([])
  const [currentReport, setCurrentReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/interview/')
      setReports(res.data.interviewReports || [])
    } catch (err) {
      console.error('Fetch reports error:', err)
    }
  }

  const fetchReportById = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/interview/report/${id}`)
      setCurrentReport(res.data.interviewReport)
      return res.data.interviewReport
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch interview report.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const createReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('jobDescription', jobDescription)
      if (selfDescription) formData.append('selfDescription', selfDescription)
      if (resumeFile) formData.append('resume', resumeFile)

      const res = await api.post('/api/interview/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setCurrentReport(res.data.interviewReport)
      fetchReports()
      return res.data.interviewReport
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error generating interview plan.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const submitPracticeAnswer = async (interviewId, question, userAnswer) => {
    try {
      const res = await api.post(`/api/interview/report/${interviewId}/practice`, {
        question,
        userAnswer
      })
      if (res.data.report) {
        setCurrentReport(res.data.report)
      }
      return res.data.evaluation
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to evaluate practice answer.')
    }
  }

  return (
    <InterviewContext.Provider value={{
      reports,
      currentReport,
      loading,
      error,
      fetchReports,
      fetchReportById,
      createReport,
      submitPracticeAnswer
    }}>
      {children}
    </InterviewContext.Provider>
  )
}
