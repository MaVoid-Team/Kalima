import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, createUser } from "../../../../routes/fetch-users";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync, FaWhatsapp } from "react-icons/fa";
import Pagination from "../../../../components/Pagination"; // Import the Pagination component
import CreateUserModal from "../CreateUserModal/CreateUserModal"; // Import the CreateUserModal component

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
  const [whatsappModal, setWhatsappModal] = useState({
    isOpen: false,
    phoneNumber: "",
    userName: ""
  });
  const [whatsappMessage, setWhatsappMessage] = useState("");
  
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

  // Open WhatsApp modal
  const openWhatsappModal = (phoneNumber, userName) => {
    if (!phoneNumber) {
      alert("لا يوجد رقم هاتف لهذا المستخدم");
      return;
    }
    
    setWhatsappModal({
      isOpen: true,
      phoneNumber,
      userName
    });
    setWhatsappMessage("");
  };

  // Send WhatsApp message
  const sendWhatsappMessage = () => {
    // Format phone number (remove any non-digit characters and ensure it starts with country code)
    let formattedNumber = whatsappModal.phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, add Egypt's code (+20)
    if (!formattedNumber.startsWith('2')) {
      formattedNumber = '2' + formattedNumber;
    }
    
    // Create WhatsApp URL with phone number and message
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Close the modal
    setWhatsappModal({
      isOpen: false,
      phoneNumber: "",
      userName: ""
    });
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
                <td className="py-4 flex items-center gap-2">
                  {user.name}
                  {user.phoneNumber && (
                    <button 
                      className="btn btn-circle btn-xs btn-success"
                      onClick={() => openWhatsappModal(user.phoneNumber, user.name)}
                      title="إرسال رسالة واتساب"
                    >
                      <FaWhatsapp className="text-white" />
                    </button>
                  )}
                </td>
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

      {/* WhatsApp Message Modal */}
      {whatsappModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" dir="rtl">
            <h3 className="text-xl font-bold mb-4">إرسال رسالة واتساب</h3>
            <p className="mb-2">إرسال رسالة إلى: <span className="font-bold">{whatsappModal.userName}</span></p>
            <p className="mb-4">رقم الهاتف: <span className="font-bold">{whatsappModal.phoneNumber}</span></p>
            
            <textarea
              className="textarea textarea-bordered w-full h-32 mb-4"
              placeholder="اكتب رسالتك هنا..."
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-ghost"
                onClick={() => setWhatsappModal({isOpen: false, phoneNumber: "", userName: ""})}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-success gap-2"
                onClick={sendWhatsappMessage}
              >
                <FaWhatsapp /> إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;