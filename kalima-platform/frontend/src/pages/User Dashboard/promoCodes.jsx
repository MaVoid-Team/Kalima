import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaWallet, FaInfoCircle, FaBars, FaTicketAlt, FaVideo } from 'react-icons/fa';
import { MdCardGiftcard } from 'react-icons/md';
import { getUserDashboard } from '../../routes/auth-services';
import { redeemPromoCode } from '../../routes/codes';

const PromoCodes = () => {
  const { t, i18n } = useTranslation('promoCodes');
  const isRTL = i18n.language === 'ar';
  const [transactions, setTransactions] = useState([]);
  const [pointsBalances, setPointsBalances] = useState([]);
  const [lectureAccess, setLectureAccess] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch user data on mount and after successful redemption
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getUserDashboard();
        if (result.success) {
          const { userInfo, pointsBalances, redeemedCodes, purchaseHistory, lectureAccess } = result.data.data || {};

          // Set general points as balance
          setBalance(userInfo?.totalPoints || 0);

          // Map redeemed codes and purchase history to transactions
          const mappedRedeemedCodes = (redeemedCodes || []).map((code, index) => ({
            id: `code-${index + 1}`,
            type: t('table.types.codeRedemption'),
            code: code.code,
            amount: code.pointsAmount,
            instructorName: code.lecturerId 
              ? (pointsBalances?.find(b => b.lecturer?._id === code.lecturerId)?.lecturer?.name || 'N/A')
              : t('generalPoints'),
            createdAt: new Date(code.redeemedAt).toLocaleDateString(),
          }));

          const mappedPurchaseHistory = (purchaseHistory || []).map((purchase, index) => ({
            id: `purchase-${index + 1}`,
            type: t('table.types.containerPurchase'),
            code: purchase.description,
            amount: purchase.points,
            instructorName: purchase.lecturer?.name || 'N/A',
            createdAt: new Date(purchase.purchasedAt).toLocaleDateString(),
          }));

          const combinedTransactions = [...mappedRedeemedCodes, ...mappedPurchaseHistory].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          setTransactions(combinedTransactions);
          setPointsBalances(pointsBalances || []);
          setLectureAccess(lectureAccess || []);
        } else {
          setFetchError(result.error || t('errors.fetchFailed'));
        }
      } catch (error) {
        setFetchError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [redeemSuccess, t]);

  // Handle screen size changes for mobile sidebar
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemError(t('redeem.errors.emptyCode'));
      return;
    }

    setRedeemLoading(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const result = await redeemPromoCode(redeemCode);
      if (result.success) {
        setRedeemSuccess(t('redeem.success'));
        setRedeemCode('');
        document.getElementById('redeem_modal').close();
      } else {
        setRedeemError(result.error || t('redeem.errors.generic'));
      }
    } catch (error) {
      setRedeemError(t('redeem.errors.generic'));
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <div className="transition-all duration-300">
        {/* Header */}
        <div className="bg-base-100 p-4 flex items-center justify-between top-0 z-10 mt-10">
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-xl font-bold text-primary px-1">{t('title')}</h1>
            <img src="/Line 5.png" alt={t('decorativeAlt')} className="inline-block" />
          </div>
          <img
            src="/waves.png"
            alt="Decorative waves"
            className="absolute left-[10%] w-16 animate-float-zigzag"
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

        {/* Error Display */}
        {fetchError && (
          <div className="alert alert-error max-w-md mx-auto mt-4">
            <span>{fetchError}</span>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-44 mb-8 relative">
            {/* Balance Card */}
            <div className="relative">
              <img
                src="/rDots.png"
                alt="Decorative dots"
                className="absolute -top-28 -right-8 w-32 animate-float-up-dottedball z-0"
              />
              <div className="card bg-primary text-primary-content shadow-md w-3/4 relative z-0">
                <div className={`card-body flex`}>
                  <div className={`flex justify-between mb-2 border-b-2 border-white/25 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FaWallet className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <h2 className="card-title">{t('balance.title')}</h2>
                  </div>
                  <p className="text-4xl font-bold text-center my-2">
                    {loading ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      `${balance} ${t('balance.currency')}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className={`absolute ${isRTL ? 'right-[45%] rotate-[180deg] scale-y-[-1]' : 'left-[45%] md:rotate-[360deg]'} top-1/2 transform rotate-90 translate-y-1/4 md:-translate-y-1/2 block z-10`}>
              <img src="/vector22.png" alt={t('arrowAlt')} className="object-cover" />
            </div>

            {/* Redeem Code Box */}
            <div className="card shadow-sm relative my-auto">
              <img
                src="/ball.png"
                alt="Decorative ball"
                className="absolute -bottom-16 left-4 w-10 animate-bounce-slow"
              />
              <div className={`card-body ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="card-actions justify-end">
                  <button
                    onClick={() => {
                      setRedeemError(null);
                      setRedeemSuccess(null);
                      document.getElementById('redeem_modal').showModal();
                    }}
                    className="btn btn-outline hover:btn-primary bg-primary/20 text-primary border-base-300 flex items-center"
                  >
                    {t('redeem.button')} <FaTicketAlt className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lecturer Points Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">{t('lecturerPoints.title')}</h2>
            {loading ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : pointsBalances.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pointsBalances.map((balance, index) => (
                  <div key={index} className="card bg-base-200 shadow-md">
                    <div className="card-body">
                      <h3 className="card-title">
                        {balance.lecturer ? balance.lecturer.name : t('generalPoints')}
                      </h3>
                      <p className="text-2xl font-bold">{balance.points} {t('balance.currency')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">{t('noLecturerPoints')}</p>
              </div>
            )}
          </div>

          {/* Transactions History */}
          <div className="card bg-base-100 shadow-sm relative mt-8">
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-32 h-32 -z-10`}>
              <img src="/rDots.png" alt={t('decorativeAlt')} className="w-full h-full object-cover animate-float-up-dottedball" />
            </div>

            <div className="card-body p-0">
              <div className="p-4 border-t border-base-300 text-center">
                <h2 className={`card-title text-primary inline-block px-2 pb-2`}>
                  {t('transactions.title')}
                </h2>
                <img src="/Line 5.png" alt={t('decorativeAlt')} className="inline-block" />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl">
                <table className="table w-full">
                  <thead className="bg-primary/20 mt-10">
                    <tr className="text-center">
                      {[t('table.id'), t('table.type'), t('table.code'), t('table.amount'), t('table.teacher'), t('table.created')].map((header) => (
                        <th key={header} className="text-primary">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <div className="h-4"></div>
                  <tbody>
                    {!loading ? (
                      transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-base-200 text-center">
                            <td>{transaction.id}</td>
                            <td>{transaction.type}</td>
                            <td>{transaction.code}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.instructorName}</td>
                            <td>{transaction.createdAt}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-16 bg-primary/20">
                            <div className="flex flex-col items-center justify-center text-base-content opacity-60">
                              <div className="bg-primary bg-opacity-20 p-4 rounded-full mb-4">
                                <FaInfoCircle className="w-8 h-8 text-primary" />
                              </div>
                              <p className="text-lg font-medium">{t('noData')}</p>
                            </div>
                          </td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-16 bg-primary/20">
                          <div className="flex flex-col items-center justify-center">
                            <span className="loading loading-dots loading-lg"></span>
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

      {/* Redeem Code Dialog */}
      <dialog id="redeem_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative">
          <form method="dialog">
            <button className={`btn btn-sm btn-circle btn-ghost absolute ${isRTL ? 'left-2' : 'right-2'} top-2`}>✕</button>
          </form>

          <div className={`flex items-center mb-6 text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MdCardGiftcard className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <h3 className="font-bold text-xl">{t('redeem.modalTitle')}</h3>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder={t('redeem.placeholder')}
              className={`input input-bordered w-full bg-base-200 ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* Error and Success Messages */}
            {redeemError && (
              <div className="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{redeemError}</span>
              </div>
            )}

            {redeemSuccess && (
              <div className="alert alert-success mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{redeemSuccess}</span>
              </div>
            )}

            <ul className="text-base-content text-sm space-y-2 mb-4 mt-4">
              {[t('redeem.rules.1'), t('redeem.rules.2')].map((rule) => (
                <li key={rule} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="badge badge-primary badge-xs mx-2"></span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleRedeemCode}
              disabled={redeemLoading}
              className="btn btn-primary text-primary-content border-none w-full"
            >
              {redeemLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                t('redeem.button')
              )}
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