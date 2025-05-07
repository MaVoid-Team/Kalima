"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserDashboard } from "../../../routes/auth-services"
import { getAllSubjects } from "../../../routes/courses"
import { getAllLevels } from "../../../routes/levels"
import { createLecture } from "../../../routes/lectures"

const MyLecturesPage = () => {
    const [lectures, setLectures] = useState([])
    const [subjects, setSubjects] = useState([]) // Initialize as empty array
    const [levels, setLevels] = useState([]) // Initialize as empty array
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [renderError, setRenderError] = useState(null) // For catching render errors
    const [userRole, setUserRole] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "lecture",
        createdBy: "",
        level: "",
        subject: "",
        price: 0,
        description: "",
        numberOfViews: 3,
        videoLink: "",
        teacherAllowed: true,
        lecture_type: "Paid",
        requiresExam: false,
        examConfig: "",
        passingThreshold: 50
    })
    const [formError, setFormError] = useState(null)
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("")
    const [selectedLevelFilter, setSelectedLevelFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch subjects and levels first (needed for all roles for the modal/filters)
                const subjectsRes = await getAllSubjects();
                const levelsRes = await getAllLevels();

                // Handle subjects fetch result
                if (subjectsRes.success) {
                    setSubjects(subjectsRes.data || []); // Ensure subjects is an array
                } else {
                    console.error("Failed to fetch subjects:", subjectsRes.error);
                    setSubjects([]); // Set to empty array on failure
                    setError("فشل في تحميل المواد، لكن يمكنك المتابعة.");
                }

                // Handle levels fetch result
                if (levelsRes.success) {
                    setLevels(levelsRes.data?.levels || []); // Ensure levels is an array
                } else {
                    console.error("Failed to fetch levels:", levelsRes.error);
                    setLevels([]); // Set to empty array on failure
                    setError(prev => prev ? `${prev} فشل في تحميل المستويات، لكن يمكنك المتابعة.` : "فشل في تحميل المستويات، لكن يمكنك المتابعة.");
                }

                // Fetch dashboard data to get user role
                const result = await getUserDashboard({
                    params: { fields: 'userInfo,containers,purchaseHistory', limit: 100 }
                });

                if (result.success) {
                    const { userInfo } = result.data.data;
                    setUserRole(userInfo.role);
                    setFormData(prev => ({ ...prev, createdBy: userInfo._id }));

                    // Fetch lectures only for Student and Lecturer roles
                    let lecturesData = [];
                    if (userInfo.role === 'Student') {
                        lecturesData = result.data.data.purchaseHistory
                            ?.filter(p => p.container?.type === 'lecture')
                            .map(p => ({
                                id: p.container?._id || p._id,
                                name: p.container?.name || p.description.replace('Purchased container ', '').split(' for ')[0],
                                price: p.points,
                                videoLink: p.container?.videoLink,
                                lecture_type: p.container?.lecture_type,
                                purchasedAt: new Date(p.purchasedAt).toLocaleString('en-gb', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }),
                                lecturer: p.lecturer,
                                subject: p.container?.subject,
                                level: p.container?.level
                            })) || [];
                    } else if (userInfo.role === 'Lecturer') {
                        lecturesData = result.data.data.containers
                            ?.filter(c => c.type === 'lecture')
                            .map(lecture => ({
                                id: lecture._id,
                                name: lecture.name,
                                subject: lecture.subject,
                                level: lecture.level,
                                price: lecture.price,
                                videoLink: lecture.videoLink,
                                lecture_type: lecture.lecture_type,
                                createdAt: new Date(lecture.createdAt).toLocaleString('en-gb', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }),
                                lecturer: userInfo,
                            })) || [];
                    } else if (['Admin', 'Subadmin', 'Moderator', 'Assistant'].includes(userInfo.role)) {
                        lecturesData = result.data.data.containers
                            ?.filter(c => c.type === 'lecture')
                            .map(lecture => ({
                                id: lecture._id,
                                name: lecture.name,
                                subject: lecture.subject,
                                level: lecture.level,
                                price: lecture.price,
                                videoLink: lecture.videoLink,
                                lecture_type: lecture.lecture_type,
                                createdAt: new Date(lecture.createdAt).toLocaleString('en-gb', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }),
                                lecturer: userInfo,
                            })) || [];
                    }

                    // Apply filters if any
                    let filteredLectures = lecturesData;
                    if (selectedSubjectFilter) {
                        filteredLectures = filteredLectures.filter(l => l.subject?._id === selectedSubjectFilter);
                    }
                    if (selectedLevelFilter) {
                        filteredLectures = filteredLectures.filter(l => l.level?._id === selectedLevelFilter);
                    }

                    setLectures(applyPagination(filteredLectures, currentPage, itemsPerPage));
                    setTotalPages(Math.ceil(filteredLectures.length / itemsPerPage));
                } else {
                    setError("فشل في تحميل بيانات المستخدم، لكن يمكنك المتابعة.");
                }
            } catch (err) {
                console.error("Error in fetchInitialData:", err);
                setError("فشل في تحميل البيانات، لكن يمكنك المتابعة.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [currentPage, itemsPerPage, selectedSubjectFilter, selectedLevelFilter]);

    const applyPagination = (items, page, limit) => {
        const startIndex = (page - 1) * limit;
        return items.slice(startIndex, startIndex + limit);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreateLecture = async () => {
        if (!formData.name || !formData.level || !formData.subject || !formData.videoLink) {
            setFormError("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        if (formData.requiresExam && !formData.examConfig) {
            setFormError("يرجى إدخال رابط ملف الامتحان");
            return;
        }

        setFormError(null);

        try {
            const lectureData = {
                name: formData.name,
                type: formData.type,
                createdBy: formData.createdBy,
                level: formData.level,
                subject: formData.subject,
                price: Number(formData.price),
                description: formData.description,
                numberOfViews: Number(formData.numberOfViews),
                videoLink: formData.videoLink,
                teacherAllowed: formData.teacherAllowed,
                lecture_type: formData.lecture_type,
                requiresExam: formData.requiresExam
            };

            if (formData.requiresExam) {
                lectureData.examConfig = formData.examConfig;
                lectureData.passingThreshold = Number(formData.passingThreshold);
            }

            const response = await createLecture(lectureData);
            console.log("Create Lecture Response:", response);

            if (response.status === "success") {
                setShowCreateModal(false);
                setFormData({
                    name: "",
                    type: "lecture",
                    createdBy: formData.createdBy,
                    level: "",
                    subject: "",
                    price: 0,
                    description: "",
                    numberOfViews: 3,
                    videoLink: "",
                    teacherAllowed: true,
                    lecture_type: "Paid",
                    requiresExam: false,
                    examConfig: "",
                    passingThreshold: 50
                });

                if (['Lecturer', 'Admin', 'Subadmin', 'Moderator', 'Assistant'].includes(userRole)) {
                    const result = await getUserDashboard({
                        params: { fields: 'userInfo,containers,purchaseHistory', limit: 100 }
                    });

                    if (result.success) {
                        const allLectures = result.data.data.containers
                            ?.filter(c => c.type === 'lecture')
                            .map(lecture => ({
                                id: lecture._id,
                                name: lecture.name,
                                subject: lecture.subject,
                                level: lecture.level,
                                price: lecture.price,
                                videoLink: lecture.videoLink,
                                lecture_type: lecture.lecture_type,
                                requiresExam: lecture.requiresExam,
                                examConfig: lecture.examConfig,
                                createdAt: new Date(lecture.createdAt).toLocaleString('en-gb', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }),
                                lecturer: result.data.data.userInfo,
                            })) || [];
                        let filteredLectures = allLectures;
                        if (selectedSubjectFilter) {
                            filteredLectures = filteredLectures.filter(l => l.subject?._id === selectedSubjectFilter);
                        }
                        if (selectedLevelFilter) {
                            filteredLectures = filteredLectures.filter(l => l.level?._id === selectedLevelFilter);
                        }
                        setLectures(applyPagination(filteredLectures, currentPage, itemsPerPage));
                        setTotalPages(Math.ceil(filteredLectures.length / itemsPerPage));
                    }
                }
            } else {
                setFormError("فشل إنشاء المحاضرة");
            }
        } catch (err) {
            setFormError("فشل إنشاء المحاضرة: " + err.message);
        }
    };

    if (loading) return <div className="loading loading-spinner text-primary"></div>;

    // Basic error boundary for rendering
    try {
        return (
            <div className="container mx-auto p-4" dir="rtl">
                <h1 className="text-2xl font-bold mb-6">
                    {['Lecturer', 'Admin', 'Subadmin', 'Moderator', 'Assistant'].includes(userRole)
                        ? 'إدارة المحاضرات'
                        : 'المحاضرات المشتراة'}
                </h1>

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
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        >
                            <option value="">كل المواد</option>
                            {subjects && subjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="select select-bordered w-full md:w-64"
                            value={selectedLevelFilter}
                            onChange={(e) => setSelectedLevelFilter(e.target.value)}
                        >
                            <option value="">كل المستويات</option>
                            {levels && levels.map(level => (
                                <option key={level._id} value={level._id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {['Lecturer', 'Admin', 'Subadmin', 'Moderator', 'Assistant'].includes(userRole) && (
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
                        <div className="modal-box max-w-2xl">
                            <h3 className="font-bold text-lg">إنشاء محاضرة جديدة</h3>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">اسم المحاضرة</span></label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input input-bordered" required />
                                    </div>

                                    <div className="form-control">
                                        <label className="label"><span className="label-text">نوع المحاضرة</span></label>
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

                                    <div className="form-control">
                                        <label className="label"><span className="label-text">المستوى</span></label>
                                        <select
                                            name="level"
                                            value={formData.level}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            <option value="">اختر المستوى</option>
                                            {levels && levels.map(level => (
                                                <option key={level._id} value={level._id}>{level.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label"><span className="label-text">المادة</span></label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="select select-bordered"
                                            required
                                        >
                                            <option value="">اختر المادة</option>
                                            {subjects && subjects.map(subject => (
                                                <option key={subject._id} value={subject._id}>{subject.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label"><span className="label-text">السعر</span></label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            min="0"
                                            disabled={formData.lecture_type === "Revision"}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label"><span className="label-text">رابط الفيديو</span></label>
                                        <input
                                            type="url"
                                            name="videoLink"
                                            value={formData.videoLink}
                                            onChange={handleInputChange}
                                            className="input input-bordered"
                                            placeholder="https://example.com/video"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">الوصف</span></label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="textarea textarea-bordered h-24" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">تحتاج إلى امتحان؟</span>
                                            <input
                                                type="checkbox"
                                                name="requiresExam"
                                                checked={formData.requiresExam}
                                                onChange={handleInputChange}
                                                className="checkbox"
                                            />
                                        </label>
                                    </div>

                                    {formData.requiresExam && (
                                        <>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">رابط ملف الامتحان</span></label>
                                                <input
                                                    type="url"
                                                    name="examConfig"
                                                    value={formData.examConfig}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered"
                                                    placeholder="https://example.com/exam-config"
                                                    required={formData.requiresExam}
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">عتبة النجاح (%)</span></label>
                                                <input
                                                    type="number"
                                                    name="passingThreshold"
                                                    value={formData.passingThreshold}
                                                    onChange={handleInputChange}
                                                    className="input input-bordered"
                                                    min="0"
                                                    max="100"
                                                    required={formData.requiresExam}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {formError && <div className="alert alert-error mt-2">{formError}</div>}
                            </div>
                            <div className="modal-action">
                                <button className="btn" onClick={() => setShowCreateModal(false)}>إلغاء</button>
                                <button className="btn btn-primary" onClick={handleCreateLecture}>إنشاء</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                {userRole === 'Student' && <th>المحاضر</th>}
                                <th>المادة</th>
                                <th>المستوى</th>
                                <th>النوع</th>
                                <th>السعر</th>
                                {userRole === 'Student' ? <th>تاريخ الشراء</th> : <th>تاريخ الإنشاء</th>}
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lectures && lectures.map(lecture => (
                                <tr key={lecture.id}>
                                    <td>{lecture.name}</td>
                                    {userRole === 'Student' && <td>{lecture.lecturer?.name || 'غير معروف'}</td>}
                                    <td>{lecture.subject?.name || 'غير محدد'}</td>
                                    <td>{lecture.level?.name || 'غير محدد'}</td>
                                    <td>{lecture.lecture_type === "Paid" ? "مدفوعة" : "مراجعة"}</td>
                                    <td>{lecture.price || 0} نقطة</td>
                                    <td>{userRole === 'Student' ? lecture.purchasedAt : lecture.createdAt}</td>
                                    <td>
                                        <Link to={userRole === 'Student' ? `/dashboard/student-dashboard/lecture-display/${lecture.id}` : `/dashboard/lecturer-dashboard/lecture-display/${lecture.id}`} className="btn btn-ghost btn-sm">
                                            التفاصيل
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {lectures.length === 0 && (
                    <div className="alert alert-info mt-4">
                        <span>{['Lecturer', 'Admin', 'Subadmin', 'Moderator', 'Assistant'].includes(userRole) ? 'لا توجد محاضرات متاحة' : 'لم تقم بشراء أي محاضرات بعد'}</span>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="join flex justify-center mt-4">
                        <button className="join-item btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>السابق</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} className={`join-item btn ${currentPage === i + 1 ? 'btn-active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="join-item btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>التالي</button>
                    </div>
                )}
            </div>
        );
    } catch (err) {
        console.error("Render error in MyLecturesPage:", err);
        setRenderError("حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.");
        return (
            <div className="container mx-auto p-4" dir="rtl">
                <div className="alert alert-error">
                    <span>{renderError}</span>
                </div>
            </div>
        );
    }
};

export default MyLecturesPage