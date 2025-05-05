import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaWallet, FaInfoCircle, FaTicketAlt } from 'react-icons/fa';
import { MdCardGiftcard } from 'react-icons/md';
import { getUserDashboard } from '../../routes/auth-services';
import { redeemPromoCode } from '../../routes/codes';

const PromoCodes = () => {
  const { t, i18n } = useTranslation('promoCodes');
  const isRTL = i18n.language === 'ar';
  const [transactions, setTransactions] = useState([]);
  const [pointsBalances, setPointsBalances] = useState([]);
  const [lectureAccess, setLectureAccess] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Number of transactions per page

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getUserDashboard({ page: currentPage, limit: limit });
        if (result.success) {
          const { userInfo, pointsBalances, redeemedCodes, purchaseHistory, lectureAccess, paginationInfo } = result.data.data || {};
          setBalance(userInfo?.totalPoints || 0);

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

          // Set total pages based on the maximum totalPages from purchaseHistory or redeemedCodes
          const purchaseTotalPages = paginationInfo?.purchaseHistory?.totalPages || 1;
          const redeemedTotalPages = paginationInfo?.redeemedCodes?.totalPages || 1;
          setTotalPages(Math.max(purchaseTotalPages, redeemedTotalPages));
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
  }, [currentPage, limit, redeemSuccess, t]);

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
        setCurrentPage(1); // Reset to first page after redeeming a code
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-base-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="transition-all duration-300">
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
        </div>

        {fetchError && (
          <div className="alert alert-error max-w-md mx-auto mt-4">
            <span>{fetchError}</span>
          </div>
        )}

        <div className="p-4 md:p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 relative">
            <div className="relative">
              <img
                src="/rDots.png"
                alt="Decorative dots"
                className="absolute -top-16 md:-top-28 -right-4 md:-right-8 w-24 md:w-32 animate-float-up-dottedball z-0"
              />
              <div className="card bg-primary text-primary-content shadow-md w-full md:w-3/4 relative z-0">
                <div className="card-body flex">
                  <div className={`flex justify-between mb-2 border-b-2 border-white/25 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <FaWallet className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <h2 className="card-title">{t('balance.title')}</h2>
                  </div>
                  <p className="text-2xl md:text-4xl font-bold text-center my-2">
                    {loading ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      `${balance} ${t('balance.currency')}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className={`absolute ${isRTL ? 'right-[30%] md:right-[45%] rotate-[180deg] scale-y-[-1]' : 'left-[30%] md:left-[45%]'} top-3/4 md:top-1/2 transform rotate-90 md:rotate-0 translate-y-0 md:-translate-y-1/2 z-10`}>
              <img src="/vector22.png" alt={t('arrowAlt')} className="w-16 md:w-24 object-cover" />
            </div>

            <div className="card shadow-sm relative my-auto">
              <img
                src="/ball.png"
                alt="Decorative ball"
                className="absolute -bottom-12 md:-bottom-16 left-2 md:left-4 w-8 md:w-10 animate-bounce-slow"
              />
              <div className={`card-body ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="card-actions justify-end">
                  <button
                    onClick={() => {
                      setRedeemError(null);
                      setRedeemSuccess(null);
                      document.getElementById('redeem_modal').showModal();
                    }}
                    className="btn btn-outline btn-primary bg-primary/20 text-primary border-base-300 flex items-center"
                  >
                    {t('redeem.button')} <FaTicketAlt className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">{t('lecturerPoints.title')}</h2>
            {loading ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : pointsBalances.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
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

          <div className="card bg-base-100 shadow-sm relative mt-8">
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-32 h-32 -z-10`}>
              <img src="/rDots.png" alt={t('decorativeAlt')} className="w-full h-full object-cover animate-float-up-dottedball" />
            </div>

            <div className="card-body p-0">
              <div className="p-4 border-t border-base-300 text-center">
                <h2 className="card-title text-primary inline-block px-2 pb-2">
                  {t('transactions.title')}
                </h2>
                <img src="/Line 5.png" alt={t('decorativeAlt')} className="inline-block" />
              </div>

              <div className="overflow-x-auto rounded-2xl">
                <table className="table w-full text-xs sm:text-sm md:text-base">
                  <thead className="bg-primary/20">
                    <tr className="text-center">
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] hidden sm:table-cell">{t('table.id')}</th>
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] hidden sm:table-cell">{t('table.type')}</th>
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] hidden sm:table-cell">{t('table.code')}</th>
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">{t('table.amount')}</th>
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">{t('table.teacher')}</th>
                      <th className="text-primary text-xs sm:text-sm md:text-sm px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">{t('table.created')}</th>
                    </tr>
                  </thead>
                  <div className="h-4"></div>
                  <tbody>
                    {!loading ? (
                      transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-primary/10 text-center text-xs sm:text-sm">
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] hidden sm:table-cell">{transaction.id}</td>
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] whitespace-normal hidden sm:table-cell">{transaction.type}</td>
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] whitespace-normal hidden sm:table-cell">{transaction.code}</td>
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">{transaction.amount}</td>
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] whitespace-normal">{transaction.instructorName}</td>
                            <td className="px-1 sm:px-2 md:px-4 max-w-[80px] sm:max-w-[100px] md:max-w-[150px] whitespace-normal">{transaction.createdAt}</td>
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t('pagination.previous')}
                    </button>
                    {[...Array(totalPages).keys()].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <dialog id="redeem_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative w-full max-w-md p-4 md:p-6">
          <form method="dialog">
            <button className={`btn btn-sm btn-circle btn-ghost absolute ${isRTL ? 'left-2' : 'right-2'} top-2`}>✕</button>
          </form>
          <div className={`flex items-center mb-4 md:mb-6 text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MdCardGiftcard className={`w-5 md:w-6 h-5 md:h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <h3 className="font-bold text-lg md:text-xl">{t('redeem.modalTitle')}</h3>
          </div>
          <div className="mb-4 md:mb-6">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder={t('redeem.placeholder')}
              className={`input input-bordered w-full bg-base-200 text-sm md:text-base ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {redeemError && (
              <div className="alert alert-error mt-2 md:mt-4 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{redeemError}</span>
              </div>
            )}
            {redeemSuccess && (
              <div className="alert alert-success mt-2 md:mt-4 text-sm md:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{redeemSuccess}</span>
              </div>
            )}
            <ul className="text-base-content text-xs md:text-sm space-y-1 md:space-y-2 mb-2 md:mb-4 mt-2 md:mt-4">
              {[t('redeem.rules.1'), t('redeem.rules.2')].map((rule) => (
                <li key={rule} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="badge badge-primary badge-xs mx-1 md:mx-2"></span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleRedeemCode}
              disabled={redeemLoading}
              className="btn btn-primary text-primary-content border-none w-full text-sm md:text-base"
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