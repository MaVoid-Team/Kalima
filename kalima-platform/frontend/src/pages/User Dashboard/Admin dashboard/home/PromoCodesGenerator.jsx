import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, Copy, Check, AlertCircle } from 'lucide-react';
import { generatePromoCodes } from "../../../../routes/codes";
import { getAllLecturers } from "../../../../routes/fetch-users";

const PromoCodeGenerator = () => {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [formData, setFormData] = useState({
    pointsAmount: 1000,
    numOfCodes: 3,
    lecturerId: "",
    type: "general"
  });

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setLoading(true);
        const response = await getAllLecturers();
        
        if (response.success) {
          setLecturers(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(t('admin.errors.fetchLecturers'));
        }
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setError(t('admin.errors.fetchLecturers'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchLecturers();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      // Reset lecturerId when changing to general or promo type
      const newFormData = { ...formData, [name]: value };
      if (value !== "specific") {
        newFormData.lecturerId = "";
      }
      setFormData(newFormData);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGeneratedCodes([]);

    if (formData.type !== "promo" && formData.pointsAmount <= 0) {
      setError(t('admin.errors.pointsError'));
      return;
    }
    
    if (formData.numOfCodes <= 0) {
      setError(t('admin.errors.codesError'));
      return;
    }
    
    if (formData.type === "specific" && !formData.lecturerId) {
      setError(t('admin.errors.lecturerRequired'));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        numOfCodes: formData.numOfCodes,
        type: formData.type
      };
      
      // Only include pointsAmount if not promo type
      if (formData.type !== "promo") {
        payload.pointsAmount = formData.pointsAmount;
      }
      
      // Only include lecturerId if specific type
      if (formData.type === "specific") {
        payload.lecturerId = formData.lecturerId;
      }

      const response = await generatePromoCodes(payload);
      
      if (response.status === "success") {
        setSuccess(t('admin.success.codesGenerated'));
        setGeneratedCodes(response.data.codes || []);
      } else {
        setError(response.message || t('admin.errors.generationFailed'));
      }
    } catch (err) {
      console.error("Error generating promo codes:", err);
      setError(t('admin.errors.generationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="rounded-lg shadow-md p-6 mb-8" dir={dir}>
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="text-primary w-6 h-6" />
        <h2 className="text-xl font-bold">{t('admin.generatePromoCodes')}</h2>
      </div>

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-control">
            <div className="flex flex-col items-start gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  {t('admin.form.pointsAmount')}
                </span>
              </label>
              <input
                type="number"
                name="pointsAmount"
                className="input input-bordered"
                value={formData.pointsAmount}
                onChange={handleNumberChange}
                min="1"
                disabled={formData.type === "promo"}
                required={formData.type !== "promo"}
              />
            </div>
          </div>

          <div className="form-control">
            <div className="flex flex-col items-start gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  {t('admin.form.numCodes')}
                </span>
              </label>
              <input
                type="text"
                name="numOfCodes"
                className="input input-bordered"
                value={formData.numOfCodes}
                onChange={handleNumberChange}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {t('admin.form.codeType')}
              </span>
            </label>
            <select
              name="type"
              className="select select-bordered w-full"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="general">{t('admin.form.general')}</option>
              <option value="specific">{t('admin.form.specific')}</option>
              <option value="promo">{t('admin.form.promo')}</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {t('admin.form.lecturer')}
              </span>
            </label>
            <select
              name="lecturerId"
              className="select select-bordered w-full"
              value={formData.lecturerId}
              onChange={handleChange}
              disabled={formData.type !== "specific"}
              required={formData.type === "specific"}
            >
              <option value="">{t('admin.form.lecturerPlaceholder')}</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t('admin.generating')}
            </>
          ) : (
            t('admin.generateCodes')
          )}
        </button>
      </form>

      {generatedCodes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">
            {t('admin.generatedCodes')}
          </h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('admin.promoTable.number')}</th>
                  <th>{t('admin.promoTable.code')}</th>
                  <th>{formData.type === "promo" ? t('admin.promoTable.discount') : t('admin.promoTable.points')}</th>
                  <th>{t('admin.promoTable.type')}</th>
                  <th>{t('admin.promoTable.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {generatedCodes.map((code, index) => (
                  <tr key={code.code || index}>
                    <td>{index + 1}</td>
                    <td>
                      <code className="bg-base-200 px-2 py-1 rounded">
                        {code.code}
                      </code>
                    </td>
                    <td>
                      {formData.type === "promo" 
                        ? t('admin.discount') 
                        : (code.pointsAmount || formData.pointsAmount)}
                    </td>
                    <td>
                      {formData.type === "specific" 
                        ? t('admin.specific') 
                        : formData.type === "promo"
                        ? t('admin.promo')
                        : t('admin.general')}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => copyToClipboard(code.code, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="sr-only">{t('admin.copy')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeGenerator;