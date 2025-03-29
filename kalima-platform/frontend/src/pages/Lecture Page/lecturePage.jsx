import React, { useState, useEffect } from 'react';
import { isMobile } from '../../utils/isMobile'; // Import the isMobile function
import { useNavigate } from 'react-router-dom';

// Mock data for lectures
const lectureData = [
  {
    id: 1,
    title: "محتوى المادة",
    subtitle: "الفصل الثاني - المحاضرة الأولى",
    instructor: "أحمد سلامة",
    videoUrl: "https://example.com/video1.mp4",
    sections: [
      { id: 1, title: "الفصل الأول", type: "مقدمة" },
      { id: 2, title: "الفصل الثاني", type: "المقدمة" },
      { id: 3, title: "الفصل الثالث", type: "المحتوى" },
      { id: 4, title: "الفصل الرابع", type: "الحوار" },
      { id: 5, title: "الفصل الخامس", type: "مراجعة" }
    ]
  },
  {
    id: 2,
    title: "محتوى المادة",
    subtitle: "الفصل الثاني - المحاضرة الأولى",
    instructor: "أحمد سلامة",
    videoUrl: "https://example.com/video2.mp4",
    sections: [
      { id: 1, title: "الفصل الأول", type: "مقدمة" },
      { id: 2, title: "الفصل الثاني", type: "المقدمة" },
      { 
        id: 3, 
        title: "الفصل الثاني", 
        type: "المحتوى",
        subsections: [
          { id: 31, title: "القسم الفرعي الأول" },
          { id: 32, title: "القسم الفرعي الثاني" },
          { id: 33, title: "القسم الفرعي الثالث" },
          { id: 34, title: "القسم الفرعي الرابع" }
        ]
      },
      { id: 4, title: "الفصل الرابع", type: "الحوار" },
      { id: 5, title: "الفصل الخامس", type: "مراجعة" }
    ]
  },
  {
    id: 3,
    title: "محتوى المادة",
    subtitle: "الفصل الثاني - المحاضرة الأولى",
    instructor: "أحمد سلامة",
    videoUrl: "https://example.com/video3.mp4",
    image: "/images/lecture-illustration1.png"
  },
  {
    id: 4,
    title: "محتوى المادة",
    subtitle: "الفصل الثاني - المحاضرة الأولى",
    instructor: "أحمد سلامة",
    videoUrl: "https://example.com/video4.mp4",
    image: "/images/lecture-illustration2.png"
  },
  {
    id: 5,
    title: "محتوى المادة",
    subtitle: "الفصل الثاني - المحاضرة الأولى",
    instructor: "أحمد سلامة",
    videoUrl: "https://example.com/video5.mp4",
    image: "/images/lecture-illustration3.png"
  },
  {
    id: 6,
    title: "اختبار",
    quizTime: "10:15",
    quizResults: [
      { id: 1, text: "أكمل هذه العبارة: تعتبر الخوارزميات هي مجموعة من الخطوات المنطقية المتسلسلة التي تهدف إلى حل مشكلة معينة", correct: true },
      { id: 2, text: "اختر الإجابة الصحيحة", correct: true },
      { id: 3, text: "أكمل الفراغ", correct: true },
      { id: 4, text: "اختر كل ما ينطبق", correct: true },
      { id: 5, text: "رتب الخطوات التالية", correct: true }
    ],
    score: "10/10"
  }
];

// Quiz completion data
const quizCompletionData = {
  title: "حاول مرة ثانية",
  score: "2/10",
  image: "/images/quiz-illustration.png"
};

// Tab data
const tabData = [
  { id: "lectures", label: "محاضرات", active: true },
  { id: "attachments", label: "مرفقات", active: false },
  { id: "assignments", label: "واجبات", active: false },
  { id: "tests", label: "اختبارات", active: false }
];

const LecturePage = () => {
  const [activeTab, setActiveTab] = useState("lectures");
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeLecture, setActiveLecture] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not on mobile
    if (!isMobile()) {
      navigate('/mobile-only');
    }
  }, [navigate]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderVideoPlayer = (lecture) => {
    return (
      <div className="bg-base-200 rounded-lg aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="btn btn-circle btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="btn btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="btn btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-base-content">00:00 / 10:30</div>
        </div>
      </div>
    );
  };

  const renderLectureContent = (lecture) => {
    if (lecture.image) {
      return (
        <div className="mt-4">
          {renderVideoPlayer(lecture)}
          <div className="mt-4 flex justify-center">
            <img src={lecture.image || "/placeholder.svg"} alt="Lecture illustration" className="w-3/4 h-auto" />
          </div>
        </div>
      );
    }
    
    if (lecture.quizTime) {
      return (
        <div className="mt-4">
          <div className="bg-primary text-primary-content p-4 rounded-lg flex items-center gap-3">
            <div className="btn btn-circle btn-sm bg-primary-content text-primary">
              {lecture.quizTime}
            </div>
            <img src="/images/quiz-illustration.png" alt="Quiz" className="w-16 h-16" />
          </div>
          <div className="mt-4 space-y-3">
            {lecture.quizResults.map(result => (
              <div key={result.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-success-content">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-right flex-1">{result.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <div className="badge badge-lg badge-success">{lecture.score}</div>
          </div>
          <div className="mt-6">
            <button className="btn btn-primary w-full">حفظت</button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        {renderVideoPlayer(lecture)}
        <div className="mt-4">
          {lecture.sections && (
            <div className="space-y-2">
              {lecture.sections.map(section => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-3 flex justify-between items-center cursor-pointer bg-base-200"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="text-right">
                      <div className="text-sm font-medium">{section.title}</div>
                      <div className="text-xs text-base-content/70">{section.type}</div>
                    </div>
                    <button className="btn btn-sm btn-circle">
                      {expandedSection === section.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {expandedSection === section.id && section.subsections && (
                    <div className="p-3 bg-base-100 border-t">
                      <ul className="space-y-2">
                        {section.subsections.map(subsection => (
                          <li key={subsection.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span>{subsection.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizCompletion = () => {
    return (
      <div className="card bg-base-100 shadow-md overflow-hidden">
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-primary">{quizCompletionData.title}</h2>
          <div className="flex justify-center my-4">
            <img src={quizCompletionData.image || "/placeholder.svg"} alt="Quiz result" className="w-32 h-32" />
          </div>
          <div className="badge badge-lg badge-error mb-4">{quizCompletionData.score}</div>
        </div>
      </div>
    );
  };

  const renderLectureCard = (lecture) => {
    return (
      <div className="card bg-base-100 shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handleBack} className="btn btn-circle btn-sm btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-primary">{lecture.title}</h2>
          </div>

          {renderLectureContent(lecture)}

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-right flex-1">
                <h3 className="font-medium">{lecture.subtitle}</h3>
                <div className="flex items-center gap-1 text-sm text-base-content/70">
                  <span>{lecture.instructor}</span>
                  <div className="avatar">
                    <div className="w-5 h-5 rounded-full">
                      <img src="/images/avatar.png" alt="Instructor" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex border-b">
            {tabData.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-2 text-sm font-medium ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-base-content/70'}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // If not on mobile, show a message
  if (!isMobile()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Mobile Only Content</h1>
        <p className="text-base-content">This content is only available on mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto" dir="rtl">
      <div className="grid grid-cols-1 gap-4">
        {renderLectureCard(lectureData[activeLecture - 1])}
        
        {/* Quiz completion card - shown separately as in the design */}
        {activeLecture === 6 && renderQuizCompletion()}
      </div>
    </div>
  );
};

export default LecturePage;