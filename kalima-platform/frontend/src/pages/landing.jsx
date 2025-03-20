import { useNavigate } from "react-router-dom" // Using React Router instead of Next.js Router

// New Curved Arrow component with the provided SVG
const CurvedArrow = () => (
  <div className="relative h-32 w-32 animate-bounce">
    <svg width="86" height="103" viewBox="0 0 86 103" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00a99d]">
      <path d="M3.38242 101.131C4.13277 102.608 5.93856 103.197 7.41577 102.447C8.89298 101.697 9.48221 99.891 8.73187 98.4138L3.38242 101.131ZM85.3485 15.8361C86.0077 14.3161 85.3098 12.5494 83.7897 11.8902L59.0187 1.148C57.4986 0.488803 55.7319 1.18668 55.0728 2.70676C54.4136 4.22683 55.1114 5.99348 56.6315 6.65268L78.6502 16.2013L69.1016 38.22C68.4424 39.7401 69.1403 41.5067 70.6603 42.1659C72.1804 42.8251 73.9471 42.1273 74.6062 40.6072L85.3485 15.8361ZM8.73187 98.4138C5.42346 91.9005 4.36996 79.646 14.0033 64.9607C23.6636 50.2343 44.1092 33.0717 83.6983 17.4327L81.4939 11.8524C41.2729 27.7409 19.5784 45.5231 8.98642 61.6697C-1.63249 77.8574 -1.0504 92.4041 3.38242 101.131L8.73187 98.4138Z" fill="currentColor"/>
    </svg>
  </div>
)

// Teal Circles SVG Component
const TealCircles = () => (
  <svg width="525" height="759" viewBox="0 0 525 759" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path fillRule="evenodd" clipRule="evenodd" d="M510.102 539.398C563.21 484.767 577.922 400.164 540.664 328.986C494.24 240.297 384.71 206.035 296.021 252.459C218.625 292.971 182.678 381.542 205.63 462.382C218.695 448.942 234.084 437.316 251.595 428.15C340.284 381.726 449.815 415.988 496.238 504.677C502.15 515.97 506.753 527.602 510.102 539.398Z" fill="#069495" fillOpacity="0.33"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M559.598 246.467C504.946 193.834 420.699 179.369 349.782 216.495C261.096 262.924 226.839 372.457 273.269 461.143C316.612 543.936 414.951 579.292 499.984 545.851C486.291 532.664 474.455 517.08 465.153 499.31C418.723 410.624 452.979 301.092 541.666 254.662C547.559 251.577 553.545 248.848 559.598 246.467Z" fill="#069495" fillOpacity="0.33"/>
    <circle cx="285.357" cy="160.053" r="78.1885" transform="rotate(-56.093 285.357 160.053)" fill="#069495"/>
  </svg>
)

