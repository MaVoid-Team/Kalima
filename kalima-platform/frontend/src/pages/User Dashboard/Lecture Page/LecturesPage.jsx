"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserDashboard } from "../../../routes/auth-services"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { createLecture, createLectureAttachment } from "../../../routes/lectures"
import { getAllLectures } from "../../../routes/lectures"
import { getExamConfigs, createExamConfig } from "../../../routes/examConfigs"

const MyLecturesPage = () => {
  const [lectures, setLectures] = useState([])
  const [allLectures, setAllLectures] = useState([]) // Store all lectures before pagination
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [renderError, setRenderError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form data state with all required fields matching container-creation-panel
  const [formData, setFormData] = useState({
    name: "",
    type: "lecture",
    createdBy: "",
    level: "",
    subject: "",
    price: 0,
    description: "",
    numberOfViews: 3,
    teacherAllowed: true,
    lecture_type: "Paid",
    requiresExam: false,
    examConfig: "",
    passingThreshold: 50,
    attachmentFile: null,
    attachmentType: "homeworks",
  })

  // Exam config state
  const [examConfigs, setExamConfigs] = useState([])
  const [examConfigsLoading, setExamConfigsLoading] = useState(false)
  const [examConfigsError, setExamConfigsError] = useState("")
  const [selectedExamConfigId, setSelectedExamConfigId] = useState("")
  const [isCreatingNewExamConfig, setIsCreatingNewExamConfig] = useState(false)
  const [newExamConfig, setNewExamConfig] = useState({
    name: "",
    description: "",
    googleSheetId: "",
    formUrl: "",
    studentIdentifierColumn: "Email Address",
    scoreColumn: "Score",
    defaultPassingThreshold: 60,
  })

  const [formError, setFormError] = useState(null)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("")
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState("basic") // For modal tabs: basic, advanced, attachment

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch subjects and levels first (needed for all roles for the modal/filters)
        const subjectsRes = await getAllSubjects()
        const levelsRes = await getAllLevels()

        // Handle subjects fetch result
        if (subjectsRes.success) {
          setSubjects(subjectsRes.data || [])
        } else {
          console.error("Failed to fetch subjects:", subjectsRes.error)
          setSubjects([])
          setError("فشل في تحميل المواد، لكن يمكنك المتابعة.")
        }

        // Handle levels fetch result
        if (levelsRes.success) {
          setLevels(levelsRes.data || [])
        } else {
          console.error("Failed to fetch levels:", levelsRes.error)
          setLevels([])
          setError((prev) => (prev ? `${prev}` : "فشل في تحميل المستويات، لكن يمكنك المتابعة."))
        }

        // Fetch dashboard data to get user role
        const result = await getUserDashboard({
          params: { fields: "userInfo,containers,purchaseHistory", limit: 200 },
        })

        if (result.success) {
          const { userInfo } = result.data.data
          setUserRole(userInfo.role)
          setUserId(userInfo.id)
          setFormData((prev) => ({ ...prev, createdBy: userInfo.id }))

          // Different data fetching based on user role
          if (["Admin", "Subadmin", "Moderator"].includes(userInfo.role)) {
            // For admin roles, fetch all lectures
            const allLecturesResult = await getAllLectures({
              limit: 200,
            })

            if (allLecturesResult.status === "success") {
              const lecturesData = allLecturesResult.data.containers.map((lecture) => ({
                id: lecture._id,
                name: lecture.name,
                subject: lecture.subject,
                level: lecture.level,
                price: lecture.price,
                videoLink: lecture.videoLink,
                lecture_type: lecture.lecture_type,
                requiresExam: lecture.requiresExam,
                examConfig: lecture.examConfig,
                lecturer: lecture.createdBy,
              }))

              setAllLectures(lecturesData)
            } else {
              console.error("Failed to fetch all lectures:", allLecturesResult)
              setError("فشل في تحميل جميع المحاضرات")
            }
          } else if (userInfo.role === "Lecturer") {
            // For lecturers, use the containers from dashboard
            const lecturesData =
              result.data.data.containers
                ?.filter((c) => c.type === "lecture")
                .map((lecture) => ({
                  id: lecture._id,
                  name: lecture.name,
                  subject: lecture.subject,
                  level: lecture.level,
                  price: lecture.price,
                  videoLink: lecture.videoLink,
                  lecture_type: lecture.lecture_type,
                  requiresExam: lecture.requiresExam,
                  examConfig: lecture.examConfig,
                  lecturer: userInfo,
                })) || []

            setAllLectures(lecturesData)
          } else if (userInfo.role === "Student") {
            // For students, use the purchase history
            const lecturesData =
              result.data.data.purchaseHistory
                ?.filter((p) => p.container?.type === "lecture")
                .map((p) => ({
                  id: p.container?._id || p._id,
                  name: p.container?.name || p.description.replace("Purchased container ", "").split(" for ")[0],
                  price: p.points,
                  videoLink: p.container?.videoLink,
                  lecture_type: p.container?.lecture_type,
                  purchasedAt: new Date(p.purchasedAt).toLocaleString("en-gb", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  lecturer: p.lecturer,
                  subject: p.container?.subject,
                  level: p.container?.level,
                })) || []

            setAllLectures(lecturesData)
          }
        } else {
          setError("فشل في تحميل بيانات المستخدم، لكن يمكنك المتابعة.")
        }
      } catch (err) {
        console.error("Error in fetchInitialData:", err)
        setError("فشل في تحميل البيانات، لكن يمكنك المتابعة.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch exam configs when requiresExam is true
  useEffect(() => {
    if (formData.requiresExam && showCreateModal) {
      fetchExamConfigs()
    }
  }, [formData.requiresExam, showCreateModal])

  // Set default passing threshold when selecting an exam config
  useEffect(() => {
    if (selectedExamConfigId && !isCreatingNewExamConfig) {
      const selectedConfig = examConfigs.find((c) => c._id === selectedExamConfigId)
      if (selectedConfig) {
        setFormData((prev) => ({
          ...prev,
          passingThreshold: selectedConfig.defaultPassingThreshold,
        }))
      }
    }
  }, [selectedExamConfigId, examConfigs, isCreatingNewExamConfig])

  const fetchExamConfigs = async () => {
    setExamConfigsLoading(true)
    setExamConfigsError("")
    try {
      console.log("Fetching exam configs...")
      const response = await getExamConfigs()
      console.log("Exam Configs Response:", response)

      if (response.success && response.data) {
        // Try to extract exam configs from different possible response structures
        const configs =
          (response.data.data && response.data.data.examConfigs) || // Format: { data: { data: { examConfigs: [...] } } }
          response.data.examConfigs || // Format: { data: { examConfigs: [...] } }
          (Array.isArray(response.data) ? response.data : []) // Format: { data: [...] }

        console.log("Extracted exam configs:", configs)

        if (Array.isArray(configs) && configs.length > 0) {
          setExamConfigs(configs)
        } else {
          console.log("No exam configs found in response")
          setExamConfigsError("لم يتم العثور على تكوينات امتحان. يرجى إنشاء واحدة جديدة.")
          setExamConfigs([])
        }
      } else {
        console.error("Failed to fetch exam configs:", response.message)
        setExamConfigsError(response.message || "فشل في جلب تكوينات الامتحان")
        setExamConfigs([])
      }
    } catch (err) {
      console.error("Error fetching exam configs:", err)
      setExamConfigsError(err.message || "فشل في جلب تكوينات الامتحان")
      setExamConfigs([])
    } finally {
      setExamConfigsLoading(false)
    }
  }

  // Apply filters and pagination whenever filters, page, or allLectures changes
  useEffect(() => {
    if (allLectures.length > 0) {
      // Apply filters - but only for non-admin roles
      let filteredLectures = [...allLectures]

      // Skip filtering for admin roles to avoid duplicates
      if (!["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        if (selectedSubjectFilter) {
          filteredLectures = filteredLectures.filter((l) => l.subject?._id === selectedSubjectFilter)
        }

        if (selectedLevelFilter) {
          filteredLectures = filteredLectures.filter((l) => l.level?._id === selectedLevelFilter)
        }
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedLectures = filteredLectures.slice(startIndex, startIndex + itemsPerPage)

      setLectures(paginatedLectures)
      setTotalPages(Math.ceil(filteredLectures.length / itemsPerPage))
    }
  }, [allLectures, selectedSubjectFilter, selectedLevelFilter, currentPage, itemsPerPage, userRole])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        attachmentFile: files[0],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "lecture",
      createdBy: userId,
      level: "",
      subject: "",
      price: 0,
      description: "",
      numberOfViews: 3,
      teacherAllowed: true,
      lecture_type: "Paid",
      requiresExam: false,
      examConfig: "",
      passingThreshold: 50,
      attachmentFile: null,
      attachmentType: "homeworks",
    })
    setSelectedExamConfigId("")
    setIsCreatingNewExamConfig(false)
    setNewExamConfig({
      name: "",
      description: "",
      googleSheetId: "",
      formUrl: "",
      studentIdentifierColumn: "Email Address",
      scoreColumn: "Score",
      defaultPassingThreshold: 60,
    })
    setActiveTab("basic")
  }

  const handleCreateLecture = async () => {
    if (!formData.name || !formData.level || !formData.subject) {
      setFormError("يرجى ملء جميع الحقول المطلوبة")
      setActiveTab("basic")
      return
    }

    if (formData.requiresExam) {
      if (isCreatingNewExamConfig) {
        if (!newExamConfig.name || !newExamConfig.googleSheetId || !newExamConfig.formUrl) {
          setFormError("يرجى ملء جميع حقول تكوين الامتحان المطلوبة")
          setActiveTab("advanced")
          return
        }
      } else if (!selectedExamConfigId) {
        setFormError("يرجى تحديد تكوين الامتحان")
        setActiveTab("advanced")
        return
      }
    }

    setFormError(null)

    try {
      // Create the base lecture data object
      const lectureData = {
        name: formData.name,
        type: formData.type,
        createdBy: formData.createdBy,
        level: formData.level,
        subject: formData.subject,
        price: Number(formData.price),
        description: formData.description,
        numberOfViews: Number(formData.numberOfViews),
        teacherAllowed: formData.teacherAllowed,
        lecture_type: formData.lecture_type,
      }

      // Handle exam configuration if required
      if (formData.requiresExam) {
        let examConfigIdToUse

        if (isCreatingNewExamConfig) {
          console.log("Creating new exam config:", newExamConfig)
          const createResponse = await createExamConfig(newExamConfig)
          console.log("Create exam config response:", createResponse)

          // Extract the exam config ID from different response formats
          if (createResponse.success === true && createResponse.data) {
            if (createResponse.data._id) {
              examConfigIdToUse = createResponse.data._id
            } else if (
              createResponse.data.data &&
              createResponse.data.data.examConfig &&
              createResponse.data.data.examConfig._id
            ) {
              examConfigIdToUse = createResponse.data.data.examConfig._id
            } else if (createResponse.data.examConfig && createResponse.data.examConfig._id) {
              examConfigIdToUse = createResponse.data.examConfig._id
            } else {
              console.error("Could not find exam config ID in response:", createResponse)
              throw new Error("فشل في استخراج معرف تكوين الامتحان من الاستجابة")
            }
          } else if (createResponse.status === "success" && createResponse.data && createResponse.data._id) {
            examConfigIdToUse = createResponse.data._id
          } else {
            console.error("Invalid response format from createExamConfig:", createResponse)
            throw new Error(createResponse.message || "فشل في إنشاء تكوين الامتحان")
          }
        } else {
          examConfigIdToUse = selectedExamConfigId
        }

        // Set the exam config ID and passing threshold in the lecture data
        lectureData.requiresExam = true
        lectureData.examConfig = examConfigIdToUse
        lectureData.passingThreshold = Number(formData.passingThreshold) || 60
      }

      console.log("Creating lecture with data:", lectureData)
      const response = await createLecture(lectureData)
      console.log("Create lecture response:", response)

      if (response.status !== "success" && response.success !== true) {
        throw new Error(response.message || "فشل في إنشاء المحاضرة")
      }

      // Extract the lecture ID from the response
      let lectureId = null
      if (response.data && response.data.lecture && response.data.lecture._id) {
        lectureId = response.data.lecture._id
      } else if (response.data && response.data._id) {
        lectureId = response.data._id
      } else if (response.data && response.data.lecture && response.data.lecture.id) {
        lectureId = response.data.lecture.id
      } else if (response.data && response.data.id) {
        lectureId = response.data.id
      }

      // Handle attachment after successful lecture creation
      if (formData.attachmentFile && lectureId) {
        try {
          console.log("Uploading attachment for lecture ID:", lectureId)
          const attachmentData = {
            type: formData.attachmentType,
            attachment: formData.attachmentFile,
          }

          const attachmentResponse = await createLectureAttachment(lectureId, attachmentData)
          console.log("Attachment upload response:", attachmentResponse)
        } catch (attachmentError) {
          console.error("Error uploading attachment:", attachmentError)
          setFormError(`تم إنشاء المحاضرة ولكن فشل تحميل المرفق: ${attachmentError.message}`)
        }
      }

      setShowCreateModal(false)
      resetForm()

      // Refresh lectures after creating a new one
      if (["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        const allLecturesResult = await getAllLectures()
        if (allLecturesResult.status === "success") {
          const lecturesData = allLecturesResult.data.containers.map((lecture) => ({
            id: lecture._id,
            name: lecture.name,
            subject: lecture.subject,
            level: lecture.level,
            price: lecture.price,
            videoLink: lecture.videoLink,
            lecture_type: lecture.lecture_type,
            requiresExam: lecture.requiresExam,
            examConfig: lecture.examConfig,
            lecturer: lecture.createdBy,
          }))

          setAllLectures(lecturesData)
        }
      } else if (userRole === "Lecturer") {
        const result = await getUserDashboard({
          params: { fields: "userInfo,containers,purchaseHistory", limit: 100 },
        })

        if (result.success) {
          const lecturesData =
            result.data.data.containers
              ?.filter((c) => c.type === "lecture")
              .map((lecture) => ({
                id: lecture._id,
                name: lecture.name,
                subject: lecture.subject,
                level: lecture.level,
                price: lecture.price,
                videoLink: lecture.videoLink,
                lecture_type: lecture.lecture_type,
                requiresExam: lecture.requiresExam,
                examConfig: lecture.examConfig,
                lecturer: result.data.data.userInfo,
              })) || []

          setAllLectures(lecturesData)
        }
      }
    } catch (err) {
      setFormError("فشل إنشاء المحاضرة: " + err.message)
    }
  }

  // New Exam Config Form Component
  const NewExamConfigForm = () => {
    return (
      <div className="space-y-4 mb-4 p-4 border border-base-300 rounded-lg bg-base-200">
        <h4 className="font-medium text-primary">تكوين امتحان جديد</h4>

        <div className="form-control">
          <label className="label">
            <span className="label-text">الاسم</span>
          </label>
          <input
            type="text"
            placeholder="أدخل اسم تكوين الامتحان"
            className="input input-bordered"
            value={newExamConfig.name}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">الوصف</span>
          </label>
          <textarea
            placeholder="أدخل الوصف"
            className="textarea textarea-bordered"
            value={newExamConfig.description}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">معرف جدول بيانات Google</span>
          </label>
          <input
            type="text"
            placeholder="مثال : 1Iaosq_KHl7w6__oJB9nFnFr9QYiTDmSSKrWADszUcsM"
            className="input input-bordered"
            value={newExamConfig.googleSheetId}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, googleSheetId: e.target.value }))}
            required
          />
          <label className="label">
            <span className="label-text-alt text-muted-foreground">
              المعرف من عنوان URL لجدول بيانات Google الخاص بك
            </span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">عنوان URL للنموذج</span>
          </label>
          <input
            type="url"
            placeholder="أدخل عنوان URL لنموذج Google"
            className="input input-bordered"
            value={newExamConfig.formUrl}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, formUrl: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">عمود معرف الطالب</span>
            </label>
            <input
              type="text"
              placeholder="اسم العمود"
              className="input input-bordered"
              value={newExamConfig.studentIdentifierColumn}
              onChange={(e) => setNewExamConfig((prev) => ({ ...prev, studentIdentifierColumn: e.target.value }))}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">عمود النتيجة</span>
            </label>
            <input
              type="text"
              placeholder="اسم العمود"
              className="input input-bordered"
              value={newExamConfig.scoreColumn}
              onChange={(e) => setNewExamConfig((prev) => ({ ...prev, scoreColumn: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">عتبة النجاح الافتراضية (%)</span>
          </label>
          <input
            type="number"
            placeholder="أدخل العتبة"
            className="input input-bordered"
            value={newExamConfig.defaultPassingThreshold}
            onChange={(e) => setNewExamConfig((prev) => ({ ...prev, defaultPassingThreshold: Number(e.target.value) }))}
            min="0"
            max="100"
            required
          />
        </div>
      </div>
    )
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )

  // Basic error boundary for rendering
  try {
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <h1 className="text-2xl font-bold mb-2">
          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole) ? "إدارة المحاضرات" : "المحاضرات المشتراة"}
        </h1>
        <p className="text-sm opacity-80 mt-2 mb-5">تفاصيل كل محاضراتي</p>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              إغلاق
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <select
              className="select select-bordered w-full md:w-64"
              value={selectedSubjectFilter}
              onChange={(e) => {
                setSelectedSubjectFilter(e.target.value)
                setCurrentPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="">كل المواد</option>
              {subjects &&
                subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
            </select>

            <select
              className="select select-bordered w-full md:w-64"
              value={selectedLevelFilter}
              onChange={(e) => {
                setSelectedLevelFilter(e.target.value)
                setCurrentPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="">كل المستويات</option>
              {levels &&
                levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
            </select>
          </div>

          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole) && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              إنشاء محاضرة جديدة
            </button>
          )}

          <select
            className="select select-bordered w-full md:w-48"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10 لكل صفحة</option>
            <option value={20}>20 لكل صفحة</option>
            <option value={50}>50 لكل صفحة</option>
          </select>
        </div>

        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-primary">إنشاء محاضرة جديدة</h3>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed mb-6">
                <a className={`tab ${activeTab === "basic" ? "tab-active" : ""}`} onClick={() => setActiveTab("basic")}>
                  معلومات أساسية
                </a>
                <a
                  className={`tab ${activeTab === "advanced" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("advanced")}
                >
                  إعدادات متقدمة
                </a>
                <a
                  className={`tab ${activeTab === "attachment" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("attachment")}
                >
                  المرفقات
                </a>
              </div>

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">اسم المحاضرة</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input input-bordered"
                        placeholder="أدخل اسم المحاضرة"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">نوع المحاضرة</span>
                      </label>
                      <select
                        name="lecture_type"
                        value={formData.lecture_type}
                        onChange={handleInputChange}
                        className="select select-bordered"
                        required
                      >
                        <option value="Paid">مدفوعة</option>
                        <option value="Revision">مراجعة</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">المستوى</span>
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className="select select-bordered"
                        required
                      >
                        <option value="">اختر المستوى</option>
                        {levels &&
                          levels.map((level) => (
                            <option key={level._id} value={level._id}>
                              {level.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">المادة</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="select select-bordered"
                        required
                      >
                        <option value="">اختر المادة</option>
                        {subjects &&
                          subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">السعر</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="input input-bordered"
                        min="0"
                        placeholder="أدخل السعر"
                        disabled={formData.lecture_type === "Revision"}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">عدد المشاهدات</span>
                      </label>
                      <input
                        type="number"
                        name="numberOfViews"
                        value={formData.numberOfViews}
                        onChange={handleInputChange}
                        className="input input-bordered"
                        min="0"
                        placeholder="أدخل عدد المشاهدات"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">الوصف</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered h-24"
                      placeholder="أدخل وصفًا للمحاضرة"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Settings Tab */}
              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <div className="form-control bg-base-200 p-4 rounded-lg">
                    <label className="cursor-pointer label justify-start gap-4">
                      <input
                        type="checkbox"
                        name="requiresExam"
                        checked={formData.requiresExam}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text font-medium">تحتاج إلى امتحان؟</span>
                    </label>
                  </div>

                  {formData.requiresExam && (
                    <div className="space-y-6 border-r-4 border-primary pr-4 py-2">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">تكوين الامتحان</span>
                        </label>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <select
                              className="select select-bordered w-full"
                              value={isCreatingNewExamConfig ? "new" : selectedExamConfigId}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "new") {
                                  setIsCreatingNewExamConfig(true)
                                  setSelectedExamConfigId("")
                                } else {
                                  setIsCreatingNewExamConfig(false)
                                  setSelectedExamConfigId(value)
                                }
                              }}
                              disabled={examConfigsLoading}
                            >
                              <option value="">اختر تكوين الامتحان</option>
                              {examConfigs.length > 0 ? (
                                examConfigs.map((config) => (
                                  <option key={config._id} value={config._id}>
                                    {config.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  لا توجد تكوينات موجودة
                                </option>
                              )}
                              <option value="new">إنشاء تكوين امتحان جديد</option>
                            </select>
                            {examConfigsLoading && <span className="loading loading-spinner"></span>}
                          </div>
                          {examConfigsError && <div className="text-error text-sm">{examConfigsError}</div>}
                        </div>
                      </div>

                      {isCreatingNewExamConfig ? (
                        <NewExamConfigForm />
                      ) : (
                        selectedExamConfigId && (
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">عتبة النجاح</span>
                            </label>
                            <input
                              type="number"
                              name="passingThreshold"
                              placeholder="أدخل عتبة النجاح"
                              className="input input-bordered"
                              value={formData.passingThreshold}
                              onChange={handleInputChange}
                              min="0"
                              max="100"
                              required
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Attachment Tab */}
              {activeTab === "attachment" && (
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">نوع المرفق</span>
                    </label>
                    <select
                      name="attachmentType"
                      value={formData.attachmentType}
                      onChange={handleInputChange}
                      className="select select-bordered"
                    >
                      <option value="pdfsandimages">ملفات PDF وصور</option>
                      <option value="booklets">كتيبات</option>
                      <option value="homeworks">واجبات منزلية</option>
                      <option value="exams">امتحانات</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">إرفاق ملف (اختياري)</span>
                    </label>
                    <div className="bg-base-200 p-6 rounded-lg border-2 border-dashed border-base-300 text-center">
                      <input
                        type="file"
                        id="attachment-file"
                        onChange={handleInputChange}
                        className="file-input file-input-bordered w-full max-w-md"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <p className="mt-2 text-sm text-base-content/70">
                        يمكنك إرفاق ملفات PDF أو صور (.jpg, .jpeg, .png)
                      </p>
                      {formData.attachmentFile && (
                        <div className="mt-4 p-3 bg-base-100 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="badge badge-primary">
                              {formData.attachmentFile.name.split(".").pop().toUpperCase()}
                            </div>
                            <span className="font-medium">{formData.attachmentFile.name}</span>
                            <span className="text-sm text-base-content/70">
                              ({(formData.attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setFormData((prev) => ({ ...prev, attachmentFile: null }))}
                          >
                            إزالة
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="alert alert-error mt-6">
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
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-action mt-6 flex justify-between">
                <div>
                  {activeTab !== "basic" && (
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        if (activeTab === "advanced") setActiveTab("basic")
                        if (activeTab === "attachment") setActiveTab("advanced")
                      }}
                    >
                      السابق
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                  >
                    إلغاء
                  </button>
                  {activeTab !== "attachment" ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (activeTab === "basic") {
                          if (!formData.name || !formData.level || !formData.subject) {
                            setFormError("يرجى ملء جميع الحقول المطلوبة")
                          } else {
                            setActiveTab("advanced")
                            setFormError(null)
                          }
                        } else if (activeTab === "advanced") {
                          if (formData.requiresExam) {
                            if (isCreatingNewExamConfig) {
                              if (!newExamConfig.name || !newExamConfig.googleSheetId || !newExamConfig.formUrl) {
                                setFormError("يرجى ملء جميع حقول تكوين الامتحان المطلوبة")
                                return
                              }
                            } else if (!selectedExamConfigId) {
                              setFormError("يرجى تحديد تكوين الامتحان")
                              return
                            }
                          }
                          setActiveTab("attachment")
                          setFormError(null)
                        }
                      }}
                    >
                      التالي
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleCreateLecture}>
                      إنشاء المحاضرة
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>الاسم</th>
                {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && <th>المحاضر</th>}
                <th>المادة</th>
                <th>المستوى</th>
                <th>النوع</th>
                <th>السعر</th>
                {userRole === "Student" && <th>تاريخ الشراء</th>}
                {userRole !== "Student" && <th>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {lectures &&
                lectures.map((lecture) => (
                  <tr key={lecture.id}>
                    <td>{lecture.name}</td>
                    {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && (
                      <td>{lecture.lecturer?.name || "غير معروف"}</td>
                    )}
                    <td>{lecture.subject?.name || "غير محدد"}</td>
                    <td>{lecture.level?.name || "غير محدد"}</td>
                    <td>{lecture.lecture_type === "Paid" ? "مدفوعة" : "مراجعة"}</td>
                    <td>{lecture.price || 0} نقطة</td>
                    {userRole === "Student" && <td>{lecture.purchasedAt}</td>}
                    <td>
                      {userRole === "Student" ? (
                        <Link to={`/dashboard/student-dashboard/lecture-display/${lecture.id}`}>
                          <button className="btn btn-ghost">التفاصيل</button>
                        </Link>
                      ) : (
                        <Link to={`/dashboard/lecturer-dashboard/detailed-lecture-view/${lecture.id}`}>
                          <button className="btn btn-ghost">التفاصيل</button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {lectures.length === 0 && (
          <div className="alert alert-info mt-4">
            <span>
              {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole)
                ? "لا توجد محاضرات متاحة"
                : "لم تقم بشراء أي محاضرات بعد"}
            </span>
          </div>
        )}

        {totalPages > 1 && (
          <div className="join flex justify-center mt-4">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              السابق
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show at most 5 page buttons
              let pageNum
              if (totalPages <= 5) {
                // If 5 or fewer pages, show all
                pageNum = i + 1
              } else if (currentPage <= 3) {
                // If near the start, show first 5 pages
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5 pages
                pageNum = totalPages - 4 + i
              } else {
                // Otherwise show 2 before and 2 after current page
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={i}
                  className={`join-item btn ${currentPage === pageNum ? "btn-active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    )
  } catch (err) {
    console.error("Render error in MyLecturesPage:", err)
    setRenderError("حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.")
    return (
      <div className="container mx-auto p-4" dir="rtl">
        <div className="alert alert-error">
          <span>{renderError}</span>
        </div>
      </div>
    )
  }
}

export default MyLecturesPage
