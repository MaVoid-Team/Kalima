import React, { useState, useEffect, useMemo } from 'react';
import { FaBook, FaClock } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getUserDashboard } from '../../../routes/auth-services'; // adjust path if needed

const CoursesSection = () => {
  const { t, i18n } = useTranslation('assistantPage');
  const isRTL = i18n.language === 'ar';

  // State for dashboard data
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard on mount
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await getUserDashboard();
      if (res.success) {
        setDashboard(res.data.data.userInfo);
        setError(null);
      } else {
        setError(res.error || t('loadError'));
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [t]);

  // Map lectures to course cards
  const courses = useMemo(() => {
    if (!dashboard?.lectures) return [];
    return dashboard.lectures.map((lec) => ({
      id: lec.id,
      image: lec.subject.image || '/course-1.png',
      duration: lec.level.name,
      lectures: 1,
      title: lec.subject.name,
      price: '-',
      lecturer: {
        name: dashboard.assignedLecturer.name,
        image: dashboard.assignedLecturer.image || '/admin1.png',
      },
    }));
  }, [dashboard]);

  // Render loading, error, or content
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg text-info"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-error m-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="mb-12 relative">
      {/* Section Header */}
      <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h1 className="text-3xl font-bold px-10">{t('assistantPageTitle')}</h1>
      </div>

      {/* Search input */}
      <div className="mb-6 px-10">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="input input-bordered w-full pr-10"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10">
        {courses.map((course) => (
          <div
            key={course.id}
            className="card w-full bg-base-100 shadow-xl border border-yellow-500"
          >
            <figure>
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1 text-primary">
                  <FaBook />
                  <span>
                    {course.lectures} lecture{course.lectures > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-gray-500" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <h2 className={`card-title mt-2 ${isRTL ? 'text-right' : ''}`}>
                {course.title}
              </h2>

              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-lg">{course.price}</span>
                <div className="flex items-center gap-2">
                  <span>{course.lecturer.name}</span>
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={course.lecturer.image}
                        alt={course.lecturer.name}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesSection;
