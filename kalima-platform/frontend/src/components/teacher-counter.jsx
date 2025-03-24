import { Plus } from "lucide-react"

export default function TeacherCounter() {
  return (
    <div className=" rounded-full bg-primary-content  shadow-lg px-4 py-3 flex items-center gap-3">
      {/* Right side - Arabic text */}
      <div className="flex flex-col items-end">
        <h2 className="text-primary text-xl font-bold">معلمين</h2>
        <div className="flex items-center gap-1">
          <span className="text-primary text-base font-bold">معلم</span>
          <span className="text-primary text-2xl font-bold">+10</span>
        </div>
      </div>

      {/* Teacher avatars */}
      <div className="flex">
        <div className=" rounded-full  overflow-hidden">
          <img src="/teacher_illustration.png" alt="Teacher 1" className="w-8 h-8 object-cover text-primary" />
        </div>
        <div className=" rounded-full   overflow-hidden">
          <img src="/teacher_illustration.png" alt="Teacher 2" className="w-8 h-8 object-cover text-primary" />
        </div>
        <div className=" rounded-full   overflow-hidden">
          <img src="/teacher_illustration.png" alt="Teacher 3" className="w-8 h-8 object-cover text-primary" />
        </div>
        <div className=" rounded-full   overflow-hidden">
          <img src="/teacher_illustration.png" alt="Teacher 4" className="w-8 h-8 object-cover text-primary" />
        </div>
      </div>

      {/* Add button */}
      <button className="btn rounded-full bg-primary hover:bg-accent">
        <Plus size={16} />
      </button>
    </div>
  )
}

