import { Plus, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
const AddCourseForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  return (
    <div className="bg-base-100 rounded-lg shadow-sm" dir={dir}>
      {/* Header */}
      <div
        className={`flex p-4 rounded-t-lg`}
      >
        <button className="btn btn-ghost gap-2">
          {isRTL ? "إضافة كورس جديد" : "Add New Course"}
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Course Title Input */}
      <div className="p-4">
        <input
          type="text"
          placeholder={
            isRTL ? "...اكتب عنوان الكورس هنا" : "Enter course title..."
          }
          className={`input input-bordered w-full bg-primary text-primary-content placeholder:text-primary-content/80 h-14 p-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        />
      </div>

      <div className={`bg-base-100 p-4 rounded-lg shadow-sm `} dir={dir}>
        {/* Top Row - Filter Controls */}
        <div
          className={`flex flex-col md:flex-row ${
            isRTL ? "md:flex-row-reverse" : ""
          } gap-4 md:gap-6 mb-4`}
        >
          {/* Price Filter */}
          <div className="flex-1">
            <h3
              className={`${
                isRTL ? "text-right" : "text-left"
              } font-bold text-base-content mb-2 `}
            >
              {isRTL ? "السعر" : "Price"}
            </h3>
            <div className="relative">
              <select
                className={`select select-bordered w-full bg-base-200 text-base-content ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              >
                <option>250</option>
                <option>{isRTL ? "0-500" : "0-500"}</option>
                <option>{isRTL ? "500-1000" : "500-1000"}</option>
              </select>
              <ChevronDown
                className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70 ${
                  isRTL ? "left-3" : "right-3"
                }`}
              />
            </div>
          </div>

          {/* Lecturer Filter */}
          <div className="flex-1">
            <h3
              className={`${
                isRTL ? "text-right" : "text-left"
              } font-bold text-base-content mb-2 `}
            >
              {isRTL ? "المحاضر" : "Lecturer"}
            </h3>
            <div className="relative">
              <select
                className={`select select-bordered w-full bg-base-200 text-base-content ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              >
                <option>{isRTL ? "أ/ علاء علي" : "Mr. Alaa Ali"}</option>
                <option>{isRTL ? "أ/ محمد أحمد" : "Mr. Mohamed Ahmed"}</option>
                <option>{isRTL ? "أ/ سارة خالد" : "Ms. Sara Khaled"}</option>
              </select>
              <ChevronDown
                className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70 ${
                  isRTL ? "left-3" : "right-3"
                }`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <h3
              className={`${
                isRTL ? "text-right" : "text-left"
              } font-bold text-base-content mb-2 `}
            >
              {isRTL ? "الفئة" : "Category"}
            </h3>
            <div className="relative">
              <select
                className={`select select-bordered w-full bg-base-200 text-base-content ${
                  isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              >
                <option>{isRTL ? "اللغة الألمانية" : "German Language"}</option>
                <option>
                  {isRTL ? "اللغة الإنجليزية" : "English Language"}
                </option>
                <option>{isRTL ? "الرياضيات" : "Mathematics"}</option>
              </select>
              <ChevronDown
                className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/70 ${
                  isRTL ? "left-3" : "right-3"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Second Row - Level Buttons */}
        <div className={`flex flex-col `}>
          <h3 className="font-bold text-base-content mb-2">
            {isRTL ? "المستوى" : "Level"}
          </h3>
          <div className={`flex flex-wrap gap-2 w-full `}>
            <button className="btn btn-outline btn-sm border-base-300 bg-base-200 text-base-content hover:bg-base-300">
              {isRTL ? "الابتدائية" : "Elementary"}
            </button>
            <button className="btn btn-outline btn-sm border-base-300 bg-base-200 text-base-content hover:bg-base-300">
              {isRTL ? "الاعدادية" : "Preparatory"}
            </button>
            <button className="btn btn-outline btn-sm border-base-300 bg-base-200 text-base-content hover:bg-base-300">
              {isRTL ? "الثانوية" : "Secondary"}
            </button>
          </div>
        </div>
      </div>
      {/* Course Description */}
      {/* Course Description */}
      <div className="p-4 ">
        <div className="font-bold text-base-content mb-2">
          {isRTL ? "وصف الكورس" : "Course Description"}
        </div>
        <textarea
          className="textarea textarea-bordered w-full h-32 bg-base-200 text-base-content"
          placeholder={
            isRTL ? "اكتب وصف الكورس هنا..." : "Enter course description..."
          }
        ></textarea>
      </div>

      {/* What Will Students Learn */}
      <div className="p-4 ">
        <div className="font-bold text-base-content mb-2">
          {isRTL ? "ما الذي سيتعلمه الطالب؟" : "What Will Students Learn?"}
        </div>
        <input
          type="text"
          placeholder={isRTL ? "مهارات التحدث" : "Speaking skills"}
          className="input input-bordered w-full bg-base-200 text-base-content mb-4"
        />
        <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
          <button className="btn btn-outline min-w-[120px]">
            {isRTL ? "إضافة مهارة" : "Add Skill"}
          </button>
        </div>
      </div>
      <div className="text-right mb-2 font-medium">ما الذي سيتعلمه الطالب؟</div>
      <input
        type="text"
        placeholder="مهارات التحدث"
        className="input input-bordered w-full text-right mb-4"
        defaultValue="مهارات التحدث"
      />
      <div className="flex justify-end">
        <button className="btn btn-outline min-w-[120px]">الابتدائية</button>
      </div>
    </div>
  );
};

export default AddCourseForm;
