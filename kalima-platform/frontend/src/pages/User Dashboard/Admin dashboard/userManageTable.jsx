import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, createUser } from "../../../routes/fetch-users";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync } from "react-icons/fa";
import Pagination from "../../../components/Pagination"; // Import the Pagination component
import CreateUserModal from "../../../components/CreateUserModal"; // Import the CreateUserModal component

const UserManagementTable = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    role: "",
    status: ""
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users whenever filters or users change
  useEffect(() => {
    applyFilters();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters, users]);

  const applyFilters = () => {
    let filtered = users;

    if (filters.name) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.phone) {
      filtered = filtered.filter(user => 
        user.phoneNumber?.includes(filters.phone)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => 
        user.role.toLowerCase() === filters.role.toLowerCase()
      );
    }

    if (filters.status) {
      filtered = filtered.filter(user => 
        getStatus(user) === filters.status
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: "طالب",
      parent: "ولي أمر",
      lecturer: "معلم",
      teacher: "معلم",
      assistant: "مساعد",
      admin: "أدمن"
    };
    return roles[role.toLowerCase()] || role;
  };

  const getStatus = (user) => {
    if (!user.phoneNumber) return "بيانات ناقصة";
    if (user.role === "student" && !user.level) return "بيانات ناقصة";
    return "صالح";
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      setError(null);
      const result = await createUser(userData);
      if (result.success) {
        setUsers(prev => [...prev, result.data]);
        setShowCreateModal(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Handle page change from Pagination component
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !showCreateModal) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl font-sans w-full mx-auto p-4 my-14 border border-slate-100" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-right">سجل الاجراءات</h1>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-8 justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="الاسم"
            className="input input-bordered"
            value={filters.name}
            onChange={e => setFilters({...filters, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="رقم الهاتف"
            className="input input-bordered"
            value={filters.phone}
            onChange={e => setFilters({...filters, phone: e.target.value})}
          />
          <select
            className="select select-bordered"
            value={filters.role}
            onChange={e => setFilters({...filters, role: e.target.value})}
          >
            <option value="">كل الأنواع</option>
            <option value="student">طالب</option>
            <option value="parent">ولي أمر</option>
            <option value="lecturer">معلم</option>
          </select>
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">كل الحالات</option>
            <option value="صالح">صالح</option>
            <option value="بيانات ناقصة">بيانات ناقصة</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            إنشاء مستخدم جديد
          </button>
          <button className="btn btn-ghost" onClick={fetchUsers}>
            <FaSync />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="text-right">
              <th className="pb-4 text-lg font-medium">الإجراءات</th>
              <th className="pb-4 text-lg font-medium">الحالة</th>
              <th className="pb-4 text-lg font-medium">نوع الحساب</th>
              <th className="pb-4 text-lg font-medium">رقم الهاتف</th>
              <th className="pb-4 text-lg font-medium">الاسم</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id} className="border-t border-none">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      className="btn btn-error btn-xs"
                      onClick={() => handleDelete(user._id)}
                    >
                      حذف
                    </button>
                    <button className="btn btn-warning btn-xs">
                      تعديل
                    </button>
                  </div>
                </td>
                <td className="py-4">{getStatus(user)}</td>
                <td className="py-4">{getRoleLabel(user.role)}</td>
                <td className="py-4">{user.phoneNumber || "N/A"}</td>
                <td className="py-4">{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination 
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={usersPerPage}
        onPageChange={handlePageChange}
        labels={{
          previous: "السابق",
          next: "التالي",
          showing: "عرض",
          of: "من"
        }}
      />

      {/* Create User Modal Component */}
      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateUser={handleCreateUser}
        error={error}
      />
    </div>
  );
};

export default UserManagementTable;