import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Phone, Book } from 'lucide-react';

const LecturersList = ({ lecturers, isLoading }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLecturers = lecturers.filter(lecturer => 
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">
          {isRTL ? "المحاضرين" : "Lecturers"}
        </h2>
        
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder={isRTL ? "البحث عن محاضر" : "Search lecturer"}
              className="input input-bordered w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-base-content/50`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
          
          <button className="btn btn-primary">
            {isRTL ? "إضافة محاضر" : "Add Lecturer"}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      ) : filteredLecturers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLecturers.map(lecturer => (
            <div key={lecturer._id} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">{lecturer.name}</h3>
                
                <div className="flex items-center gap-2 text-base-content/70">
                  <Phone className="w-4 h-4" />
                  <span>{lecturer.phone}</span>
                </div>
                
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">
                    {isRTL ? "المواد" : "Subjects"}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lecturer.subjects.map(subject => (
                      <div key={subject._id} className="badge badge-primary gap-1">
                        <Book className="w-3 h-3" />
                        {subject.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-sm btn-outline">
                    {isRTL ? "عرض التفاصيل" : "View Details"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-base-content/70">
          {isRTL ? "لا يوجد محاضرين" : "No lecturers found"}
        </div>
      )}
    </div>
  );
};

export default LecturersList;