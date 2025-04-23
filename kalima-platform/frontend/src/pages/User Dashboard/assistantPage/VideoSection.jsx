import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaThumbsUp, FaThumbsDown, FaShare, FaCog, FaFileAlt, FaHome, FaPaperclip } from 'react-icons/fa';

const VideoSection = () => {
  const { t, i18n } = useTranslation('assistantPage');
  const isRTL = i18n.language === 'ar';
  
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    watchOnApp: true,
    allowAll: true,
    onlyParents: false,
    onlyTeachersStudents: false
  });

  const videos = [
    { id: 0, title: t('introReact'), duration: "15:30" },
    { id: 1, title: t('componentsBasics'), duration: "12:45" },
    { id: 2, title: t('stateManagement'), duration: "18:20" },
    { id: 3, title: t('hooksDeepDive'), duration: "20:00" },
  ];

  const handleSettingChange = (name, value) => {
    setSettings(prev => {
      const newSettings = {...prev};
      if (name === 'allowAll' && value) {
        newSettings.onlyParents = false;
        newSettings.onlyTeachersStudents = false;
      }
      if (name === 'onlyParents' && value) {
        newSettings.allowAll = false;
        newSettings.onlyTeachersStudents = false;
      }
      if (name === 'onlyTeachersStudents' && value) {
        newSettings.allowAll = false;
        newSettings.onlyParents = false;
      }
      return {...newSettings, [name]: value};
    });
  };

  return (
    <div className="mb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Column */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-gray-500">{t('videoPlayer')}</span>
          </div>
          
          <h2 className={`text-xl lg:text-2xl font-bold mb-4 px-2 lg:px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            {videos[selectedVideo].title}
          </h2>
          
          {/* Video Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 px-2 lg:px-0">
            <div className="flex flex-wrap gap-2 justify-center">
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaThumbsUp className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('like')}</span>
              </button>
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaThumbsDown className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('dislike')}</span>
              </button>
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaShare className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('share')}</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaPaperclip className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('attachments')}</span>
              </button>
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaHome className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('homeworks')}</span>
              </button>
              <button className="btn btn-ghost btn-sm lg:btn-md">
                <FaFileAlt className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('exams')}</span>
              </button>
              <button 
                className="btn btn-ghost btn-sm lg:btn-md"
                onClick={() => setShowSettings(!showSettings)}
              >
                <FaCog className={isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'} /> 
                <span className="text-xs lg:text-base">{t('settings')}</span>
              </button>
            </div>
          </div>

          {/* Access Settings */}
          {showSettings && (
            <div className="mt-4 p-4 lg:p-6 bg-base-200 rounded-xl mx-2 lg:mx-0">
              <div className="space-y-4">
                {[
                  { key: 'watchOnApp', label: t('watchOnApp') },
                  { key: 'allowAll', label: t('allowAll') },
                  { key: 'onlyParents', label: t('onlyParents') },
                  { key: 'onlyTeachersStudents', label: t('onlyTeachersStudents') }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    {isRTL ? (
                      <>
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleSettingChange(key, e.target.checked)}
                          className="toggle toggle-primary order-1"
                        />
                        <span className="text-sm lg:text-base order-2">{label}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm lg:text-base">{label}</span>
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleSettingChange(key, e.target.checked)}
                          className="toggle toggle-primary"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Videos List Column */}
        <div className="lg:col-span-1 px-2 lg:px-0">
          <div className="bg-base-200 p-4 rounded-xl">
            <h3 className={`text-lg font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('courseVideos')}</h3>
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video.id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedVideo === video.id
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-300'
                  }`}
                >
                  <div className={`font-medium text-sm lg:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                    {video.title}
                  </div>
                  <div className={`text-xs lg:text-sm opacity-75 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {video.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <img 
          src={isRTL ? "/background-courses-ar.png" : "/background-courses.png"} 
          alt="Section" 
          className={`w-72 absolute -z-50 translate-y-3/4 ${isRTL ? 'left-0' : 'right-0'}`}
        />
      </div>
    </div>
  );
};

export default VideoSection;