import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, createUser } from "../../../../routes/fetch-users";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync, FaWhatsapp } from "react-icons/fa";
import Pagination from "../../../../components/Pagination"; // Import the Pagination component
import CreateUserModal from "../CreateUserModal/CreateUserModal"; // Import the CreateUserModal component

const UserManagementTable = () => {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
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
        setError(t('admin.errors.fetchUsers'));
      }
    } catch (error) {
      setError(t('admin.errors.fetchUsers'));
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

  useEffect(() => { applyFilters(); setCurrentPage(1); }, [filters, users]);

  const applyFilters = () => {
    const filtered = users.filter(user => 
      (!filters.name || user.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.phone || user.phoneNumber?.includes(filters.phone)) &&
      (!filters.role || user.role.toLowerCase() === filters.role.toLowerCase()) &&
      (!filters.status || getStatus(user) === filters.status)
    );
    setFilteredUsers(filtered);
  };

  const getRoleLabel = (role) => t(`admin.roles.${role.toLowerCase()}`);

  const getStatus = (user) => {
    if (!user.phoneNumber) return t('admin.status.missingData');
    if (user.role === "student" && !user.level) return t('admin.status.missingData');
    return t('admin.status.valid');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    
    try {
      const result = await deleteUser(userId);
      if (result.success) setUsers(prev => prev.filter(u => u._id !== userId));
      else setError(result.error);
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
    <div className="rounded-xl font-sans w-full mx-auto p-4 my-14 border border-slate-100" dir={dir}>
      <h1 className={`text-3xl font-bold mb-8 ${dir === "rtl" ? "text-right" : "text-left"} `}>{t('admin.userManagement.title')}</h1>

      <div className="flex flex-wrap gap-4 mb-8 justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder={t('admin.filters.name')}
            className="input input-bordered"
            value={filters.name}
            onChange={e => setFilters({...filters, name: e.target.value})}
          />
          <input
            type="text"
            placeholder={t('admin.filters.phone')}
            className="input input-bordered"
            value={filters.phone}
            onChange={e => setFilters({...filters, phone: e.target.value})}
          />
          <select
            className="select select-bordered"
            value={filters.role}
            onChange={e => setFilters({...filters, role: e.target.value})}
          >
            <option value="">{t('admin.filters.allTypes')}</option>
            {['student', 'parent', 'lecturer'].map(role => (
              <option key={role} value={role}>{t(`admin.roles.${role}`)}</option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">{t('admin.filters.allStatus')}</option>
            <option value={t('admin.status.valid')}>{t('admin.status.valid')}</option>
            <option value={t('admin.status.missingData')}>{t('admin.status.missingData')}</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            {t('admin.userManagement.createUser')}
          </button>
          <button className="btn btn-ghost" onClick={fetchUsers}>
            <FaSync />
          </button>
        </div>
      </div>

      <div className="w-full overflow-auto" dir={`${dir === "rtl" ? "ltr" : "rtl"}`}  >
        <table className="w-full">
          <thead>
            <tr className={`${dir === "rtl" ? "text-right" : "text-left"}`}>
              {['actions', 'status', 'accountType', 'phone', 'name'].map(header => (
                <th key={header} className="pb-4 text-lg font-medium">
                  {t(`admin.table.${header}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody dir={`${dir === "rtl" ? "ltr" : "rtl"}`}>
            {currentUsers.map((user) => (
              <tr key={user._id} className={`${dir === "rtl" ? "text-right" : "text-left"} border-t border-none `}>
                <td className="py-4">
                  <div className={`flex items-center ${dir === "rtl" ? "justify-end" : "justify-end"} mx-auto gap-3`}>
                    <button 
                      className="btn btn-error btn-xs"
                      onClick={() => handleDelete(user._id)}
                    >
                      {t('admin.actions.delete')}
                    </button>
                    <button className="btn btn-warning btn-xs">
                      {t('admin.actions.edit')}
                    </button>
                  </div>
                </td>
                <td className="py-4">{getStatus(user)}</td>
                <td className="py-4">{getRoleLabel(user.role)}</td>
                <td className="py-4">{user.phoneNumber || t('admin.NA')}</td>
                <td className="py-4">{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={usersPerPage}
        onPageChange={handlePageChange}
        labels={{
          previous: t('admin.pagination.previous'),
          next: t('admin.pagination.next'),
          showing: t('admin.pagination.showing'),
          of: t('admin.pagination.of')
        }}
      />

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