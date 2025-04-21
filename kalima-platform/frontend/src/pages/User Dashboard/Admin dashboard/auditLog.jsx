import React, { useState, useEffect } from "react";
import { FiX, FiFileText, FiChevronDown, FiUser, FiEdit, FiRotateCw, FiSearch } from "react-icons/fi";
import { FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";
import { getAuditLogs } from "../../../routes/auditlog";
import Link from "react-router-dom";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // NOTE: keys now match server-side param names
  const [filters, setFilters] = useState({
    user: "",
    role: "",
    action: "",
    resource_type: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch audit logs on component mount and when filters change
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit, ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "")
        )};
        const response = await getAuditLogs(params.page, params.limit, params);
        if (response.status === "success") {
          setLogs(response.data.logs || []);
          setError(null);
        } else {
          setError(response.error);
          setLogs([]);
        }
      } catch (e) {
        setError("Error fetching logs");
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [page, limit, filters]);

  useEffect(() => {
    const fetch = async () => {
      const params = { page, limit, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const res = await getAuditLogs(page, limit, params);
      if (res.status === "success") setLogs(res.data.logs);
    };
    fetch();
  }, [page, filters ,limit]);
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const applyFilters = () => setPage(1);

  // Prepare label text based on current selection
  const userNameMap = logs.reduce((m, log) => {
    if (log.user?.userId) m[log.user.userId] = log.user.name;
    return m;
  }, {});
  const selectedUserLabel = filters.userId ? (userNameMap[filters.userId] || 'مستخدم غير معروف') : 'المستخدم';
  const selectedRoleLabel = filters.role
    ? (filters.role === 'Admin' ? 'مسؤول' : filters.role === 'Lecturer' ? 'معلم' : 'طالب')
    : 'الصلاحية';
  const selectedActionLabel = filters.action
    ? (filters.action === 'read' ? 'قراءة' : filters.action === 'update' ? 'تعديل' : filters.action === 'delete' ? 'حذف' : 'إنشاء')
    : 'العملية';
  const selectedResourceLabel = filters.resourceType
    ? (filters.resourceType === 'container' ? 'كورس'
       : filters.resourceType === 'lecture' ? 'درس'
       : filters.resourceType === 'user' ? 'مستخدم'
       : 'جدول زمني')
    : 'العنصر المتأثر';
  const selectedStatusLabel = filters.status
    ? (filters.status === 'success' ? 'نجاح' : 'فشل')
    : 'الحالة'; 



  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon for action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'delete':
        return (
          <div className="badge badge-error badge-sm p-3">
            <FiX className="h-4 w-4 text-white" />
          </div>
        );
      case 'update':
      case 'edit':
        return (
          <div className="badge badge-warning badge-sm p-3">
            <FiEdit className="h-4 w-4 text-white" />
          </div>
        );
      case 'read':
        return (
          <div className="badge badge-neutral badge-sm p-3">
            <FiFileText className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="badge badge-info badge-sm p-3">
            <FiRotateCw className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  // Get icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-success" />;
      case 'pending':
        return <FaHourglassHalf className="h-5 w-5 text-amber-700" />;
      case 'failed':
        return <FaExclamationTriangle className="h-5 w-5 text-warning" />;
      default:
        return <FaCheckCircle className="h-5 w-5 text-success" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-full p-4 md:p-8 lg:p-20 bg-base-100 min-h-screen bg-gradient-to-br" dir="rtl">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">سجل العمليات</h1>
        <p className="text-gray-600 mt-2">عرض وتتبع جميع العمليات التي تمت على النظام</p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="البحث في سجل العمليات..." 
            className="input input-bordered w-full pr-10" 
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 justify-start">
  {/* User Filter */}
  <div className="dropdown dropdown-end">
          <label tabIndex={0}
            className="btn btn-outline text-base-content rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>{selectedUserLabel}</span>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <button
                className="w-full text-left"
                onClick={() => handleFilterChange('userId', '')}
              >
                الكل
              </button>
            </li>
            {Array.from(new Set(logs.filter(l => l.user?.userId).map(l => l.user.userId)))
              .map((uid, i) => (
                <li key={i}>
                  <button
                    className="w-full text-left"
                    onClick={() => handleFilterChange('userId', uid)}
                  >
                    {userNameMap[uid]}
                  </button>
                </li>
            ))}
          </ul>
        </div>

  {/* Role Filter */}
  <div className="dropdown dropdown-end">
          <label tabIndex={1}
            className="btn btn-outline text-base-content rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>{selectedRoleLabel}</span>
          </label>
          <ul tabIndex={1} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <button className="w-full text-left" onClick={() => handleFilterChange('role', '')}>
                الكل
              </button>
            </li>
            {['Admin','Lecturer','Student'].map((r, i) => (
              <li key={i}>
                <button
                  className="w-full text-left"
                  onClick={() => handleFilterChange('role', r)}
                >
                  {r === 'Admin' ? 'مسؤول' : r === 'Lecturer' ? 'معلم' : 'طالب'}
                </button>
              </li>
            ))}
          </ul>
        </div>

  {/* Action Filter */}
  <div className="dropdown dropdown-end">
    <label
      tabIndex={2}
      className="btn btn-outline text-base-content rounded-full min-w-[180px] flex justify-between"
    >
      <FiChevronDown className="h-5 w-5" />
      <span>{selectedActionLabel}</span>
    </label>
    <ul
      tabIndex={2}
      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
    >
      <li>
        <button className="w-full text-left" onClick={() => handleFilterChange('action', '')}>
          الكل
        </button>
      </li>
      {['read', 'update', 'delete', 'create'].map((act, i) => (
        <li key={i}>
          <button
            className="w-full text-left"
            onClick={() => handleFilterChange('action', act)}
          >
            {act === 'read' ? 'قراءة'
              : act === 'update' ? 'تعديل'
              : act === 'delete' ? 'حذف'
              : 'إنشاء'}
          </button>
        </li>
      ))}
    </ul>
  </div>

  {/* Resource Type Filter */}
  <div className="dropdown dropdown-end">
          <label tabIndex={3}
            className="btn btn-outline text-base-content rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>{selectedResourceLabel}</span>
          </label>
          <ul tabIndex={3} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <button className="w-full text-left" onClick={() => handleFilterChange('resourceType', '')}>
                الكل
              </button>
            </li>
            {['container','lecture','user','timetable'].map((type, i) => (
              <li key={i}>
                <button
                  className="w-full text-left"
                  onClick={() => handleFilterChange('resourceType', type)}
                >
                  {type === 'container' ? 'كورس'
                    : type === 'lecture' ? 'درس'
                    : type === 'user' ? 'مستخدم'
                    : 'جدول زمني'}
                </button>
              </li>
            ))}
          </ul>
        </div>


  {/* Status Filter */}
  <div className="dropdown dropdown-end">
    <label
      tabIndex={5}
      className="btn btn-outline text-base-content rounded-full min-w-[180px] flex justify-between"
    >
      <FiChevronDown className="h-5 w-5" />
      <span>{selectedStatusLabel}</span>
    </label>
    <ul
      tabIndex={5}
      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
    >
      <li>
        <button className="w-full text-left" onClick={() => handleFilterChange('status', '')}>
          الكل
        </button>
      </li>
      {['success','failed'].map((st, i) => (
        <li key={i}>
          <button
            className="w-full text-left"
            onClick={() => handleFilterChange('status', st)}
          >
            {st === 'success' ? 'ناجح' : 'فشل'}
          </button>
        </li>
      ))}
    </ul>
  </div>

  {/* Apply Filters Button */}
  <button className="btn btn-info text-white rounded-full gap-2" onClick={applyFilters}>
    <FiRotateCw className="h-5 w-5" />
    <span>تطبيق الفلتر</span>
  </button>
</div>
      
          {/* Date Filter */}
            <div className="flex items-center gap-2">
        <input
          type="date"
          className="input input-bordered"
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <span>إلى</span>
        <input
          type="date"
          className="input input-bordered"
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="loading loading-spinner loading-lg text-info"></div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-6">
          <FiX className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Headers */}
            <thead>
              <tr className="text-right">
                <th className="text-right">المستخدم</th>
                <th className="text-right">الصلاحية</th>
                <th className="text-right">الإجراء</th>
                <th className="text-right">العنصر المتأثر</th>
                <th className="text-right">التاريخ و الوقت</th>
                <th className="text-right">الحالة</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">لا توجد سجلات متاحة</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover">
                    <td className="text-right">{log.user?.name || "غير معروف"}</td>
                    <td className="text-right">{log.user?.role || "غير محدد"}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-start gap-2">
                        <span>
                          {log.action === "read" ? "قراءة" : 
                           log.action === "update" ? "تعديل" : 
                           log.action === "delete" ? "حذف" : 
                           log.action === "create" ? "إنشاء" : log.action}
                        </span>
                        {getActionIcon(log.action)}
                      </div>
                    </td>
                    <td className="text-right">
                      {log.resource?.type && (
                        <div className="flex items-center justify-start gap-2">
                          <span>
                            {log.resource.type === "container" ? "كورس" : 
                             log.resource.type === "lecture" ? "درس" : 
                             log.resource.type === "user" ? "مستخدم" : 
                             log.resource.type === "timetable" ? "جدول زمني" : 
                             log.resource.type}
                            {log.resource.name ? `: ${log.resource.name}` : 
                             log.resource.id ? `: ${log.resource.id.substring(0, 8)}...` : ""}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex flex-col">
                        <span>{formatDate(log.timestamp)}</span>
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-start gap-2">
                        <span>
                          {log.status === "success" ? "ناجح" : 
                           log.status === "failed" ? "فشل" : 
                           log.status === "pending" ? "قيد المعالجة" : log.status}
                        </span>
                        {getStatusIcon(log.status)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="btn-group">
            <button 
              className="btn btn-outline" 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              السابق
            </button>
            <button className="btn btn-outline">{page}</button>
            <button 
              className="btn btn-outline" 
              onClick={() => setPage(prev => prev + 1)}
              disabled={logs.length < limit}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;