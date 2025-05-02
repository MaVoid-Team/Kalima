import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ActivityTracker from "./ActivityTracker";
import Reports from "./Reports";
import { getCenterDataByType } from "../../routes/center";

export default function LessonDetailsSection() {
  const { id } = useParams(); // Extract lesson ID from URL
  const { state } = useLocation(); // Access lesson data from navigation state
  const lesson = state?.lesson || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await getCenterDataByType(lesson.center?._id || "67e84251abdebb74dd28df2c", "students");
        if (response.status === "success") {
          setStudents(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch students");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lesson.center?._id) {
      fetchStudents();
    }
  }, [lesson.center?._id]);

  if (loading) return <div className="flex justify-center py-8"><div className="loading loading-spinner loading-md"></div></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold">Lesson Details</h2>
        {lesson._id && (
          <div className="mt-4">
            <p><strong>Subject:</strong> {lesson.subject?.name || 'N/A'}</p>
            <p><strong>Lecturer:</strong> {lesson.lecturer?.name || 'N/A'}</p>
            <p><strong>Level:</strong> {lesson.level?.name || 'N/A'}</p>
            <p><strong>Start Time:</strong> {new Date(lesson.startTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> {lesson.duration} minutes</p>
            <p><strong>Center:</strong> {lesson.center?.name || 'N/A'}</p>
          </div>
        )}
        {!lesson._id && <p className="text-red-500">No lesson data available.</p>}
      </div>
      <ActivityTracker lessonId={id} students={students} />
      <Reports selectedCenter={lesson.center || { _id: "67e84251abdebb74dd28df2c" }} lessonId={id} />
    </div>
  );
}