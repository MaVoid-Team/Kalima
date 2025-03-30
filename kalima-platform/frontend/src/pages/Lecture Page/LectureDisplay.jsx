"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllLectures } from "../../routes/lectures"

const LectureList = () => {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true)
        const result = await getAllLectures()
        setLectures(result.data.containers)
        setLoading(false)
      } catch (err) {
        setError("Failed to load lectures. Please try again later.")
        setLoading(false)
      }
    }

    fetchLectures()
  }, [])

  const handleLectureClick = (lectureId) => {
    navigate(`/lecture-details/${lectureId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">المحاضرات المتاحة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map((lecture) => (
          <div
            key={lecture._id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => handleLectureClick(lecture._id)}
          >
            <div className="card-body">
              <h2 className="card-title">{lecture.name}</h2>
              <div className="badge badge-primary">{lecture.subject.name}</div>
              <div className="badge badge-secondary">{lecture.level.name}</div>

              <p className="mt-2">{lecture.description}</p>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8">
                      <span>{lecture.createdBy.name.charAt(0)}</span>
                    </div>
                  </div>
                  <span className="text-sm">{lecture.createdBy.name}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold">{lecture.price}</span> جنيه
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div>
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {lecture.numberOfViews || 0}
                  </span>
                </div>
                <div>{lecture.kind}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LectureList;

