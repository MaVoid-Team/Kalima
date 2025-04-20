import React, { useState, useEffect } from "react";
import { FiX, FiFileText, FiChevronDown, FiUser, FiEdit, FiRotateCw, FiSearch } from "react-icons/fi";
import { FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";
import { getAuditLogs } from "../../../routes/auditlog";
import { Link } from "lucide-react";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userId: "",
    role: "",
    action: "",
    resourceType: "",
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
        const response = await getAuditLogs(page, limit, filters);
        if (response.status === "success") {
          setLogs(response.data.data.logs || []);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch audit logs");
          setLogs([]);
        }
      } catch (err) {
        setError("An error occurred while fetching audit logs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [page, limit, filters]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying new filters
  };

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
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>المستخدم</span>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link onClick={() => handleFilterChange('userId', '')}>الكل</Link></li>
            {/* You can populate this dynamically from unique users in logs */}
            {Array.from(new Set(logs.map(log => log.user?.userId))).map((userId, index) => (
              <li key={index}>
                <Link onClick={() => handleFilterChange('userId', userId)}>
                  {logs.find(log => log.user?.userId === userId)?.user?.name || userId}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={1} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الصلاحية</span>
          </label>
          <ul tabIndex={1} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link onClick={() => handleFilterChange('role', '')}>الكل</Link></li>
            <li><Link onClick={() => handleFilterChange('role', 'Admin')}>مسؤول</Link></li>
            <li><Link onClick={() => handleFilterChange('role', 'Lecturer')}>معلم</Link></li>
            <li><Link onClick={() => handleFilterChange('role', 'Student')}>طالب</Link></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={2} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الإجراء</span>
          </label>
          <ul tabIndex={2} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link onClick={() => handleFilterChange('action', '')}>الكل</Link></li>
            <li><Link onClick={() => handleFilterChange('action', 'read')}>قراءة</Link></li>
            <li><Link onClick={() => handleFilterChange('action', 'update')}>تعديل</Link></li>
            <li><Link onClick={() => handleFilterChange('action', 'delete')}>حذف</Link></li>
            <li><Link onClick={() => handleFilterChange('action', 'create')}>إنشاء</Link></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={3} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>العنصر المتأثر</span>
          </label>
          <ul tabIndex={3} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link onClick={() => handleFilterChange('resourceType', '')}>الكل</Link></li>
            <li><Link onClick={() => handleFilterChange('resourceType', 'container')}>كورس</Link></li>
            <li><Link onClick={() => handleFilterChange('resourceType', 'lecture')}>درس</Link></li>
            <li><Link onClick={() => handleFilterChange('resourceType', 'user')}>مستخدم</Link></li>
            <li><Link onClick={() => handleFilterChange('resourceType', 'timetable')}>جدول زمني</Link></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={5} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الحالة</span>
          </label>
          <ul tabIndex={5} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link onClick={() => handleFilterChange('status', '')}>الكل</Link></li>
            <li><Link onClick={() => handleFilterChange('status', 'success')}>ناجح</Link></li>
            <li><Link onClick={() => handleFilterChange('status', 'failed')}>فشل</Link></li>
          </ul>
        </div>
        
        <button className="btn btn-info text-white rounded-full gap-2" onClick={applyFilters}>
          <FiRotateCw className="h-5 w-5" />
          <span>تطبيق الفلتر</span>
        </button>
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