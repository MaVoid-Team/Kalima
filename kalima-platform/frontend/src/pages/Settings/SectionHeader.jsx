function SectionHeader({ title, icon }) {
    return (
      <div className="flex items-center justify-between mb-4">
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        )}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    )
  }
  
  export default SectionHeader
  
  