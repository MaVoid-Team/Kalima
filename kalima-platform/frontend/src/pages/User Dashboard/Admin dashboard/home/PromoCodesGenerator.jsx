import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, Copy, Check, AlertCircle } from 'lucide-react';
import { generatePromoCodes } from "../../../../routes/codes";
import { getAllLecturers } from "../../../../routes/fetch-users";

const PromoCodeGenerator = () => {
  const { t, i18n } = useTranslation();
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
  
  // Fetch lecturers
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setLoading(true);
        const response = await getAllLecturers();
        
        if (response.success) {
          // Make sure we're accessing the data correctly based on the API response structure
          setLecturers(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(isRTL ? "فشل في جلب المحاضرين" : "Failed to fetch lecturers");
        }
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setError(isRTL ? "فشل في جلب المحاضرين" : "Failed to fetch lecturers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLecturers();
  }, [isRTL]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "type" && value === "general") {
      // Reset lecturer ID when switching to general type
      setFormData({
        ...formData,
        [name]: value,
        lecturerId: ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGeneratedCodes([]);
    
    // Validate form
    if (formData.pointsAmount <= 0) {
      setError(isRTL ? "يجب أن تكون قيمة النقاط أكبر من صفر" : "Points amount must be greater than zero");
      return;
    }
    
    if (formData.numOfCodes <= 0) {
      setError(isRTL ? "يجب أن يكون عدد الأكواد أكبر من صفر" : "Number of codes must be greater than zero");
      return;
    }
    
    if (formData.type === "specific" && !formData.lecturerId) {
      setError(isRTL ? "يرجى اختيار محاضر" : "Please select a lecturer");
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare JSON payload
      const payload = {
        pointsAmount: formData.pointsAmount,
        numOfCodes: formData.numOfCodes,
        type: formData.type
      };
      
      // Add lecturerId only if type is specific
      if (formData.type === "specific") {
        payload.lecturerId = formData.lecturerId;
      }
      
      // Pass the payload directly to generatePromoCodes
      const response = await generatePromoCodes(payload);
      
      if (response.status === "success") {
        setSuccess(isRTL ? "تم إنشاء أكواد الخصم بنجاح" : "Promo codes generated successfully");
        setGeneratedCodes(response.data.codes || []);
      } else {
        setError(response.message || (isRTL ? "فشل في إنشاء أكواد الخصم" : "Failed to generate promo codes"));
      }
    } catch (err) {
      console.error("Error generating promo codes:", err);
      setError(err.message || (isRTL ? "فشل في إنشاء أكواد الخصم" : "Failed to generate promo codes"));
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8" dir={dir}>
      <div className="flex items-center gap-2 mb-6">
        <Ticket className="text-primary w-6 h-6" />
        <h2 className="text-xl font-bold">
          {isRTL ? "إنشاء أكواد ترويجية" : "Generate Promo Codes"}
        </h2>
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
          {/* Points Amount */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {isRTL ? "قيمة النقاط" : "Points Amount"}
              </span>
            </label>
            <input
              type="number"
              name="pointsAmount"
              className="input input-bordered"
              value={formData.pointsAmount}
              onChange={handleNumberChange}
              min="1"
              required
            />
          </div>
          
          {/* Number of Codes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {isRTL ? "عدد الأكواد" : "Number of Codes"}
              </span>
            </label>
            <input
              type="number"
              name="numOfCodes"
              className="input input-bordered"
              value={formData.numOfCodes}
              onChange={handleNumberChange}
              min="1"
              max="100"
              required
            />
          </div>
          
          {/* Code Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {isRTL ? "نوع الكود" : "Code Type"}
              </span>
            </label>
            <select
              name="type"
              className="select select-bordered w-full"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="general">{isRTL ? "عام" : "General"}</option>
              <option value="specific">{isRTL ? "محدد لمحاضر" : "Specific to Lecturer"}</option>
            </select>
          </div>
          
          {/* Lecturer Selection (only if type is specific) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {isRTL ? "المحاضر" : "Lecturer"}
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
              <option value="">{isRTL ? "اختر محاضر" : "Select Lecturer"}</option>
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
              {isRTL ? "جاري الإنشاء..." : "Generating..."}
            </>
          ) : (
            isRTL ? "إنشاء الأكواد" : "Generate Codes"
          )}
        </button>
      </form>
      
      {/* Generated Codes */}
      {generatedCodes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">
            {isRTL ? "الأكواد المنشأة" : "Generated Codes"}
          </h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{isRTL ? "الرقم" : "#"}</th>
                  <th>{isRTL ? "كود الخصم" : "Promo Code"}</th>
                  <th>{isRTL ? "النقاط" : "Points"}</th>
                  <th>{isRTL ? "النوع" : "Type"}</th>
                  <th>{isRTL ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {generatedCodes.map((code, index) => (
                  <tr key={code.code || index}>
                    <td>{index + 1}</td>
                    <td>
                      <code className="bg-base-200 px-2 py-1 rounded">{code.code}</code>
                    </td>
                    <td>{code.pointsAmount || formData.pointsAmount}</td>
                    <td>
                      {formData.type === "specific" 
                        ? (isRTL ? "محدد" : "Specific") 
                        : (isRTL ? "عام" : "General")}
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
                        <span className="sr-only">
                          {isRTL ? "نسخ" : "Copy"}
                        </span>
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