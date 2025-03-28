"use client";

import { useState, useEffect } from "react";
import { FileText, Clock, ChevronLeft, Star, Loader } from 'lucide-react';
import { getAllUsers } from "../../routes/fetch-users";
import { useTranslation } from "react-i18next";


export function TeachersSection() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleTeachers, setVisibleTeachers] = useState(3);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        const lecturers = result.data
          .filter((user) => user.role === "Lecturer")
          .map((lecturer) => ({
            id: lecturer._id,
            image: "/course-1.png",
            name: lecturer.name,
            subject: lecturer.expertise || t('teachers.labels.expertise'),
            experience: lecturer.bio || t('teachers.labels.experience'),
            grade: t('teachers.labels.gradeLevels'),
            rating: 5,
          }));
        setTeachers(lecturers);
      } else {
        setError(t('teachers.errors.failed'));
      }
    } catch (err) {
      setError(t('teachers.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTeachers = () => {
    setVisibleTeachers(teachers.length);
  };

  return (
    <section className="md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`relative h-24 w-24 ${isRTL ? 'ml-auto' : 'mr-auto'} mt-4 animate-pulse lg:-translate-x-96 translate-y-1/2 sm:-translate-x-24 -translate-x-56`}>
        <img 
          src="curved-arrow-services.png" 
          alt="curved arrow" 
          className={isRTL ? '' : 'scale-x-[-1]'}
        />
      </div>
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2">
          {t('teachers.title')}
        </h2>
        <h3 className="text-center text-3xl font-bold mb-12">
          {t('teachers.heading')} 
            <span className="text-primary border-b-2 border-primary pb-1">
              {t('teachers.platform')}
            </span>
          
        </h3>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t('teachers.errors.loading')}</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchTeachers}>
              {t('teachers.errors.retry')}
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg">{t('teachers.errors.noneFound')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.slice(0, visibleTeachers).map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>

            {visibleTeachers < teachers.length && (
              <div className="flex justify-center mt-8">
                <button
                  className="btn btn-primary rounded-full"
                  onClick={loadMoreTeachers}
                >
                  {t('teachers.loadMore')}
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2 rotate-180'}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function TeacherCard({ teacher }) {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === 'ar';

  return (
    <div className="rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl shadow-lg duration-500">
      <div className="relative">
        <img
          src={teacher.image || "/placeholder.svg"}
          alt={teacher.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {teacher.subject}
        </div>
      </div>
      <div className="p-4">
        <h4 className={`font-bold text-lg mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {teacher.name}
        </h4>
        
        {/* Experience */}

        <div className={`flex  items-center gap-2 mb-2`}>              
            <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <Clock className="h-3 w-3" />
            </div>
            <span className="text-sm">{teacher.experience}</span>
            </div>

        {/* Grade Levels */}
        
          <div className={`flex  items-center gap-2 mb-4`}>
            <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
              <FileText className="h-3 w-3" />
              </div>
            <span className="text-sm">{teacher.grade}</span>
          </div>
       
        <div className="flex items-center justify-between">
          <div className="flex">
            {[...Array(teacher.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <button className="btn btn-sm btn-primary rounded-full">
            {t('teachers.viewProfile')}
          </button>
        </div>
      </div>
    </div>
  );
}