import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Image, Video, ChevronDown, Plus, PlusCircle, Edit, Trash2, Edit2, ChevronRight, FolderPlus, FileText } from 'lucide-react';
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createContainer, createLecture } from "../../routes/lectures";
import { getAllSubjects } from "../../routes/courses";
import { getAllLevels } from "../../routes/levels";
import { getUserDashboard } from "../../routes/auth-services";

function CourseCreationForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Form state
  const [formData, setFormData] = useState({
    courseName: "",
    teacherName: "",
    gradeLevel: "",
    subject: "",
    duration: "",
    description: "",
    goal: "",
    courseType: "paid",
    priceFull: "",
    priceMonthly: "",
    priceSession: "",
    accessType: "both",
    privacy: "student",
  });

  // Data fetching states
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([
    {
      _id: "67d35903e4a0bacdc2ece37b",
      name: "Primary",
      createdAt: "2025-03-13T22:15:31.863Z",
      updatedAt: "2025-03-13T22:15:31.863Z",
      __v: 0,
    },
    {
      _id: "67d3593ce4a0bacdc2ece37d",
      name: "Middle",
      createdAt: "2025-03-13T22:16:28.110Z",
      updatedAt: "2025-03-13T22:16:28.110Z",
      __v: 0,
    },
    {
      _id: "67d35943e4a0bacdc2ece37f",
      name: "Upper Primary",
      createdAt: "2025-03-13T22:16:35.763Z",
      updatedAt: "2025-03-13T22:16:35.763Z",
      __v: 0,
    },
    {
      _id: "67d3594de4a0bacdc2ece381",
      name: "Higher Secondary",
      createdAt: "2025-03-13T22:16:45.695Z",
      updatedAt: "2025-03-13T22:16:45.695Z",
      __v: 0,
    },
    {
      _id: "67fe54c5f5fdde2732b443cf",
      name: "Higher Secondary",
      createdAt: "2025-04-15T12:44:53.246Z",
      updatedAt: "2025-04-15T12:44:53.246Z",
      __v: 0,
    },
    {
      _id: "67fe6b488c398e57870e8e35",
      name: "Fourth Elementary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e37",
      name: "Second Primary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e38",
      name: "Third Primary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e3a",
      name: "Second Secondary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e39",
      name: "First Secondary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e36",
      name: "First Primary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
    {
      _id: "67fe6b488c398e57870e8e3b",
      name: "Third Secondary",
      createdAt: "2025-04-15T14:20:56.231Z",
      updatedAt: "2025-04-15T14:20:56.231Z",
    },
  ]);
  const [teachers, setTeachers] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // File upload state
  const [courseImage, setCourseImage] = useState(null);
  const [courseVideo, setCourseVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Container hierarchy state
  const [courseContainer, setCourseContainer] = useState(null);
  
  // Course structure state - this represents the unified course structure
  const [courseStructure, setCourseStructure] = useState({
    parent: null,
    years: [],
    terms: [],
    months: [],
    lectures: []
  });
  
  // New container/lecture form state
  const [newYearName, setNewYearName] = useState("");
  const [newTermName, setNewTermName] = useState("");
  const [newMonthName, setNewMonthName] = useState("");
  const [newLectureName, setNewLectureName] = useState("");
  const [newLectureLink, setNewLectureLink] = useState("");
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  
  // UI state
  const [expandedItems, setExpandedItems] = useState({});

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const subjectsResponse = await getAllSubjects();
        setSubjects(subjectsResponse.data.subjects || []);
        const dashboardResponse = await getUserDashboard();
        const userData = dashboardResponse.data;
        const userId = userData?.data?.userInfo?.id;
        setCreatedBy(userId);
        if (userData && userData?.userInfo) {
          setTeachers([{ _id: userId, name: userData.data.userInfo.name }]);
          setFormData((prev) => ({
            ...prev,
            teacherName: userData.userInfo.name,
            teacher: userId,
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? (checked ? value : prev[name]) : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024 * 1024) {
      setCourseImage(file);
    } else {
      alert(isRTL ? "حجم الملف يجب أن يكون أقل من 1 جيجابايت" : "File size must be less than 1GB");
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024 * 1024) {
      setCourseVideo(file);
    } else {
      alert(isRTL ? "حجم الملف يجب أن يكون أقل من 1 جيجابايت" : "File size must be less than 1GB");
    }
  };

  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${type}_${id}`]: !prev[`${type}_${id}`]
    }));
  };

  // Create parent container
  const handleCreateParentContainer = async (e) => {
    e.preventDefault();
    if (!formData.courseName || !formData.gradeLevel || !formData.subject) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create Parent Container (Course)
      const parentContainerData = {
        name: formData.courseName,
        type: "course",
        createdBy: createdBy,
        level: formData.gradeLevel,
        subject: formData.subject,
        description: formData.description,
        goal: formData.goal,
        price: formData.courseType === "paid" ? Number(formData.priceFull) || 0 : 0,
        teacher: formData.teacher,
        teacherAllowed: formData.privacy === "teacher",
      };
      
      const response = await createContainer(parentContainerData);
      const container = response.data.container;
      
      setCourseContainer({
        id: container.id,
        name: container.name,
        type: container.type,
        level: container.level,
        subject: container.subject
      });
      
      setCourseStructure(prev => ({
        ...prev,
        parent: {
          id: container.id,
          name: container.name,
          type: container.type
        }
      }));
      
      alert(isRTL ? "تم إنشاء الحاوية الرئيسية بنجاح" : "Parent container created successfully");
    } catch (error) {
      console.error("Error creating parent container:", error);
      alert(isRTL ? "حدث خطأ أثناء إنشاء الحاوية الرئيسية" : "Error creating parent container");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create year container
  const handleCreateYearContainer = async (e) => {
    e.preventDefault();
    
    if (!courseStructure.parent) {
      alert(isRTL ? "يجب إنشاء الحاوية الرئيسية أولاً" : "Parent container must be created first");
      return;
    }
    
    if (!newYearName) {
      alert(isRTL ? "يرجى إدخال اسم السنة" : "Please enter a year name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const yearContainerData = {
        name: newYearName,
        type: "year",
        createdBy: createdBy,
        parent: courseStructure.parent.id, // Link to parent container
        level: formData.gradeLevel,
        subject: formData.subject,
        price: formData.courseType === "paid" ? Number(formData.priceFull) || 0 : 0,
        teacherAllowed: formData.privacy === "teacher",
      };
      
      const response = await createContainer(yearContainerData);
      const container = response.data.container;
      
      const newYear = {
        id: container.id,
        name: container.name,
        parent: container.parent,
        type: container.type
      };
      
      setCourseStructure(prev => ({
        ...prev,
        years: [...prev.years, newYear]
      }));
      
      setSelectedYearId(container.id);
      setNewYearName("");
      alert(isRTL ? "تم إنشاء حاوية السنة بنجاح" : "Year container created successfully");
    } catch (error) {
      console.error("Error creating year container:", error);
      alert(isRTL ? "حدث خطأ أثناء إنشاء حاوية السنة" : "Error creating year container");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create term container
  const handleCreateTermContainer = async (e) => {
    e.preventDefault();
    
    if (!selectedYearId) {
      alert(isRTL ? "يرجى تحديد السنة أولاً" : "Please select a year first");
      return;
    }
    
    if (!newTermName) {
      alert(isRTL ? "يرجى إدخال اسم الفصل الدراسي" : "Please enter a term name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const termContainerData = {
        name: newTermName,
        type: "term",
        createdBy: createdBy,
        parent: selectedYearId, // Link to selected year container
        level: formData.gradeLevel,
        subject: formData.subject,
        price: formData.courseType === "paid" ? Number(formData.priceMonthly) || 0 : 0,
        teacherAllowed: formData.privacy === "teacher",
      };
      
      const response = await createContainer(termContainerData);
      const container = response.data.container;
      
      const newTerm = {
        id: container.id,
        name: container.name,
        parent: container.parent,
        type: container.type
      };
      
      setCourseStructure(prev => ({
        ...prev,
        terms: [...prev.terms, newTerm]
      }));
      
      setSelectedTermId(container.id);
      setNewTermName("");
      alert(isRTL ? "تم إنشاء حاوية الفصل الدراسي بنجاح" : "Term container created successfully");
    } catch (error) {
      console.error("Error creating term container:", error);
      alert(isRTL ? "حدث خطأ أثناء إنشاء حاوية الفصل الدراسي" : "Error creating term container");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create month container
  const handleCreateMonthContainer = async (e) => {
    e.preventDefault();
    
    if (!selectedTermId) {
      alert(isRTL ? "يرجى تحديد الفصل الدراسي أولاً" : "Please select a term first");
      return;
    }
    
    if (!newMonthName) {
      alert(isRTL ? "يرجى إدخال اسم الشهر" : "Please enter a month name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const monthContainerData = {
        name: newMonthName,
        type: "month",
        createdBy: createdBy,
        parent: selectedTermId, // Link to selected term container
        level: formData.gradeLevel,
        subject: formData.subject,
        price: formData.courseType === "paid" ? Number(formData.priceSession) || 0 : 0,
        teacherAllowed: formData.privacy === "teacher",
      };
      
      const response = await createContainer(monthContainerData);
      const container = response.data.container;
      
      const newMonth = {
        id: container.id,
        name: container.name,
        parent: container.parent,
        type: container.type
      };
      
      setCourseStructure(prev => ({
        ...prev,
        months: [...prev.months, newMonth]
      }));
      
      setSelectedMonthId(container.id);
      setNewMonthName("");
      alert(isRTL ? "تم إنشاء حاوية الشهر بنجاح" : "Month container created successfully");
    } catch (error) {
      console.error("Error creating month container:", error);
      alert(isRTL ? "حدث خطأ أثناء إنشاء حاوية الشهر" : "Error creating month container");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create lecture
  const handleCreateLecture = async (e) => {
    e.preventDefault();
    
    if (!selectedMonthId) {
      alert(isRTL ? "يرجى تحديد الشهر أولاً" : "Please select a month first");
      return;
    }
    
    if (!newLectureName || !newLectureLink) {
      alert(isRTL ? "يرجى إدخال اسم المحاضرة ورابط الفيديو" : "Please enter lecture name and video link");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const lectureData = {
        name: newLectureName,
        type: "lecture",
        lecture_type: "Revision",
        createdBy: createdBy,
        level: formData.gradeLevel,
        teacherAllowed: formData.privacy === "teacher",
        subject: formData.subject,
        parent: selectedMonthId, // Link to selected month container
        price: formData.courseType === "paid" ? Number(formData.priceSession) || 0 : 0,
        description: `Lecture for ${newLectureName}`,
        numberOfViews: 0,
        videoLink: newLectureLink,
        examLink: "",
      };
      
      const response = await createLecture(lectureData);
      const lecture = response.data.lecture;
      
      const newLecture = {
        id: lecture.id,
        name: lecture.name,
        parent: lecture.parent,
        type: lecture.type,
        videoLink: lecture.videoLink
      };
      
      setCourseStructure(prev => ({
        ...prev,
        lectures: [...prev.lectures, newLecture]
      }));
      
      setNewLectureName("");
      setNewLectureLink("");
      alert(isRTL ? "تم إنشاء المحاضرة بنجاح" : "Lecture created successfully");
    } catch (error) {
      console.error("Error creating lecture:", error);
      alert(isRTL ? "حدث خطأ أثناء إنشاء المحاضرة" : "Error creating lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get container by ID
  const getContainerById = (id) => {
    if (courseStructure.parent && courseStructure.parent.id === id) {
      return courseStructure.parent;
    }
    
    const year = courseStructure.years.find(y => y.id === id);
    if (year) return year;
    
    const term = courseStructure.terms.find(t => t.id === id);
    if (term) return term;
    
    const month = courseStructure.months.find(m => m.id === id);
    if (month) return month;
    
    return null;
  };

  // Helper function to get container name
  const getContainerName = (id) => {
    const container = getContainerById(id);
    return container ? container.name : "";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
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
    );
  }

  return (
    <div
      className="min-h-screen bg-base-100 text-base-content py-8 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8 relative"
        >
          <a
            href="#"
            className="flex items-center text-primary hover:text-primary-600 text-sm"
          >
            {isRTL ? (
              <>
                <ChevronRight className="h-4 w-4 mr-1" />
                <span>{t("الخروج")}</span>
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 ml-1" />
                <span>{t("back")}</span>
              </>
            )}
          </a>
          <div className="absolute inset-x-0 flex justify-center">
            <div className="flex items-center">
              <div className="w-16 h-px bg-secondary"></div>
              <h1 className="mx-4 text-2xl font-bold text-primary">
                {isRTL ? "انشئ كورس" : "Create Course"}
              </h1>
              <div className="w-16 h-px bg-secondary"></div>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <form onSubmit={handleCreateParentContainer}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-base-100 rounded-xl shadow-md p-6"
          >
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-6 text-primary">
                {isRTL ? "البيانات الاساسية" : "Basic Information"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "اسم الكورس" : "Course Name"}
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleChange}
                      placeholder={
                        isRTL
                          ? "مثل: دوره تقديم اللغة الإنجليزية"
                          : "e.g., English Language Course"
                      }
                      className="w-full input input-bordered bg-base-200 placeholder-base-content/50"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "المرحلة الدراسية" : "Grade Level"}
                    </label>
                    <select
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleChange}
                      className="w-full select select-bordered bg-base-200 appearance-none"
                      required
                    >
                      <option value="" disabled>
                        {isRTL ? "اختر المرحلة" : "Select Level"}
                      </option>
                      {levels.map((level) => (
                        <option key={level._id} value={level._id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={`h-4 w-4 absolute top-10 ${isRTL ? "left-3" : "right-3"} pointer-events-none`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "المادة الدراسية" : "Subject"}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full select select-bordered bg-base-200 appearance-none"
                      required
                    >
                      <option value="" disabled>
                        {isRTL ? "اختر المادة" : "Select Subject"}
                      </option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={`h-4 w-4 absolute top-10 ${isRTL ? "left-3" : "right-3"} pointer-events-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "مدة الكورس" : "Course Duration"}
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder={
                        isRTL
                          ? "مثل: عدد الأسبوع أو الساعات"
                          : "e.g., Number of weeks or hours"
                      }
                      className="w-full input input-bordered bg-base-200 placeholder-base-content/50"
                    />
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "وصف الكورس" : "Course Description"}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={
                        isRTL
                          ? "مثل: تهدف صف الدورة إلى تحسين مهارات المتعلمين في اللغة الإنجليزية من حيث القراءة والمحادثة..."
                          : "e.g., The course aims to improve learners' English language skills in reading and speaking..."
                      }
                      rows="4"
                      className="w-full textarea textarea-bordered bg-base-200 placeholder-base-content/50"
                    ></textarea>
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "هدف الكورس" : "Course Goal"}
                    </label>
                    <textarea
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      placeholder={
                        isRTL
                          ? "مثل: تحسين مهارات القراءة والكتابة والمحادثة..."
                          : "e.g., Improve reading, writing and speaking skills..."
                      }
                      rows="4"
                      className="w-full textarea textarea-bordered bg-base-200 placeholder-base-content/50"
                    ></textarea>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="block text-lg text-primary font-medium mb-2">
                      {isRTL ? "صورة الكورس" : "Course Image"}
                    </h2>
                    <label className="border-2 border-dashed border-primary/20 rounded-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer">
                      <Image className="w-10 h-10 mb-2 text-primary" />
                      <span className="btn text-primary btn-sm btn-ghost border border-primary border-2 mb-2">
                        {isRTL ? "اضف صورة" : "Add Image"}
                      </span>
                      <p className="text-xs text-base-content/50">
                        {isRTL ? "المساحة القصوى 1 Gb" : "Max size 1 Gb"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {courseImage && (
                      <p className="text-sm mt-2 text-center">
                        {isRTL ? "تم اختيار: " : "Selected: "} {courseImage.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <h2 className="block text-lg text-primary font-medium mb-2">
                      {isRTL ? "فيديو مقدمة الكورس" : "Course Introduction Video"}
                    </h2>
                    <label className="border-2 border-dashed border-primary/20 rounded-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer">
                      <Video className="w-10 h-10 mb-2 text-primary" />
                      <span className="btn text-primary btn-sm btn-ghost border border-primary border-2 mb-2">
                        {isRTL ? "اضف فيديو" : "Add Video"}
                      </span>
                      <p className="text-xs text-base-content/50">
                        {isRTL ? "المساحة القصوى 1 Gb" : "Max size 1 Gb"}
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                    {courseVideo && (
                      <p className="text-sm mt-2 text-center">
                        {isRTL ? "تم اختيار: " : "Selected: "} {courseVideo.name}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="block text-lg text-primary font-medium mb-2">
                        {isRTL ? "نوع الكورس" : "Course Type"}
                      </h2>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="courseType"
                            value="paid"
                            checked={formData.courseType === "paid"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>{isRTL ? "مدفوع" : "Paid"}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="courseType"
                            value="free"
                            checked={formData.courseType === "free"}
                            onChange={handleChange}
                            className="radio radio-primary"
                          />
                          <span>{isRTL ? "مجاني" : "Free"}</span>
                        </label>
                      </div>
                      {formData.courseType === "paid" && (
                        <div className="mt-6 space-y-4 mb-6">
                          <h2 className="block text-lg text-primary font-medium">
                            {isRTL ? "سعر الكورس" : "Course Price"}
                          </h2>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              {isRTL ? "الكورس كامل" : "Full Course"}
                            </label>
                            <input
                              type="text"
                              name="priceFull"
                              value={formData.priceFull}
                              onChange={handleChange}
                              placeholder={isRTL ? "الكورس كامل" : "Full Course"}
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              {isRTL ? "سعر الشهر" : "Monthly Price"}
                            </label>
                            <input
                              type="text"
                              name="priceMonthly"
                              value={formData.priceMonthly}
                              onChange={handleChange}
                              placeholder={isRTL ? "سعر الشهر" : "Monthly Price"}
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              {isRTL ? "سعر الحصة" : "Session Price"}
                            </label>
                            <input
                              type="text"
                              name="priceSession"
                              value={formData.priceSession}
                              onChange={handleChange}
                              placeholder={isRTL ? "سعر الحصة" : "Session Price"}
                              className="input input-bordered bg-base-200 flex-1"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mb-6">
                        <h2 className="block text-primary text-lg font-medium mb-2">
                          {isRTL ? "صلاحية الوصول" : "Access Validity"}
                        </h2>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="accessType"
                              value="both"
                              checked={formData.accessType === "both"}
                              onChange={handleChange}
                              className="radio radio-primary"
                            />
                            <span>{isRTL ? "التطبيق و المنصة" : "App and Platform"}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="accessType"
                              value="app"
                              checked={formData.accessType === "app"}
                              onChange={handleChange}
                              className="radio radio-primary"
                            />
                            <span>{isRTL ? "التطبيق" : "App"}</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <h2 className="block text-primary text-lg font-medium mb-3">
                          {isRTL ? "خصوصية الكورس" : "Course Privacy"}
                        </h2>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="privacy"
                              value="student"
                              checked={formData.privacy === "student"}
                              onChange={handleChange}
                              className="radio radio-primary"
                            />
                            <span>{isRTL ? "طالب / ولی امر" : "Student / Guardian"}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="privacy"
                              value="teacher"
                              checked={formData.privacy === "teacher"}
                              onChange={handleChange}
                              className="radio radio-primary"
                            />
                            <span>{isRTL ? "المعلم" : "Teacher"}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="btn btn-primary px-8 py-3 text-lg"
                disabled={isSubmitting || courseStructure.parent}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : courseStructure.parent ? (
                  isRTL ? "تم إنشاء الحاوية الرئيسية" : "Parent Container Created"
                ) : (
                  isRTL ? "إنشاء الحاوية الرئيسية" : "Create Parent Container"
                )}
              </button>
            </div>
          </motion.div>
        </form>

        {/* Container Hierarchy Section */}
        {courseStructure.parent && (
          <div className="mt-12">
            <div className="bg-base-100 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-6 text-primary text-center">
                {isRTL ? "هيكل المحتوى التعليمي" : "Educational Content Structure"}
              </h2>
              
              {/* Parent Container Info */}
              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium">
                    {isRTL ? "الحاوية الرئيسية" : "Parent Container"}
                  </h3>
                  <span className="badge badge-primary">{courseStructure.parent.name}</span>
                </div>
                <p className="text-sm mt-2">
                  {isRTL ? "معرف الحاوية: " : "Container ID: "}
                  <code className="text-xs bg-base-300 p-1 rounded">{courseStructure.parent.id}</code>
                </p>
              </div>
              
              {/* Course Structure Visualization */}
              <div className="mb-6 bg-base-200 p-4 rounded-lg">
                <h3 className="text-base font-medium mb-3 text-primary">
                  {isRTL ? "هيكل الكورس" : "Course Structure"}
                </h3>
                <div className="pl-4 border-l-2 border-primary">
                  <div className="mb-2">
                    <span className="font-medium">{courseStructure.parent.name}</span> 
                    <span className="text-xs text-base-content/70"> ({isRTL ? "الحاوية الرئيسية" : "Parent Container"})</span>
                  </div>
                  
                  {courseStructure.years.length > 0 && (
                    <div className="pl-4 border-l-2 border-secondary">
                      {courseStructure.years.map(year => (
                        <div key={year.id} className="mb-2">
                          <div className="mb-1">
                            <span className="font-medium">{year.name}</span>
                            <span className="text-xs text-base-content/70"> ({isRTL ? "حاوية السنة" : "Year Container"})</span>
                          </div>
                          
                          {courseStructure.terms.filter(term => term.parent === year.id).length > 0 && (
                            <div className="pl-4 border-l-2 border-accent">
                              {courseStructure.terms
                                .filter(term => term.parent === year.id)
                                .map(term => (
                                  <div key={term.id} className="mb-2">
                                    <div className="mb-1">
                                      <span className="font-medium">{term.name}</span>
                                      <span className="text-xs text-base-content/70"> ({isRTL ? "حاوية الفصل الدراسي" : "Term Container"})</span>
                                    </div>
                                    
                                    {courseStructure.months.filter(month => month.parent === term.id).length > 0 && (
                                      <div className="pl-4 border-l-2 border-info">
                                        {courseStructure.months
                                          .filter(month => month.parent === term.id)
                                          .map(month => (
                                            <div key={month.id} className="mb-2">
                                              <div className="mb-1">
                                                <span className="font-medium">{month.name}</span>
                                                <span className="text-xs text-base-content/70"> ({isRTL ? "حاوية الشهر" : "Month Container"})</span>
                                              </div>
                                              
                                              {courseStructure.lectures.filter(lecture => lecture.parent === month.id).length > 0 && (
                                                <div className="pl-4 border-l-2 border-success">
                                                  {courseStructure.lectures
                                                    .filter(lecture => lecture.parent === month.id)
                                                    .map(lecture => (
                                                      <div key={lecture.id} className="mb-1">
                                                        <FileText className="w-3 h-3 inline-block mr-1 text-primary" />
                                                        <span>{lecture.name}</span>
                                                      </div>
                                                    ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Year Container Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-primary">
                    {isRTL ? "إضافة حاوية السنة" : "Add Year Container"}
                  </h3>
                  <span className="badge badge-outline">
                    {courseStructure.years.length} {isRTL ? "حاوية" : "containers"}
                  </span>
                </div>
                
                {/* Add Year Form */}
                <form onSubmit={handleCreateYearContainer} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      placeholder={isRTL ? "اسم السنة الجديدة" : "New year name"}
                      className="input input-bordered flex-1"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4 mr-1" />
                          {isRTL ? "إضافة" : "Add"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
                
                {/* Year Containers List */}
                {courseStructure.years.length > 0 && (
                  <div className="space-y-2">
                    {courseStructure.years.map((year) => (
                      <div key={year.id} className="bg-base-200 p-3 rounded-lg">
                        <div 
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleExpand('year', year.id)}
                        >
                          <div className="flex items-center">
                            <ChevronDown 
                              className={`w-4 h-4 mr-2 transition-transform ${expandedItems[`year_${year.id}`] ? 'rotate-180' : ''}`} 
                            />
                            <span>{year.name}</span>
                          </div>
                          <button 
                            className="btn btn-xs btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedYearId(year.id);
                            }}
                          >
                            {selectedYearId === year.id ? (
                              <span className="text-primary text-xs">✓ {isRTL ? "محدد" : "Selected"}</span>
                            ) : (
                              <span className="text-xs">{isRTL ? "تحديد" : "Select"}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Term Container Form */}
              <div className="mb-8">
                <h3 className="text-base font-medium text-primary mb-4">
                  {isRTL ? "إضافة فصل دراسي" : "Add Term Container"}
                </h3>
                
                <form onSubmit={handleCreateTermContainer}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={newTermName}
                        onChange={(e) => setNewTermName(e.target.value)}
                        placeholder={isRTL ? "اسم الفصل الدراسي" : "Term name"}
                        className="input input-bordered w-full"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !selectedYearId}
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4 mr-1" />
                          {isRTL ? "إضافة فصل دراسي" : "Add Term"}
                        </>
                      )}
                    </button>
                  </div>
                  {!selectedYearId && (
                    <p className="text-xs text-warning mt-2">
                      {isRTL ? "يرجى تحديد سنة أولاً" : "Please select a year first"}
                    </p>
                  )}
                </form>
                
                {/* Term Containers List */}
                {selectedYearId && courseStructure.terms.filter(term => term.parent === selectedYearId).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? "الفصول الدراسية في السنة المحددة" : "Terms in Selected Year"}
                    </h4>
                    {courseStructure.terms
                      .filter(term => term.parent === selectedYearId)
                      .map(term => (
                        <div key={term.id} className="bg-base-200 p-3 rounded-lg">
                          <div 
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleExpand('term', term.id)}
                          >
                            <div className="flex items-center">
                              <ChevronDown 
                                className={`w-4 h-4 mr-2 transition-transform ${expandedItems[`term_${term.id}`] ? 'rotate-180' : ''}`} 
                              />
                              <span>{term.name}</span>
                            </div>
                            <button 
                              className="btn btn-xs btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTermId(term.id);
                              }}
                            >
                              {selectedTermId === term.id ? (
                                <span className="text-primary text-xs">✓ {isRTL ? "محدد" : "Selected"}</span>
                              ) : (
                                <span className="text-xs">{isRTL ? "تحديد" : "Select"}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Month Container Form */}
              <div className="mb-8">
                <h3 className="text-base font-medium text-primary mb-4">
                  {isRTL ? "إضافة شهر" : "Add Month Container"}
                </h3>
                
                <form onSubmit={handleCreateMonthContainer}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={newMonthName}
                        onChange={(e) => setNewMonthName(e.target.value)}
                        placeholder={isRTL ? "اسم الشهر" : "Month name"}
                        className="input input-bordered w-full"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !selectedTermId}
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4 mr-1" />
                          {isRTL ? "إضافة شهر" : "Add Month"}
                        </>
                      )}
                    </button>
                  </div>
                  {!selectedTermId && (
                    <p className="text-xs text-warning mt-2">
                      {isRTL ? "يرجى تحديد فصل دراسي أولاً" : "Please select a term first"}
                    </p>
                  )}
                </form>
                
                {/* Month Containers List */}
                {selectedTermId && courseStructure.months.filter(month => month.parent === selectedTermId).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? "الشهور في الفصل الدراسي المحدد" : "Months in Selected Term"}
                    </h4>
                    {courseStructure.months
                      .filter(month => month.parent === selectedTermId)
                      .map(month => (
                        <div key={month.id} className="bg-base-200 p-3 rounded-lg">
                          <div 
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleExpand('month', month.id)}
                          >
                            <div className="flex items-center">
                              <ChevronDown 
                                className={`w-4 h-4 mr-2 transition-transform ${expandedItems[`month_${month.id}`] ? 'rotate-180' : ''}`} 
                              />
                              <span>{month.name}</span>
                            </div>
                            <button 
                              className="btn btn-xs btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMonthId(month.id);
                              }}
                            >
                              {selectedMonthId === month.id ? (
                                <span className="text-primary text-xs">✓ {isRTL ? "محدد" : "Selected"}</span>
                              ) : (
                                <span className="text-xs">{isRTL ? "تحديد" : "Select"}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Lecture Form */}
              <div>
                <h3 className="text-base font-medium text-primary mb-4">
                  {isRTL ? "إضافة محاضرة" : "Add Lecture"}
                </h3>
                
                <form onSubmit={handleCreateLecture}>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      value={newLectureName}
                      onChange={(e) => setNewLectureName(e.target.value)}
                      placeholder={isRTL ? "اسم المحاضرة" : "Lecture name"}
                      className="input input-bordered w-full"
                      required
                    />
                    <input
                      type="text"
                      value={newLectureLink}
                      onChange={(e) => setNewLectureLink(e.target.value)}
                      placeholder={isRTL ? "رابط الفيديو" : "Video link"}
                      className="input input-bordered w-full"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !selectedMonthId}
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-1" />
                          {isRTL ? "إضافة محاضرة" : "Add Lecture"}
                        </>
                      )}
                    </button>
                  </div>
                  {!selectedMonthId && (
                    <p className="text-xs text-warning mt-2">
                      {isRTL ? "يرجى تحديد شهر أولاً" : "Please select a month first"}
                    </p>
                  )}
                </form>
                
                {/* Lectures List */}
                {selectedMonthId && courseStructure.lectures.filter(lecture => lecture.parent === selectedMonthId).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? "المحاضرات في الشهر المحدد" : "Lectures in Selected Month"}
                    </h4>
                    {courseStructure.lectures
                      .filter(lecture => lecture.parent === selectedMonthId)
                      .map(lecture => (
                        <div key={lecture.id} className="bg-base-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-primary" />
                              <span>{lecture.name}</span>
                            </div>
                            <a 
                              href={lecture.videoLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-ghost"
                            >
                              <Video className="w-3 h-3 mr-1" />
                              <span className="text-xs">{isRTL ? "عرض" : "View"}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesForm() {
  return (
    <div className="w-full overflow-x-hidden p-4 sm:p-8 md:p-14">
      <CourseCreationForm />
    </div>
  );
}

export default CoursesForm;