import React from "react";

const UserManagementTable = () => {
  // Sample data for the table
  const users = [
    {
      id: 1,
      name: "أحمد علي",
      phone: "01012345678",
      accountType: "ولي أمر",
      status: "صالح",
    },
    {
      id: 2,
      name: "سارة حسن",
      phone: "01198765432",
      accountType: "معلم",
      status: "بيانات ناقصة",
    },
    {
      id: 3,
      name: "يوسف سعيد",
      phone: "01234567890",
      accountType: "طالب",
      status: "صالح",
    },
    {
      id: 4,
      name: "عمر خالد",
      phone: "01567890987",
      accountType: "ولي أمر",
      status: "رقم الهاتف غير صحيح",
    },
  ];

  return (
    <div className="rounded-xl font-sans w-full mx-auto p-4 my-14 border border-slate-100" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-right">سجل الاجراءات</h1>
      <div className="flex flex-wrap gap-4 mb-8 justify-between">
        {/* Filter button */}
        <button className="btn bg-primary border-none rounded-full px-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          تطبيق الفلتر
        </button>

        {/* Dropdown filters */}
        <div className="flex flex-wrap gap-3">
          <FilterDropdown label="الاسم" />
          <FilterDropdown label="رقم الهاتف" />
          <FilterDropdown label="نوع الحساب" />
          <FilterDropdown label="الحالة" />
          <FilterDropdown label="الإجراءات" />
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
              <th className="pb-4 text-lg font-medium ">الاسم</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-none">
                <td className="py-4">
                  <div className="flex items-center gap-3 ">
                    <button className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ff0000]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <button className="flex items-center justify-center w-6 h-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="py-4">{user.status}</td>
                <td className="py-4">{user.accountType}</td>
                <td className="py-4">{user.phone}</td>
                <td className="py-4">{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label }) => {
  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-outline rounded-full px-6 min-w-[140px] flex items-center justify-between"
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <a>الكل</a>
        </li>
        <li>
          <a>خيار 1</a>
        </li>
        <li>
          <a>خيار 2</a>
        </li>
      </ul>
    </div>
  );
};

export default UserManagementTable;