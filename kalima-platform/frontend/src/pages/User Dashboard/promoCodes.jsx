import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { FaWallet, FaInfoCircle, FaSort, FaBars } from 'react-icons/fa';
import { MdCardGiftcard } from 'react-icons/md';

const PromoCodes = () => {
  const [transactions, setTransactions] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  
  // Check screen size on initial load and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Open by default on desktop, closed on mobile
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRedeemCode = () => {
    // Handle redeem code logic here
    console.log('Redeeming code:', redeemCode);
    // Close the modal using DaisyUI's dialog method
    document.getElementById('redeem_modal').close();
    setRedeemCode('');
  };

  // This would normally come from an API
  const balance = 324;

  return (
    <div className="min-h-screen bg-base-300">
      {/* Main Content - with right margin for sidebar on desktop */}
      <div 
        className={`transition-all duration-300 ${
          // Apply margin only on desktop when sidebar is open
          !isMobile && sidebarOpen ? 'md:mr-52' : 'mr-0'
        }`}
      >
        {/* Header with mobile toggle button */}
        <div className="bg-base-300 p-4 flex items-center justify-between border-b border-base-300 sticky top-0 z-10">
          {isMobile && (
            <button 
              id="sidebar-toggle"
              className="btn btn-ghost btn-sm p-1"
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <FaBars className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold text-primary">اكواد الشحن</h1>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {/* Balance and Redeem Code Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-44 mb-8 relative">
            {/* Balance Card - Using DaisyUI card */}
            <div className="card bg-primary text-primary-content shadow-md">
              <div className="card-body">
                <div className="flex items-center mb-2">
                  <FaWallet className="w-6 h-6 ml-2" />
                  <h2 className="card-title">الميزانية</h2>
                </div>
                <p className="text-4xl font-bold text-center my-2">{balance} جنيها</p>
              </div>
            </div>

            {/* Arrow between cards - positioned in the middle */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
              <img src="vector22.png" alt="arrow pointing between cards" className="object-cover" />
            </div>

            {/* Redeem Code Box - Using DaisyUI card */}
            <div className="card bg-base-100 shadow-sm relative">
              <div className="card-body">
                <h2 className="card-title">شحن كود</h2>
                <div className="card-actions justify-end">
                  <button 
                    onClick={() => document.getElementById('redeem_modal').showModal()} 
                    className="btn btn-primary text-primary-content border-none w-full"
                  >
                    شحن كود
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions History - Using DaisyUI card */}
          <div className="card bg-base-100 shadow-sm relative">
            {/* Decorative red dotted circle in background - moved here */}
            <div className="absolute top-0 right-0 w-32 h-32 -z-10">
              <img src="rDots.png" alt="decorative dots" className="w-full h-full object-cover animate-float-up-dottedball" />
            </div>
            
            <div className="card-body p-0">
              <div className="p-4 border-b border-base-300">
                <h2 className="card-title text-primary border-b-2 border-accent pb-2 inline-block">
                  تاريخ التعاملات
                </h2>
              </div>

              {/* Sort Dropdown */}
              <div className="p-4 border-b border-base-300">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-sm btn-outline flex items-center gap-2">
                    <span>رتب حسب</span>
                    <FaSort />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a onClick={() => setSortOrder('desc')}>الأحدث أولاً</a></li>
                    <li><a onClick={() => setSortOrder('asc')}>الأقدم أولاً</a></li>
                  </ul>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-base-200">
                    <tr className="text-right">
                      <th className="text-primary">وقت الإنشاء</th>
                      <th className="text-primary">اسم المدرس</th>
                      <th className="text-primary">رصيد شحن الكارت</th>
                      <th className="text-primary">كود الشحن</th>
                      <th className="text-primary">رقم الكود</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-base-200">
                          <td>{transaction.createdAt}</td>
                          <td>{transaction.instructorName}</td>
                          <td>{transaction.amount}</td>
                          <td>{transaction.code}</td>
                          <td>{transaction.id}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-16">
                          <div className="flex flex-col items-center justify-center text-base-content opacity-60">
                            <div className="bg-primary bg-opacity-20 p-4 rounded-full mb-4">
                              <FaInfoCircle className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-lg font-medium">لا يوجد بيانات</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Redeem Code Dialog - Using DaisyUI modal */}
      <dialog id="redeem_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          
          {/* Header */}
          <div className="flex items-center mb-6 text-primary">
            <MdCardGiftcard className="w-6 h-6 ml-2" />
            <h3 className="font-bold text-xl">شحن الكود</h3>
          </div>
          
          {/* Form */}
          <div className="mb-6">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="من فضلك ادخل كود الشحن"
              className="input input-bordered w-full bg-base-200 text-right mb-4"
            />
            
            <ul className="text-base-content text-sm space-y-2 mb-4 pr-4">
              <li className="flex items-center">
                <span className="badge badge-primary badge-xs ml-2"></span>
                <span>كل كود يقدر يتشحن مرة واحدة بس</span>
              </li>
              <li className="flex items-center">
                <span className="badge badge-primary badge-xs ml-2"></span>
                <span>تقدر تستخدم نقاط الشحن للمدرس اللي اشتريت منه الكارت فقط</span>
              </li>
            </ul>
            
            <button 
              onClick={handleRedeemCode}
              className="btn btn-primary text-primary-content border-none w-full"
            >
              شحن الكود
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default PromoCodes;