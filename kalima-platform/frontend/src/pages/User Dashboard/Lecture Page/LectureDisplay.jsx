import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllContainers } from "../../../routes/lectures"
import UserSidebar from '../../../components/UserSidebar';
import { useTranslation } from "react-i18next"
import { FaBars } from "react-icons/fa"

const LectureList = () => {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

   useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
  
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setLoading(true)
        const result = await getAllContainers()
        setContainers(result.data.containers)
        setLoading(false)
      } catch (err) {
        setError("Failed to load containers. Please try again later.")
        setLoading(false)
        console.error("Error:", err)
      }
    }

    fetchContainers()
  }, [])

  const handleContainerClick = (containerId) => {
    // If the container has children (lectures), navigate to the container details page
    navigate(`/container-details/${containerId}`)
  }

 
 
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col ${
        sidebarOpen && !isMobile ? ` ${isRTL ? 'mr-52' : 'ml-52'} transition-all duration-500` : `mr-0`
      }`}
      dir={isRTL ? 'ltr' : 'rtl'}
    >
      {/* Mobile Sidebar Toggle Button */}
      <div className={`md:hidden fixed top-16 ${isRTL ? 'left-4' : 'right-4'} z-50`}>
        <button
          id="sidebar-toggle"
          className="btn btn-circle btn-primary"
          onClick={toggleSidebar}
          aria-label={t('toggleSidebar')}
        >
          <FaBars className="w-5 h-5" />
        </button>
      </div>
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">الكورسات المتاحه</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container) => (
            <div
              key={container._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => handleContainerClick(container._id)}
            >
              <div className="card-body">
                <h2 className="card-title">{container.name}</h2>
                <div className="badge badge-primary">{container.subject.name}</div>
                <div className="badge badge-secondary">{container.level.name}</div>

                {container.description && <p className="mt-2">{container.description}</p>}

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span>{container.createdBy.name.charAt(0)}</span>
                      </div>
                    </div>
                    <span className="text-sm">{container.createdBy.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">{container.price}</span> جنيه
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <div>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {container.numberOfViews || 0}
                    </span>
                  </div>
                  <div>{container.type}</div>
                </div>

                {container.children && container.children.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="font-semibold">Contains:</span> {container.children.length} items
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LectureList

