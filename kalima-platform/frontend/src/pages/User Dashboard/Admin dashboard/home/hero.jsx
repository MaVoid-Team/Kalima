import React, { useState, useEffect } from 'react';
import { getAllLecturers, getAllAssistants, getAllParents, getAllStudents } from '../../../../routes/fetch-users';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t, i18n } = useTranslation('admin');
  const [lecturers, setLecturers] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch lecturers
        try {
          const lecturerResponse = await getAllLecturers();
          if (!lecturerResponse.success) throw new Error("Failed to fetch lecturers");
          setLecturers(lecturerResponse.data);
        } catch (err) {
          console.error("Lecturer fetch error:", err);
        }

        // Fetch assistants
        try {
          const assistantResponse = await getAllAssistants();
          if (!assistantResponse.success) throw new Error("Failed to fetch assistants");
          setAssistants(assistantResponse.data);
        } catch (err) {
          console.error("Assistant fetch error:", err);
        }

        // Fetch parents
        try {
          const parentResponse = await getAllParents();
          if (!parentResponse.success) throw new Error("Failed to fetch parents");
          setParents(parentResponse.data);
        } catch (err) {
          console.error("Parent fetch error:", err);
        }

        // Fetch students
        try {
          const studentResponse = await getAllStudents();
          if (!studentResponse.success) throw new Error("Failed to fetch students");
          setStudents(studentResponse.data);
        } catch (err) {
          console.error("Student fetch error:", err);
        }

      } catch (overallError) {
        console.error("Unexpected error in fetchData:", overallError);
        setError("Some data failed to load. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Empty dependency array means this runs once on mount

  return (
    <div className="mx-auto p-6 w-full font-[Cairo]">
      <h1 className={`text-3xl font-bold mb-8 ${isRTL ? 'text-right' : 'text-left'} `}>{t('admin.pageTitle')}</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir={dir}>
        {/* Students Card */}
        <div className="card bg-info/10 hover:bg-info/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl max-w-md border border-info/20">
          <div className="card-body p-6 flex-row justify-between items-center">
            <div className={`text-${isRTL ? "right" : "left"}`}>
              <h2 className="text-2xl font-bold text-info">{t('admin.students')}</h2>
              <p className="text-3xl font-bold text-info">
                {loading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  students.length
                )}
              </p>
            </div>
            <div className="avatar p-3 rounded-full">
              <img src="/admin2.png" alt="Students Icon" className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Teachers Card */}
        <div className="card bg-primary/10 hover:bg-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl max-w-md border border-primary/20">
          <div className="card-body p-6 flex-row justify-between items-center">
            <div className={`text-${isRTL ? "right" : "left"}`}>
              <h2 className="text-2xl font-bold text-primary">{t('admin.teachers')}</h2>
              <p className="text-3xl font-bold text-primary">
                {loading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  lecturers.length
                )}
              </p>
            </div>
            <div className="avatar p-3 rounded-full">
              <img src="/admin1.png" alt="Teachers Icon" className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Assistants Card */}
        <div className="card bg-secondary/10 hover:bg-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl max-w-md border border-secondary/20">
          <div className="card-body p-6 flex-row justify-between items-center">
            <div className={`text-${isRTL ? "right" : "left"}`}>
              <h2 className="text-2xl font-bold text-secondary">{t('admin.assistants')}</h2>
              <p className="text-3xl font-bold text-secondary">
                {loading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  assistants.length
                )}
              </p>
            </div>
            <div className="avatar p-3 rounded-full">
              <img src="/admin3.png" alt="Assistants Icon" className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Parents Card */}
        <div className="card bg-success/10 hover:bg-success/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl max-w-md border border-success/20">
          <div className="card-body p-6 flex-row justify-between items-center">
            <div className={`text-${isRTL ? "right" : "left"}`}>
              <h2 className="text-2xl font-bold text-success">{t('admin.parents')}</h2>
              <p className="text-3xl font-bold text-success">
                {loading ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  parents.length
                )}
              </p>
            </div>
            <div className="avatar p-3 rounded-full">
              <img src="/admin4.png" alt="Parents Icon" className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;