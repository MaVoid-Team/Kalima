import { Plus } from "lucide-react"

export default function TeacherCounter() {
  return (
    <div className=" rounded-full shadow-lg px-4 py-3 flex items-center gap-3">
      {/* Right side - Arabic text */}
      <div className="flex flex-col items-end">
        <h2 className="text-primary text-xl font-bold">معلمين</h2>
        <div className="flex items-center gap-1">
          <span className="text-black text-base font-bold">معلم</span>
          <span className="text-primary text-2xl font-bold">+10</span>
        </div>
      </div>

      {/* Teacher avatars */}
      <div className="flex -space-x-2 flex-row-reverse">
        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
          <img src="/placeholder.svg?height=32&width=32" alt="Teacher 1" className="w-8 h-8 object-cover" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
          <img src="/placeholder.svg?height=32&width=32" alt="Teacher 2" className="w-8 h-8 object-cover" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
          <img src="/placeholder.svg?height=32&width=32" alt="Teacher 3" className="w-8 h-8 object-cover" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
          <img src="/placeholder.svg?height=32&width=32" alt="Teacher 4" className="w-8 h-8 object-cover" />
        </div>
      </div>

      {/* Add button */}
      <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
        <Plus size={16} />
      </button>
    </div>
  )
}

