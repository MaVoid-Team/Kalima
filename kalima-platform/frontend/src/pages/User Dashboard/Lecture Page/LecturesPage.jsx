"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getUserDashboard } from "../../../routes/auth-services"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { createLecture, createLectureAttachment, updateLectureById } from "../../../routes/lectures"
import { getAllLectures } from "../../../routes/lectures"
import LectureCreationModal from "../../../components/LectureCreationModal"

const MyLecturesPage = () => {
  const { t, i18n } = useTranslation("lecturesPage")
  const isRTL = i18n.language === "ar"
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
  const [creationLoading, setCreationLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("")
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLecture, setEditingLecture] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    videoLink: "",
    description: "",
    lecture_type: "",
    subject: "",
    level: "",
    thumbnailFile: null,
  })

  const convertPathToUrl = (filePath, folder = "product_thumbnails") => {
    if (!filePath) return null
    if (filePath.startsWith("http")) return filePath

    const normalizedPath = filePath.replace(/\\/g, "/")
    const API_URL = import.meta.env.VITE_API_URL || window.location.origin
    const baseUrl = API_URL.replace(/\/api(\/v1)?\/?$/, "") // remove /api or /api/v1 if present
    const filename = normalizedPath.split("/").pop()

    return `${baseUrl}/uploads/${folder}/${filename}`
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get subjects and levels (common for all roles)
        const subjectsRes = await getAllSubjects();
        const levelsRes = await getAllLevels();

        if (subjectsRes.success) {
          setSubjects(subjectsRes.data || []);
        } else {
          console.error("Failed to fetch subjects:", subjectsRes.error);
          setSubjects([]);
          setError("Failed to load subjects, but you can continue.");
        }

        if (levelsRes.success) {
          setLevels(levelsRes.data || []);
        } else {
          console.error("Failed to fetch levels:", levelsRes.error);
          setLevels([]);
          setError(prev => prev ? `${prev}` : "Failed to load levels, but you can continue.");
        }

        // Then determine user role and fetch appropriate data
        const userInfoResult = await getUserDashboard({
          params: { fields: "userInfo", limit: 1 }
        });

        if (!userInfoResult.success) {
          throw new Error("Failed to fetch user info");
        }

        const userRole = userInfoResult.data.data.userInfo.role;
        setUserRole(userRole);
        setUserId(userInfoResult.data.data.userInfo.id);

        // Role-specific data fetching
        if (["Admin", "Subadmin", "Moderator"].includes(userRole)) {
          // Use getAllLectures for admin roles
          const allLecturesResult = await getAllLectures({ limit: 200 });

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
              thumbnail: lecture.thumbnail,
              createdAt: lecture.createdAt,
            }));
            setAllLectures(lecturesData);
          } else {
            throw new Error(allLecturesResult.message || "Failed to fetch lectures");
          }
        } else if (userRole === "Lecturer") {
          // Use getUserDashboard with specific fields for lecturers
          const result = await getUserDashboard({
            params: { fields: "userInfo,lectures,containers", limit: 500 },
          });

          if (result.success) {
            const { containers, lectures } = result.data.data;

            const containerLectures = containers
              ?.filter(c => c.type === "lecture")
              .map(lecture => ({
                id: lecture._id,
                name: lecture.name,
                subject: lecture.subject,
                level: lecture.level,
                price: lecture.price,
                videoLink: lecture.videoLink,
                lecture_type: lecture.lecture_type || "Unknown",
                requiresExam: lecture.requiresExam || false,
                examConfig: lecture.examConfig || null,
                lecturer: result.data.data.userInfo,
                thumbnail: lecture.thumbnail ? convertPathToUrl(lecture.thumbnail) : null,
                createdAt: lecture.createdAt || null,
              })) || [];

            const standaloneLectures = lectures?.map(lecture => ({
              id: lecture._id,
              name: lecture.name,
              subject: lecture.subject,
              level: lecture.level,
              price: lecture.price,
              lecture_type: lecture.lecture_type,
              requiresExam: lecture.requiresExam || false,
              examConfig: lecture.examConfig || null,
              lecturer: result.data.data.userInfo,
              thumbnail: lecture.thumbnail ? convertPathToUrl(lecture.thumbnail) : null,
              createdAt: lecture.createdAt || null,
            })) || [];

            const allLecturesCombined = [...containerLectures, ...standaloneLectures];
            setAllLectures(allLecturesCombined);
          } else {
            throw new Error(result.error || "Failed to fetch lecturer data");
          }
        } else if (userRole === "Student") {
          // Handle student case
          const result = await getUserDashboard({
            params: { fields: "purchaseHistory", limit: 500 },
          });

          if (result.success) {
            const lecturesData = result.data.data.purchaseHistory
              ?.map(p => {
                // If lecture field exists (lecturePurchase), use it
                if (p.lecture) {
                  return {
                    id: p.lecture._id || p._id,
                    name: p.lecture.name,
                    price: p.points,
                    videoLink: p.lecture.videoLink,
                    lecture_type: p.lecture.lecture_type,
                    purchasedAt: new Date(p.purchasedAt).toLocaleString("en-gb", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    lecturer: p.lecturer,
                    subject: p.lecture.subject,
                    level: p.lecture.level,
                    thumbnail: p.lecture.thumbnail,
                  };
                }
                // If container is a lecture (containerPurchase), use container
                if (p.container && p.container.type === "lecture") {
                  return {
                    id: p.container._id || p._id,
                    name: p.container.name || p.description.replace("Purchased container ", "").split(" for ")[0],
                    price: p.points,
                    videoLink: p.container.videoLink,
                    lecture_type: p.container.lecture_type,
                    purchasedAt: new Date(p.purchasedAt).toLocaleString("en-gb", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    lecturer: p.lecturer,
                    subject: p.container.subject,
                    level: p.container.level,
                    thumbnail: p.container.thumbnail,
                  };
                }
                // Otherwise, skip
                return null;
              })
              .filter(Boolean) || [];
            setAllLectures(lecturesData);
          }
        }
      } catch (err) {
        console.error("Error in fetchInitialData:", err);
        setError(err.message || "Failed to load data, but you can continue.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData()
  }, [])

  useEffect(() => {
    if (allLectures.length > 0) {
      let filteredLectures = [...allLectures]

      if (!["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        if (selectedSubjectFilter) {
          filteredLectures = filteredLectures.filter((l) => l.subject?._id === selectedSubjectFilter)
        }

        if (selectedLevelFilter) {
          filteredLectures = filteredLectures.filter((l) => l.level?._id === selectedLevelFilter)
        }
      }

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

  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture)
    setEditForm({
      name: lecture.name || "",
      price: lecture.price || "",
      videoLink: lecture.videoLink || "",
      description: lecture.description || "",
      lecture_type: lecture.lecture_type || "",
      subject: lecture.subject?._id || "",
      level: lecture.level?._id || "",
      thumbnailFile: null,
    })
    setShowEditModal(true)
  }

  const handleUpdateLecture = async (e) => {
    e.preventDefault()
    if (!editingLecture) return

    try {
      setCreationLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("name", editForm.name)
      formData.append("price", editForm.price)
      if (editForm.videoLink) formData.append("videoLink", editForm.videoLink)
      if (editForm.description) formData.append("description", editForm.description)
      if (editForm.lecture_type) formData.append("lecture_type", editForm.lecture_type)
      if (editForm.subject) formData.append("subject", editForm.subject)
      if (editForm.level) formData.append("level", editForm.level)
      if (editForm.thumbnailFile) formData.append("thumbnail", editForm.thumbnailFile)

      const result = await updateLectureById(editingLecture.id, formData)

      if (result.status === "success") {
        setSuccessMessage(t("lecturesPage.messages.lectureUpdatedSuccessfully", "Lecture updated successfully!"))
        setShowEditModal(false)
        setEditingLecture(null)
        await refetchLectureData()

        setTimeout(() => {
          setSuccessMessage("")
        }, 5000)
      } else {
        setError(result.message || "Failed to update lecture")
      }
    } catch (err) {
      console.error("Error updating lecture:", err)
      setError(err.message || "Failed to update lecture")
    } finally {
      setCreationLoading(false)
    }
  }

  // Batch upload all attachments and links for all categories in one request
  const handleCreateLecture = async (lectureData, _unused, _unused2, thumbnailFile, attachmentFilesByCategory, attachmentLinksByCategory) => {
    setCreationLoading(true)
    setError(null)
    setSuccessMessage("")

    try {
      let response
      if (thumbnailFile) {
        const formData = new FormData()
        Object.keys(lectureData).forEach((key) => {
          if (lectureData[key] !== null && lectureData[key] !== undefined) {
            formData.append(key, lectureData[key])
          }
        })
        formData.append("thumbnail", thumbnailFile)
        response = await createLecture(formData)
      } else {
        response = await createLecture(lectureData)
      }

      if (response.status !== "success" && response.success !== true) {
        throw new Error(response.message || "فشل في إنشاء المحاضرة")
      }

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

      // Batch upload all files and links for all categories
      if (lectureId) {
        const formData = new FormData()
        // Attach files for each category
        const categories = ["pdfsandimages", "booklets", "homeworks", "exams"]
        categories.forEach((cat) => {
          if (attachmentFilesByCategory && attachmentFilesByCategory[cat] && attachmentFilesByCategory[cat].length > 0) {
            attachmentFilesByCategory[cat].forEach((file) => {
              formData.append(cat, file)
            })
          }
        })
        // Attach links for homeworks and exams
        if (attachmentLinksByCategory) {
          if (attachmentLinksByCategory.homeworks && attachmentLinksByCategory.homeworks.trim() !== "") {
            formData.append("homeworks", attachmentLinksByCategory.homeworks)
          }
          if (attachmentLinksByCategory.exams && attachmentLinksByCategory.exams.trim() !== "") {
            formData.append("exams", attachmentLinksByCategory.exams)
          }
        }
        // Only upload if there are files or links
        if (formData.has("pdfsandimages") || formData.has("booklets") || formData.has("homeworks") || formData.has("exams")) {
          try {
            await createLectureAttachment(lectureId, formData, true)
          } catch (attachmentError) {
            console.error("Error uploading attachments:", attachmentError)
            setError(`تم إنشاء المحاضرة ولكن فشل تحميل المرفقات: ${attachmentError.message}`)
          }
        }
      }

      await refetchLectureData()

      setSuccessMessage(t("lecturesPage.messages.lectureCreatedSuccessfully", "Lecture created successfully!"))

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)

      return true
    } catch (err) {
      setError("فشل إنشاء المحاضرة: " + err.message)
      return false
    } finally {
      setCreationLoading(false)
    }
  }

  const refetchLectureData = async () => {
    try {
      if (["Admin", "Subadmin", "Moderator"].includes(userRole)) {
        const allLecturesResult = await getAllLectures({ limit: 200 });

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
            thumbnail: lecture.thumbnail,
            createdAt: lecture.createdAt,
          }));
          setAllLectures(lecturesData);
        }
      } else if (userRole === "Lecturer") {
        const result = await getUserDashboard({
          params: { fields: "lectures,containers", limit: 500 },
        });

        if (result.success) {
          const { containers, lectures } = result.data.data;

          const containerLectures = containers
            ?.filter(c => c.type === "lecture")
            .map(lecture => ({
              id: lecture._id,
              name: lecture.name,
              subject: lecture.subject,
              level: lecture.level,
              price: lecture.price,
              videoLink: lecture.videoLink,
              lecture_type: lecture.lecture_type || "Unknown",
              requiresExam: lecture.requiresExam || false,
              examConfig: lecture.examConfig || null,
              lecturer: { id: userId, name: result.data.data.userInfo?.name },
              thumbnail: lecture.thumbnail ? convertPathToUrl(lecture.thumbnail) : null,
              createdAt: lecture.createdAt || null,
            })) || [];

          const standaloneLectures = lectures?.map(lecture => ({
            id: lecture._id,
            name: lecture.name,
            subject: lecture.subject,
            level: lecture.level,
            price: lecture.price,
            lecture_type: lecture.lecture_type,
            requiresExam: lecture.requiresExam || false,
            examConfig: lecture.examConfig || null,
            lecturer: { id: userId, name: result.data.data.userInfo?.name },
            thumbnail: lecture.thumbnail ? convertPathToUrl(lecture.thumbnail) : null,
            createdAt: lecture.createdAt || null,
          })) || [];

          const allLecturesCombined = [...containerLectures, ...standaloneLectures];
          setAllLectures(allLecturesCombined);
        }
      }
    } catch (error) {
      console.error("Error refetching lecture data:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )

  try {
    return (
      <div className="container mx-auto p-4" dir={isRTL ? "rtl" : "ltr"}>
        <h1 className="text-2xl font-bold mb-2">
          {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole)
            ? t("lecturesPage.pageTitle.manage")
            : t("lecturesPage.pageTitle.purchased")}
        </h1>
        <p className="text-sm opacity-80 mt-2 mb-5">{t("lecturesPage.pageDescription")}</p>

        {successMessage && (
          <div className="alert alert-success mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{successMessage}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setSuccessMessage("")}>
              {t("lecturesPage.buttons.close")}
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              {t("lecturesPage.buttons.close")}
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
                setCurrentPage(1)
              }}
            >
              <option value="">{t("lecturesPage.filters.allSubjects")}</option>
              {subjects?.map((subject) => (
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
                setCurrentPage(1)
              }}
            >
              <option value="">{t("lecturesPage.filters.allLevels")}</option>
              {levels?.map((level) => (
                <option key={level._id} value={level._id}>
                  {t(`gradeLevels.${level.name}`, { ns: "common" })}
                </option>
              ))}
            </select>
          </div>

          {["Lecturer", "Admin"].includes(userRole) && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              {t("lecturesPage.buttons.createNewLecture")}
            </button>
          )}

          <select
            className="select select-bordered w-full md:w-48"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>{t("lecturesPage.itemsPerPage", { count: 10 })}</option>
            <option value={20}>{t("lecturesPage.itemsPerPage", { count: 20 })}</option>
            <option value={50}>{t("lecturesPage.itemsPerPage", { count: 50 })}</option>
          </select>
        </div>

        <LectureCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateLecture}
          containerId={null}
          userId={userId}
          containerLevel={null}
          containerSubject={null}
          containerType="month"
        />

        {/* Edit Lecture Modal */}
        {showEditModal && editingLecture && (
          <div className="fixed inset-0 bg-neutral/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-base-100 border-b p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">{t("lecturesPage.editLecture", "Edit Lecture")}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateLecture} className="p-6 space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("lecturesPage.lectureName", "Lecture Name")}</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("lecturesPage.videoLink", "Video Link")}</span>
                  </label>
                  <input
                    type="url"
                    value={editForm.videoLink}
                    onChange={(e) => setEditForm({ ...editForm, videoLink: e.target.value })}
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("lecturesPage.description", "Description")}</span>
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="textarea textarea-bordered h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("lecturesPage.price", "Price")}</span>
                    </label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("lecturesPage.lectureType.label", "Lecture Type")}</span>
                    </label>
                    <select
                      value={editForm.lecture_type}
                      onChange={(e) => setEditForm({ ...editForm, lecture_type: e.target.value })}
                      className="select select-bordered"
                    >
                      <option value="">Select Type</option>
                      <option value="Free">{t("lecturesPage.lectureType.free", "Free")}</option>
                      <option value="Paid">{t("lecturesPage.lectureType.paid", "Paid")}</option>
                      <option value="Revision">{t("lecturesPage.lectureType.revision", "Revision")}</option>
                      <option value="Teachers Only">{t("lecturesPage.lectureType.teachersOnly", "Teachers Only")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("lecturesPage.subject", "Subject")}</span>
                    </label>
                    <select
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="select select-bordered"
                    >
                      <option value="">Select Subject</option>
                      {subjects?.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("lecturesPage.level", "Level")}</span>
                    </label>
                    <select
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      className="select select-bordered"
                    >
                      <option value="">Select Level</option>
                      {levels?.map((level) => (
                        <option key={level._id} value={level._id}>
                          {t(`gradeLevels.${level.name}`, { ns: "common" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t("lecturesPage.thumbnail", "Thumbnail")}</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, thumbnailFile: e.target.files[0] })}
                    className="file-input file-input-bordered"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-ghost"
                  >
                    {t("lecturesPage.buttons.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creationLoading}
                  >
                    {creationLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      t("lecturesPage.buttons.saveChanges", "Save Changes")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>{t("lecturesPage.tableHeaders.thumbnail")}</th> {/* ✅ new column */}
                <th>{t("lecturesPage.tableHeaders.name")}</th>
                {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && (
                  <th>{t("lecturesPage.tableHeaders.lecturer")}</th>
                )}
                <th>{t("lecturesPage.tableHeaders.subject")}</th>
                <th>{t("lecturesPage.tableHeaders.level")}</th>
                <th>{t("lecturesPage.tableHeaders.type")}</th>
                <th>{t("lecturesPage.tableHeaders.price")}</th>
                {userRole === "Student" && <th>{t("lecturesPage.tableHeaders.purchaseDate")}</th>}
                {userRole !== "Student" && <th>{t("lecturesPage.tableHeaders.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {lectures?.map((lecture) => (
                <tr key={lecture.id}>
                  <td>
                    {lecture.thumbnail ? (
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={convertPathToUrl(lecture.thumbnail) || "/placeholder.svg"}
                            alt={lecture.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="w-12 h-12 rounded-full bg-neutral-focus text-neutral-content flex items-center justify-center">
                          <span className="text-sm">N/A</span>
                        </div>
                      </div>
                    )}
                  </td>

                  <td>{lecture.name}</td>
                  {(userRole === "Student" || ["Admin", "Subadmin", "Moderator"].includes(userRole)) && (
                    <td>{lecture.lecturer?.name || t("lecturesPage.unknown")}</td>
                  )}
                  <td>{lecture.subject?.name || t("lecturesPage.notSpecified")}</td>
                  <td>
                    {t(`gradeLevels.${lecture.level?.name}`, { ns: "common" }) ||
                      lecture.level?.name ||
                      t("lecturesPage.notSpecified")}
                  </td>
                  <td>
                    {lecture.lecture_type === "Paid"
                      ? t("lecturesPage.lectureType.paid")
                      : t("lecturesPage.lectureType.review")}
                  </td>
                  <td>
                    {lecture.price || 0} {t("lecturesPage.points")}
                  </td>
                  {userRole === "Student" && <td>{lecture.purchasedAt}</td>}
                  {userRole !== "Student" && (
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/${userRole === "Student" ? "student" : "lecturer"}-dashboard/${userRole === "Student" ? "lecture-display" : "detailed-lecture-view"
                            }/${lecture.id}`}
                        >
                          <button className="btn-ghost btn-sm">{t("lecturesPage.buttons.details")}</button>
                        </Link>
                        {userRole === "Lecturer" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEditLecture(lecture)}
                          >
                            {t("lecturesPage.buttons.edit", "Edit")}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lectures.length === 0 && (
          <div className="alert alert-info mt-4">
            <span>
              {["Lecturer", "Admin", "Subadmin", "Moderator"].includes(userRole)
                ? t("lecturesPage.emptyStates.noLectures")
                : t("lecturesPage.emptyStates.noPurchases")}
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
              {t("lecturesPage.pagination.previous")}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
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
              {t("lecturesPage.pagination.next")}
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
