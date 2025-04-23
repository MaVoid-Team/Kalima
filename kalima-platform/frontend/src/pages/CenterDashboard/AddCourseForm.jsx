import { Plus } from "lucide-react"

const AddCourseForm = () => {
  return (
    <div className=" rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-end p-4 rounded-t-lg">
        <div className="flex items-center justify-center">
          <div className="font-medium btn btn-primary">إضافة كورس جديد
          <Plus className="ml-2 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Course Title Input */}
      <div className="p-4">
        <input
          type="text"
          placeholder="...اكتب عنوان الكورس هنا"
          className="input input-bordered w-full bg-primary text-white placeholder:text-white h-14 text-right p-10"
        />
      </div>

      {/* Three Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div>
          <div className="flex items-center justify-end mb-2">
            <span className="font-medium">الفئة</span>
            <span className="text-primary font-bold ml-2">•</span>
          </div>
          <div className="dropdown dropdown-top dropdown-end w-full">
            <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
              <span>▼</span>
              <span>اللغة الألمانية</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-end mb-2">
            <span className="font-medium">المحاضر</span>
            <span className="text-primary font-bold ml-2">•</span>
          </div>
          <div className="dropdown dropdown-top dropdown-end w-full">
            <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
              <span>▼</span>
              <span>أبناء علي</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-end mb-2">
            <span className="font-medium">السعر</span>
            <span className="text-primary font-bold ml-2">•</span>
          </div>
          <div className="dropdown dropdown-top dropdown-end w-full">
            <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
              <span>▼</span>
              <span>250</span>
            </div>
          </div>
        </div>
      </div>

      {/* Education Level */}
      <div className="p-4">
        <div className="text-right mb-2 font-medium">المستوى</div>
        <div className="flex flex-wrap gap-4 justify-end">
          <button className="btn btn-outline min-w-[120px]">الثانوية</button>
          <button className="btn btn-outline min-w-[120px]">الإعدادية</button>
          <button className="btn btn-outline min-w-[120px]">الابتدائية</button>
        </div>
      </div>

      {/* Course Description */}
      <div className="p-4">
        <div className="text-right mb-2 font-medium">وصف الكورس</div>
        <textarea
          className="textarea textarea-bordered w-full h-32 text-right"
          placeholder="اكتب وصف الكورس هنا..."
          defaultValue="هذا الكورس مصمم للمبتدئين الذين يرغبون في تعلم أساسيات قوي في التحدث والقراءة وفهم اللغة الألمانية. بنهاية الكورس، سيتمكن الطالب من التواصل بثقة في المواقف اليومية."
        ></textarea>
      </div>

      {/* What Will Students Learn */}
      <div className="p-4">
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
    </div>
  )
}

export default AddCourseForm
