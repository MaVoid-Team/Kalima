import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ImSpinner8 } from "react-icons/im";
import { getPromoCodes } from "../../../../routes/codes";
import { getAllStudents } from "../../../../routes/fetch-users";

const PromoCodesTable = () => {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const [filters, setFilters] = useState({
    isRedeemed: '', // 'true' | 'false' | ''
    redeemedBy: '',
  });
  const [state, setState] = useState({
    promoCodes: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    isLoading: true,
    error: null
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
  
      const [promoResult, studentsResult] = await Promise.all([
        getPromoCodes(),
        getAllStudents()
      ]);
  
      if (promoResult.success && Array.isArray(promoResult.data)) {
        const totalPages = Math.ceil(promoResult.data.length / state.itemsPerPage);
  
        setState(prev => ({
          ...prev,
          promoCodes: promoResult.data,
          totalPages,
          isLoading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          promoCodes: [],
          error: promoResult.error || 'Invalid promo response'
        }));
      }
  
      if (studentsResult.success && Array.isArray(studentsResult.data)) {
        setStudents(studentsResult.data);
      }
    };
  
    fetchData();
  }, []);

  const getStudentNameById = (id) => {
    const student = students.find(s => s._id === id);
    return student ? student.name : '--';
  };

  const paginatedCodes = state.promoCodes.slice(
    (state.currentPage - 1) * state.itemsPerPage,
    state.currentPage * state.itemsPerPage
  );

  const fetchFilteredPromoCodes = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
  
    const cleanFilters = {};
    if (filters.isRedeemed !== '') cleanFilters.isRedeemed = filters.isRedeemed;
    if (filters.redeemedBy) cleanFilters.redeemedBy = filters.redeemedBy;
  
    const result = await getPromoCodes(cleanFilters);
  
    if (result.success) {
      const totalPages = Math.ceil(result.data.length / state.itemsPerPage);
      setState(prev => ({
        ...prev,
        promoCodes: result.data,
        currentPage: 1,
        totalPages,
        isLoading: false,
        error: null,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        promoCodes: [],
        error: result.error,
      }));
    }
  };
  const handlePreviousPage = () => {
    setState(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1)
    }));
  };

  const handleNextPage = () => {
    setState(prev => ({
      ...prev,
      currentPage: Math.min(state.totalPages, prev.currentPage + 1)
    }));
  };

  return (
    <div className="card bg-base-100 border border-primary shadow-2xl my-6" dir={dir}>
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">{t('promoCodes.title')}</h2>

        {state.isLoading ? (
          <div className="flex justify-center py-8">
            <ImSpinner8 className="animate-spin text-4xl text-primary" />
          </div>
        ) : (
          <>
            {state.error && (
              <div className="alert alert-error mb-4">
                {state.error}
              </div>
            )}

            <div className="overflow-x-auto">
            <div className="flex flex-wrap gap-4 mb-4">
            <select
                className="select select-bordered"
                value={filters.isRedeemed}
                onChange={(e) => setFilters(prev => ({ ...prev, isRedeemed: e.target.value }))}
            >
                <option value="">{t('filters.allStatuses')}</option>
                <option value="false">{t('filters.active')}</option>
                <option value="true">{t('filters.redeemed')}</option>
            </select>

            <input
                type="text"
                className="input input-bordered"
                placeholder={t('filters.redeemedBy')}
                value={filters.redeemedBy}
                onChange={(e) => setFilters(prev => ({ ...prev, redeemedBy: e.target.value }))}
            />

            <button
                className="btn btn-primary"
                onClick={() => fetchFilteredPromoCodes()}
            >
                {t('filters.apply')}
            </button>
            </div>

              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t('promoCodes.code')}</th>
                    <th>{t('promoCodes.points')}</th>
                    <th>{t('promoCodes.status')}</th>
                    <th>{t('promoCodes.redeemedAt')}</th>
                    <th>{t('promoCodes.redeemedBy')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCodes.map(code => (
                    <tr key={code._id}>
                      <td className="font-mono">{code.code}</td>
                      <td>{code.pointsAmount?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`badge ${code.isRedeemed ? 'badge-success' : 'badge-warning'}`}>
                          {code.isRedeemed ? t('status.redeemed') : t('status.active')}
                        </span>
                      </td>
                      <td>{code.redeemedAt ? new Date(code.redeemedAt).toLocaleDateString() : '--'}</td>
                      <td className="truncate max-w-[100px]">
                        {getStudentNameById(code.redeemedBy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedCodes.length === 0 && !state.isLoading && (
              <div className="text-center py-4">{t('promoCodes.noCodes')}</div>
            )}

            <div className="flex justify-between items-center mt-4 sm:w-1/2 mx-auto gap-2">
              <button
                className="btn btn-outline"
                onClick={handlePreviousPage}
                disabled={state.currentPage === 1}
              >
                {t('pagination.previous')}
              </button>
              <span>
                {t('pagination.page')} {state.currentPage} {t('pagination.of')} {state.totalPages}
              </span>
              <button
                className="btn btn-outline"
                onClick={handleNextPage}
                disabled={state.currentPage >= state.totalPages}
              >
                {t('pagination.next')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PromoCodesTable;