// Flow Lines SVG Component
const FlowLines = () => (
  <svg width="1440" height="392" viewBox="0 0 1440 392" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M90.8784 35.253C90.8784 35.253 976.208 -109.909 598.415 197.434C220.621 504.776 1120.37 -136.939 1102.97 152.884C1085.57 442.706 1440 258.001 1440 258.001" stroke="url(#paint0_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M78.6987 39.253C78.6987 39.253 964.029 -105.909 586.235 201.434C208.441 508.776 1108.19 -132.939 1090.79 156.884C1073.39 446.706 1427.82 262.001 1427.82 262.001" stroke="url(#paint1_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M68.3931 48.253C68.3931 48.253 953.723 -96.9085 575.929 210.434C198.135 517.776 1097.88 -123.939 1080.48 165.884C1063.08 455.706 1417.51 271.001 1417.51 271.001" stroke="url(#paint2_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M54.3396 54.253C54.3396 54.253 939.67 -90.9085 561.876 216.434C184.082 523.776 1083.83 -117.939 1066.43 171.884C1049.03 461.706 1403.46 277.001 1403.46 277.001" stroke="url(#paint3_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M44.9707 65.253C44.9707 65.253 930.301 -79.9085 552.507 227.434C174.713 534.776 1074.46 -106.939 1057.06 182.884C1039.66 472.706 1394.09 288.001 1394.09 288.001" stroke="url(#paint4_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M37.4756 72.253C37.4756 72.253 922.806 -72.9085 545.012 234.434C167.218 541.776 1066.96 -99.9385 1049.57 189.884C1032.17 479.706 1386.6 295.001 1386.6 295.001" stroke="url(#paint5_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M24.3591 81.253C24.3591 81.253 909.689 -63.9085 531.895 243.434C154.101 550.776 1053.85 -90.9385 1036.45 198.884C1019.05 488.706 1373.48 304.001 1373.48 304.001" stroke="url(#paint6_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M15.9272 90.253C15.9272 90.253 901.257 -54.9085 523.463 252.434C145.67 559.776 1045.42 -81.9385 1028.02 207.884C1010.62 497.706 1365.05 313.001 1365.05 313.001" stroke="url(#paint7_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M8.43213 101.253C8.43213 101.253 893.762 -43.9085 515.968 263.434C138.174 570.776 1037.92 -70.9385 1020.52 218.884C1003.12 508.706 1357.55 324.001 1357.55 324.001" stroke="url(#paint8_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <path d="M0 110.253C0 110.253 885.33 -34.9085 507.536 272.434C129.742 579.776 1029.49 -61.9385 1012.09 227.884C994.691 517.706 1349.12 333.001 1349.12 333.001" stroke="url(#paint9_linear_115_33)" strokeOpacity="0.4" strokeWidth="0.8"/>
    <defs>
      <linearGradient id="paint0_linear_115_33" x1="90.8784" y1="158.5" x2="1440" y2="158.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint1_linear_115_33" x1="78.6987" y1="162.5" x2="1427.82" y2="162.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint2_linear_115_33" x1="68.3931" y1="171.5" x2="1417.51" y2="171.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint3_linear_115_33" x1="54.3396" y1="177.5" x2="1403.46" y2="177.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint4_linear_115_33" x1="44.9707" y1="188.5" x2="1394.09" y2="188.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint5_linear_115_33" x1="37.4756" y1="195.5" x2="1386.6" y2="195.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint6_linear_115_33" x1="24.3591" y1="204.5" x2="1373.48" y2="204.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint7_linear_115_33" x1="15.9272" y1="213.5" x2="1365.05" y2="213.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint8_linear_115_33" x1="8.43213" y1="224.5" x2="1357.55" y2="224.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
      <linearGradient id="paint9_linear_115_33" x1="0" y1="233.5" x2="1349.12" y2="233.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#13D3D4"/>
        <stop offset="0.509722" stopColor="#069495"/>
      </linearGradient>
    </defs>
  </svg>
)

// Zigzag Wide SVG Component
const ZigzagWide = () => (
  <svg width="148" height="38" viewBox="0 0 148 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48">
    <path d="M2.36157 18.1707L22.1034 2L39.8029 18.1707" stroke="#069495" strokeWidth="3"/>
    <path d="M108.559 18.1707L128.301 2L146 18.1707" stroke="#069495" strokeWidth="3"/>
    <path d="M73.1597 18.1707L92.9015 2L110.601 18.1707" stroke="#069495" strokeWidth="3"/>
    <path d="M37.7607 18.1707L57.5025 2L75.2021 18.1707" stroke="#069495" strokeWidth="3"/>
    <path d="M1 27.7074L20.7418 11.5366L38.4413 27.7074" stroke="#069495" strokeWidth="3"/>
    <path d="M107.197 27.7074L126.939 11.5366L144.638 27.7074" stroke="#069495" strokeWidth="3"/>
    <path d="M71.7981 27.7074L91.5399 11.5366L109.239 27.7074" stroke="#069495" strokeWidth="3"/>
    <path d="M36.3989 27.7074L56.1407 11.5366L73.8402 27.7074" stroke="#069495" strokeWidth="3"/>
    <path d="M1 36.0001L20.7418 19.8293L38.4413 36.0001" stroke="#069495" strokeWidth="3"/>
    <path d="M107.197 36.0001L126.939 19.8293L144.638 36.0001" stroke="#069495" strokeWidth="3"/>
    <path d="M71.7981 36.0001L91.5399 19.8293L109.239 36.0001" stroke="#069495" strokeWidth="3"/>
    <path d="M36.3989 36.0001L56.1407 19.8293L73.8402 36.0001" stroke="#069495" strokeWidth="3"/>
  </svg>
)

export default function CivilcoLanding() {
  const navigate = useNavigate() // Using React Router's navigate instead of Next.js router

  const handleTeacherClick = () => {
    console.log("Teacher selected")
    navigate('/login') // Using navigate instead of router.push
  }

  const handleStudentClick = () => {
    console.log("Student selected")
    navigate('/login') // Using navigate instead of router.push
  }

  return (
    <div className="min-h-screen bg-[#f0f9fa] relative overflow-hidden">
      {/* Yellow circle decoration */}
      <div className="absolute top-20 left-[350px] z-0">
        <div className="w-10 h-10 rounded-full bg-[#e6a11f]"></div>
      </div>

      {/* Teal circles SVG - right side */}
      <div className="absolute top-0 right-0 z-0 w-[600px] h-[600px]">
        <TealCircles />
      </div>

      {/* Yellow circle decoration - bottom right */}
      <div className="absolute bottom-20 right-20 z-0">
        <div className="w-24 h-24 rounded-full border-4 border-[#e6a11f]"></div>
      </div>

      {/* Updated zigzag pattern decoration */}
      <div className="absolute top-72 left-20 z-0">
        <ZigzagWide />
      </div>

      {/* Arrow decoration */}
      <div className="absolute bottom-32 left-20 z-0">
        <CurvedArrow />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-12 mt-8">
          <img src="civilco_logo.png" alt="CIVILCOaaa Logo" className="h-16 object-contain" />
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" dir="rtl">
            مرحبا بك في منصة{" "}
            <span className="text-[#00a99d] relative">
              كلمة
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#00a99d] rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-12 max-w-3xl mx-auto text-gray-700" dir="rtl">
            منصة كلمة هي منصة تعليم إلكتروني توفر المنصة موارد للطلاب من الصف الرابع الابتدائي حتى الصف الثالث الثانوي.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-12 mt-16" dir="rtl">
            من انـــــــت ؟
          </h2>

          {/* Role selection cards with flow lines */}
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Background flow lines */}
            <div className="absolute inset-0 -z-10 w-full h-full">
              <FlowLines />
            </div>

            {/* Teacher card */}
            <div className="flex flex-col items-center">
              <div className="bg-[#cae8eb] rounded-lg p-6 mb-6 w-full max-w-sm mx-auto">
                <img
                  src="teacher_illustration.png"
                  alt="Teacher illustration"
                  className="mx-auto mb-4 w-full max-w-[200px]"
                />
              </div>
              <button
                onClick={handleTeacherClick}
                className="bg-[#00a99d] hover:bg-[#008c82] text-white font-bold py-3 px-12 rounded-md text-lg transition-colors"
              >
                معلم
              </button>
            </div>

            {/* Student card */}
            <div className="flex flex-col items-center">
              <div className="bg-[#cae8eb] rounded-lg p-6 mb-6 w-full max-w-sm mx-auto">
                <img
                  src="student_illustration.png"
                  alt="Student illustration"
                  className="mx-auto mb-4 w-full max-w-[200px]"
                />
              </div>
              <button
                onClick={handleStudentClick}
                className="bg-[#00a99d] hover:bg-[#008c82] text-white font-bold py-3 px-12 rounded-md text-lg transition-colors"
              >
                طالب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}