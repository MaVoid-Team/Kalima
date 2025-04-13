import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import { useTranslation } from 'react-i18next';
import { FaWallet, FaInfoCircle, FaSort, FaBars, FaTicketAlt } from 'react-icons/fa';
import { MdCardGiftcard } from 'react-icons/md';
import { Link } from 'react-router-dom';

const PromoCodes = () => {
  const { t, i18n } = useTranslation('promoCodes');
  const isRTL = i18n.language === 'ar';
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
    <div className="min-h-screen bg-base-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
            <div 
        className={`transition-all duration-300 ${
          !isMobile && sidebarOpen ? (isRTL ? 'md:mr-52' : 'md:ml-52') : 'mr-0'
        }`}
      >
        {/* Header */}
        <div className="bg-base-100 p-4 flex items-center justify-between  top-0 z-10 mt-10">
          <div className="flex-1 flex items-center justify-center ">
            <h1 className="text-xl font-bold text-primary px-1">{t('title')}</h1>
            <img src="Line 5.png" alt={t('decorativeAlt')} className=" inline-block " />
          </div>
          <img 
            src="waves.png" 
            alt="Decorative waves" 
            className="absolute  left-[10%] w-16 animate-float-zigzag" 
          />
          {isMobile && (
            <button 
              className={`btn btn-ghost btn-sm p-1 ${isRTL ? 'ml-2' : 'mr-2'}`}
              onClick={toggleSidebar}
              aria-label={t('toggleSidebar')}
            >
              <FaBars className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Page Content */}
        <div className="p-6 relative">
          {/* Waves animation in title container */}
          
          {/* Balance and Redeem Code Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-44 mb-8 relative">
            {/* Balance Card */}
            <div className="relative">
            <img 
              src="rDots.png" 
              alt="Decorative dots" 
              className="absolute -top-28 -right-8 w-32  animate-float-up-dottedball z-0" 
            />
            <div className="card bg-primary text-primary-content shadow-md w-3/4 relative z-0">
              <div className={`card-body flex`}>
                <div className={`flex justify-between mb-2 border-b-2 border-white/25 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FaWallet className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <h2 className="card-title">{t('balance.title')}</h2>
                </div>
                <p className="text-4xl font-bold text-center my-2">
                  {balance} {t('balance.currency')}
                </p>
              </div>
            </div>
            </div>

            {/* Arrow */}
            <div className={`absolute ${isRTL ? 'right-[45%] rotate-[180deg] scale-y-[-1]' : 'left-[45%] md:rotate-[360deg]'} top-1/2 transform rotate-90  translate-y-1/4 md:-translate-y-1/2 block z-10 `}>
              <img src="vector22.png" alt={t('arrowAlt')} className="object-cover" />
            </div>

            {/* Redeem Code Box */}
            <div className="card  shadow-sm relative  my-auto">
            <img 
            src="ball.png" 
            alt="Decorative ball" 
            className="absolute -bottom-16 left-4 w-10 animate-bounce-slow" 
          />
              <div className={`card-body ${isRTL ? 'text-right' : 'text-left'}`}>

                <div className="card-actions justify-end">
                  <button 
                    onClick={() => document.getElementById('redeem_modal').showModal()} 
                    className="btn btn-outline hover:btn-primary bg-primary/20 text-primary border-base-300 flex items-center"
                  >
                    {t('redeem.button')} <FaTicketAlt className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions History */}
          <div className="card bg-base-100 shadow-sm relative">
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-32 h-32 -z-10 `}>
              <img src="rDots.png" alt={t('decorativeAlt')} className="w-full h-full object-cover animate-float-up-dottedball" />
            </div>
            
            <div className="card-body p-0">
              <div className="p-4 border-t border-base-300 text-center">
                <h2 className={`card-title text-primary inline-block px-2 pb-2`}>
                  {t('transactions.title')}
                </h2>
                 <img src="Line 5.png" alt={t('decorativeAlt')} className=" inline-block " />
              </div>

              {/* Sort Dropdown */}
              <div className="p-4 border-b border-base-300">
                <div className={`dropdown dropdown-bottom w-full `}>
                  <label tabIndex={0} className="btn btn-sm btn-outline hover:btn-primary flex justify-between gap-2">
                    <span>{t('sort.label')}</span>
                    <FaSort />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                    <li><Link onClick={() => setSortOrder('desc')}>{t('sort.newest')}</Link></li>
                    <li><Link onClick={() => setSortOrder('asc')}>{t('sort.oldest')}</Link></li>
                  </ul>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl">
                
                <table className="table w-full">
                  <thead className="bg-primary/20 mt-10">
                    <tr className='text-center'>
                      {[t('table.id'), t('table.code'), t('table.amount'), t('table.teacher'), t('table.created')].map((header) => (
                        <th key={header} className="text-primary">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <div className="h-4"></div>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-base-200">
                          <td>{transaction.id}</td>
                          <td>{transaction.code}</td>
                          <td>{transaction.amount}</td>
                          <td>{transaction.instructorName}</td>
                          <td>{transaction.createdAt}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                       <td colSpan="5" className="text-center py-16 bg-primary/20">
                          <div className="flex flex-col items-center justify-center text-base-content opacity-60">
                            <div className="bg-primary bg-opacity-20 p-4 rounded-full mb-4">
                              <FaInfoCircle className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-lg font-medium">{t('noData')}</p>
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

      {/* Redeem Code Dialog */}
      <dialog id="redeem_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative">
          <form method="dialog">
            <button className={`btn btn-sm btn-circle btn-ghost absolute ${isRTL ? 'left-2' : 'right-2'} top-2`}>✕</button>
          </form>
          
          {/* Header */}
          <div className={`flex items-center mb-6 text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MdCardGiftcard className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <h3 className="font-bold text-xl">{t('redeem.modalTitle')}</h3>
          </div>
          
          {/* Form */}
          <div className="mb-6">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder={t('redeem.placeholder')}
              className={`input input-bordered w-full bg-base-200 ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            
            <ul className="text-base-content text-sm space-y-2 mb-4">
              {[t('redeem.rules.1'), t('redeem.rules.2')].map((rule) => (
                <li key={rule} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="badge badge-primary badge-xs mx-2"></span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={handleRedeemCode}
              className="btn btn-primary text-primary-content border-none w-full"
            >
              {t('redeem.button')}
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