import { Book, Star, Loader } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function CourseCard({ id, image, teacherName, subject, subjectId, level, duration, rating, fetchSubjectDetails }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = async () => {
    setIsLoading(true);
    try {
      await fetchSubjectDetails(subjectId);
    } catch (error) {
      console.error("Error pre-fetching subject details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg overflow-hidden border border-base-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <figure className="relative h-48">
        <img src={image || "/placeholder.svg"} alt={subject} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-base-100 p-1 rounded-md">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
            <div className="w-3 h-3 bg-primary"></div>
          </div>
        </div>
      </figure>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-end text-right">
            <h3 className="font-bold">{teacherName}</h3>
            <p className="text-sm">
              {subject} - {level}
            </p>
          </div>
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
                <circle cx="12" cy="10" r="3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="badge badge-outline badge-sm">{duration} ساعة دراسية</div>
          <div className="flex items-center gap-1 text-right">
            <Book className="h-4 w-4" />
            <span className="text-xs">{subject}</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-bold ml-1">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.floor(rating) ? "text-warning fill-warning" : "text-base-300"}`}
                />
              ))}
            </div>
          </div>
          <Link
            to={`/course-details/${subjectId}`}
            className="btn btn-sm btn-outline btn-accent"
            onClick={handleViewDetails}
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "عرض التفاصيل"}
          </Link>
        </div>
      </div>
    </div>
  );
}