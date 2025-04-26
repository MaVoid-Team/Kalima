import { useState } from "react";
import Hero from "./hero";
import StudentsSection from "./studentsSection";
import UserManagementTable from "./userManageTable";
import PromoCodeGenerator from "./PromoCodesGenerator";
import { FaWhatsapp } from "react-icons/fa";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [whatsappModal, setWhatsappModal] = useState({
    isOpen: false,
    phoneNumber: "",
    message: "",
  });

  // Open WhatsApp modal
  const openWhatsappModal = () => {
    setWhatsappModal({
      isOpen: true,
      phoneNumber: "",
      message: "",
    });
  };

  // Handle WhatsApp modal input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWhatsappModal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send WhatsApp message
  const sendWhatsappMessage = () => {
    const { phoneNumber, message } = whatsappModal;

    if (!phoneNumber) {
      alert("يرجى إدخال رقم الهاتف");
      return;
    }

    // Format phone number (remove non-digits and add country code if needed)
    let formattedNumber = phoneNumber.replace(/\D/g, "");
    if (!formattedNumber.startsWith("2")) {
      formattedNumber = "2" + formattedNumber; // Assuming Egypt country code (+20)
    }

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber}${
      message ? `?text=${encodeURIComponent(message)}` : ""
    }`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");

    // Close the modal
    setWhatsappModal({
      isOpen: false,
      phoneNumber: "",
      message: "",
    });
  };

  return (
    <div
      className="mx-auto w-full max-w-full p-10 bg-base-100 min-h-screen bg-gradient-to-br"
      dir="rtl"
    >
      <div className={`transition-all duration-300 space-y-8`}>
        <Hero />
        {/* <StudentsSection/> */}
        <PromoCodeGenerator />
        <UserManagementTable />

        <div className="flex justify-center items-center pb-36 max-sm:pt-20 rounded-3xl">
          <a
            target="_blank"
            href="https://api.whatsapp.com/send/?phone=01279614767&text&type=phone_number&app_absent=0"
            rel="noreferrer"
          >
            <img
              alt="arrow"
              src="/whatsApp.png"
              className="w-14 right-6 max-sm:w-16"
            />
          </a>
          <img alt="arrow" src="/AdminA.png" className="w-36" />

          <button
            className="btn btn-primary w-44 rounded-xl"
            onClick={openWhatsappModal}
          >
            ارسل عرضك الان!
          </button>
        </div>
        <div className="relative">
          <img
            alt=""
            src="/rDots.png"
            className="absolute h-32 w-20 left-16 bottom-20 max-sm:left-0 animate-float-up-dottedball"
          />
        </div>
        <div className="relative">
          <img
            alt=""
            src="/bDots.png"
            className="absolute h-32 w-20 right-16 bottom-44 max-sm:bottom-72 max-sm:right-0 animate-float-down-dottedball"
          />
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsappModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" dir="rtl">
            <h3 className="text-xl font-bold mb-4">إرسال عرض عبر واتساب</h3>
            <div className="mb-4">
              <label className="block mb-2 font-medium">رقم الهاتف</label>
              <input
                type="text"
                name="phoneNumber"
                className="input input-bordered w-full"
                placeholder="ادخل رقم الهاتف"
                value={whatsappModal.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">الرسالة (اختياري)</label>
              <textarea
                name="message"
                className="textarea textarea-bordered w-full h-32"
                placeholder="اكتب رسالتك هنا..."
                value={whatsappModal.message}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setWhatsappModal({
                    isOpen: false,
                    phoneNumber: "",
                    message: "",
                  })
                }
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

export default AdminDashboard;