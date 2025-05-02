import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAllAttendance } from "../../routes/center";

const ActivityTracker = ({ lessonId, students }) => {
  const { t, i18n } = useTranslation("centerDashboard");
  const isRTL = i18n.language === "ar";
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllAttendance();
        if (response.status === "success") {
          // Filter attendance records for the specific lesson
          const filteredAttendance = response.data.filter(
            (attendance) => attendance.lesson._id === lessonId
          );
          setAttendanceData(filteredAttendance);
        } else {
          throw new Error(response.message || "Failed to fetch attendance data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchAttendance();
    }
  }, [lessonId]);

  // Format date based on locale
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-secondary p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <p className="text-xl text-base-content">
              {t("activityTracker.header.title")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary">
            {t("activityTracker.buttons.sendNotifications")}
          </button>
          <button className="btn btn-sm btn-primary">
            {t("activityTracker.buttons.publishResults")}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-x-2 mt-1">
              <span className="text-xl font-bold text-base-content">
                {t("activityTracker.statusCounts.present", {
                  count: attendanceData.filter(
                    (a) => a.examStatus === "passed"
                  ).length,
                })}
              </span>
              <span className="text-sm text-base-content">
                {t("activityTracker.statusCounts.absent", {
                  count: attendanceData.filter(
                    (a) => !a.examStatus || a.examStatus !== "passed"
                  ).length,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : attendanceData.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr className="border-b border-base-200">
                <th className={isRTL ? "text-right" : "text-left"}>
                  {t("activityTracker.columns.studentName")}
                </th>
                <th className={isRTL ? "text-right" : "text-left"}>
                  {t("activityTracker.columns.passFail")}
                </th>
                <th className={isRTL ? "text-right" : "text-left"}>
                  {t("activityTracker.columns.score")}
                </th>
                <th className={isRTL ? "text-right" : "text-left"}>
                  {t("activityTracker.columns.timeSpent")}
                </th>
                <th className={isRTL ? "text-right" : "text-left"}>
                  {t("activityTracker.columns.submissionTime")}
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((attendance) => (
                <tr
                  key={attendance._id}
                  className="hover:bg-base-200 border-b border-base-200"
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={`https://randomuser.me/api/portraits/${
                              attendance.student.gender === "female"
                                ? "women"
                                : "men"
                            }/${attendance.student.center_students_seq % 20 + 1}.jpg`}
                            alt={attendance.student.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://www.gravatar.com/avatar/?d=mp";
                            }}
                          />
                        </div>
                      </div>
                      <span>{attendance.student.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        attendance.examStatus === "passed"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {t(
                        `activityTracker.status.${
                          attendance.examStatus === "passed" ? "pass" : "fail"
                        }`
                      )}
                    </span>
                  </td>
                  <td>
                    {attendance.examScore}/{attendance.examMaxScore || 100}
                  </td>
                  <td>
                    {attendance.attendanceDuration || 0}{" "}
                    {t("activityTracker.time.minutes")}
                  </td>
                  <td>{formatDate(attendance.attendanceDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-base-content/70">
            {t("activityTracker.noResults")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTracker;