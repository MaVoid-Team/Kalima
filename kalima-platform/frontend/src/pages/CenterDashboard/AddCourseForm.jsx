import { useState, useEffect } from "react";
import { PlusCircle, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getToken } from "../../routes/auth-services";
const API_URL = process.env.REACT_APP_BASE_URL || ""; 
const AddCourseForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  
  const [formData, setFormData] = useState({
    subject: "",
    lecturer: "",
    level: "",
    startTime: "",
    duration: "",
    centerId: "67fefa5f0220055c34978a24",
  });

  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lecturersLoading, setLecturersLoading] = useState(true);
  const [lecturersError, setLecturersError] = useState("");
  
  // Fetch lecturers from API
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/center-lecturer/${formData.centerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        // Handle API response structure safely
        const fetchedLecturers = response?.data?.data?.lecturers || [];
        setLecturers(fetchedLecturers);
        
        if (fetchedLecturers.length === 0) {
          setLecturersError(t("error.no_lecturers"));
        }
      } catch (err) {
        setLecturersError(t("error.fetch_lecturers"));
        console.error("Lecturers fetch error:", err);
      } finally {
        setLecturersLoading(false);
      }
    };

    fetchLecturers();
  }, [formData.centerId, t]);


  // Level options with translation
  const levels = [
    { value: "Elementary", label: isRTL ? "الابتدائية" : "Elementary" },
    { value: "Preparatory", label: isRTL ? "الاعدادية" : "Preparatory" },
    { value: "Secondary", label: isRTL ? "الثانوية" : "Secondary" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Format date to YYYY-M-D
      const formattedDate = new Date(formData.startTime)
        .toLocaleDateString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric' })
        .replace(/\//g, '-');

      const response = await axios.post(
        `${API_URL}/api/v1/centers/lessons`,
        {
          ...formData,
          startTime: formattedDate,
          duration: parseInt(formData.duration)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.status === "success") {
        alert(t("course_added"));
        setFormData({
          subject: "",
          lecturer: "",
          level: "",
          startTime: "",
          duration: "",
          centerId: "67fb06731568ba23c353311c"
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || t("submit_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLevelSelect = (level) => {
    setFormData({
      ...formData,
      level: level
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-base-100 rounded-lg shadow-sm" dir={dir}>
      {/* Form Header */}
      <div className="p-4 rounded-t-lg">
        <button 
          type="submit" 
          className="btn btn-ghost gap-2" 
          disabled={loading || lecturersLoading}
        >
          {loading ? t("saving") : isRTL ? "إضافة كورس جديد" : "Add New Course"}
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Error Messages */}
      {error && <div className="px-4 text-error mb-4">{error}</div>}
      {lecturersError && <div className="px-4 text-error mb-4">{lecturersError}</div>}

      {/* Course Title Input */}
      <div className="p-4">
        <input
          name="subject"
          type="text"
          placeholder={isRTL ? "...اكتب عنوان الكورس هنا" : "Enter course title..."}
          className={`input input-bordered w-full bg-primary text-primary-content placeholder:text-primary-content/80 h-14 p-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

       {/* Lecturer Selection with safe mapping */}
       <div className="p-4">
        <h3 className={`${isRTL ? "text-right" : "text-left"} font-bold text-base-content mb-2`}>
          {isRTL ? "المحاضر" : "Lecturer"}
        </h3>
        <div className="relative">
          {lecturersLoading ? (
            <div className="skeleton h-12 w-full rounded-lg"></div>
          ) : lecturersError ? (
            <div className="text-error">{lecturersError}</div>
          ) : (
            <select
              name="lecturer"
              className={`select select-bordered w-full bg-base-200 text-base-content ${
                isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
              }`}
              value={formData.lecturer}
              onChange={handleChange}
              required
            >
              <option value="">{isRTL ? "اختر المحاضر" : "Select Lecturer"}</option>
              {(lecturers || []).map((lecturer) => ( // Safe array access
                <option key={lecturer?._id} value={lecturer?._id}>
                  {isRTL ? `أ/ ${lecturer?.name}` : lecturer?.name}
                </option>
              ))}
            </select>
          )}
          <ChevronDown
            className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70 ${
              isRTL ? "left-3" : "right-3"
            }`}
          />
        </div>
      </div>

      {/* Level Selection */}
      <div className="p-4">
        <h3 className="font-bold text-base-content mb-2">
          {isRTL ? "المستوى" : "Level"}
        </h3>
        <div className="flex flex-wrap gap-2 w-full">
          {levels.map((lvl) => ( // Now levels is defined
            <button
              key={lvl.value}
              type="button"
              className={`btn btn-outline btn-sm ${
                formData.level === lvl.value 
                  ? "border-primary bg-primary/10" 
                  : "border-base-300 bg-base-200"
              }`}
              onClick={() => handleLevelSelect(lvl.value)}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div className="p-4">
        <h3 className={`${isRTL ? "text-right" : "text-left"} font-bold text-base-content mb-2`}>
          {isRTL ? "تاريخ البدء" : "Start Date"}
        </h3>
        <input
          name="startTime"
          type="date"
          className="input input-bordered w-full bg-base-200"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
      </div>

      {/* Duration */}
      <div className="p-4">
        <h3 className={`${isRTL ? "text-right" : "text-left"} font-bold text-base-content mb-2`}>
          {isRTL ? "المدة (دقائق)" : "Duration (minutes)"}
        </h3>
        <input
          name="duration"
          type="number"
          min="30"
          className="input input-bordered w-full bg-base-200"
          value={formData.duration}
          onChange={handleChange}
          required
        />
      </div>

      {/* Hidden Center ID */}
      <input type="hidden" name="centerId" value={formData.centerId} />
    </form>
  );
};

export default AddCourseForm;