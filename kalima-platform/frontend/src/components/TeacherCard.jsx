import { motion} from "framer-motion";

import { FileText, Clock, Star } from "lucide-react";
function TeacherCard({ teacher }) {
  return (
    <motion.div
      className="rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl shadow-lg duration-500"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <img
          src={teacher.image || "/placeholder.svg"}
          alt={teacher.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
          {teacher.subject}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2 text-right">{teacher.name}</h4>
        <div className="flex justify-end items-center gap-2 mb-2">
          <span className="text-sm">{teacher.experience}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mb-4">
          <span className="text-sm">{teacher.grade}</span>
          <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center">
            <FileText className="h-3 w-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex">
            {[...Array(teacher.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <button className="btn btn-sm btn-primary rounded-full">
            عرض التفاصيل
          </button>
        </div>
      </div>
    </motion.div>
  );
} 
export default TeacherCard;