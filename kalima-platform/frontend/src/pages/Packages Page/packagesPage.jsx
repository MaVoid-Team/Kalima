import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from "../../routes/auth-services";
const API_URL = process.env.REACT_APP_BASE_URL;


const PackagesPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [priceFilter, setPriceFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('');
    const itemsPerPage = 6;

    // Fetch packages from API
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${API_URL}/packages/`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });
                const data = await response.json();
                const mappedPackages = data.data.packages.map(pkg => ({
                    id: pkg._id,
                    title: pkg.name,
                    image: 'https://picsum.photos/600/400',
                    subjects: pkg.points.length,
                    teachers: pkg.points.map(() => 'https://dummyimage.com/40x40/000/fff'),
                    duration: pkg.type === 'month' ? '1 month' : 'per lecture',
                    students: Math.floor(Math.random() * 500) + 100,
                    price: `$${pkg.price}`,
                    details: 'Package details...',
                    goal: "Comprehensive learning package for students",
                    description: "A complete learning solution covering core subjects",
                    content: [
                        "Mathematics - Prof. John Smith",
                        "English - Dr. Sarah Johnson",
                        "Science - Prof. Michael Brown"
                    ],
                    features: [
                        "Weekly video lectures",
                        "Step-by-step content organization",
                        "Continuous revisions",
                        "Subscription-based access"
                    ]
                }));
                setPackages(mappedPackages);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = packages.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <div className="text-center p-8">Loading packages...</div>;

    return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="hero bg-base-200 rounded-xl p-8 mb-12">
        <div className="hero-content flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-6">Our Subscription Packages</h1>
            <ul className="list-disc pl-6 space-y-4 mb-6">
              <li>Each package contains from 5 to 10 different subjects</li>
              <li>Each package has its own experienced teacher</li>
              <li>After subscribing student can see any lecture in any subject inside the package</li>
              <li>Subscription must be renewed monthly</li>
            </ul>
          </div>
          <img 
            src="https://picsum.photos/800/600" 
            className="max-w-sm rounded-lg shadow-2xl" 
            alt="Package visual"
          />
        </div>
      </div>

      {/* Search Filters */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Search Based On</h2>
        <div className="flex gap-4 flex-wrap">
          <select className="select select-bordered w-full max-w-xs" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="">Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-150">$100 - $150</option>
          </select>
          
          <select className="select select-bordered w-full max-w-xs" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">Subject</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="history">History</option>
          </select>
          
          <select className="select select-bordered w-full max-w-xs" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
            <option value="">Teacher</option>
            <option value="john">John Doe</option>
            <option value="jane">Jane Smith</option>
            <option value="mike">Mike Johnson</option>
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-3 grid-rows-2 gap-8 mb-12">
        {currentItems.map(pkg => (
          <div key={pkg.id} className="card bg-base-100 shadow-xl rounded-xl">
            <figure className="px-4 pt-4">
              <img src={pkg.image} alt="Package" className="rounded-xl h-48 w-full object-cover" />
            </figure>
            <div className="card-body">
              <div className="flex -space-x-4 mb-4">
                {pkg.teachers.map((teacher, index) => (
                  <img 
                    key={index} 
                    src={teacher} 
                    alt="Teacher" 
                    className="w-10 h-10 rounded-full border-2 border-white" 
                  />
                ))}
              </div>
              <h3 className="card-title">{pkg.title}</h3>
              <p>Subjects: {pkg.subjects}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {pkg.duration}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {pkg.students}
                </span>
              </div>
              <div className="card-actions justify-between items-center mt-4">
                <span className="text-xl font-bold">{pkg.price}</span>
                <button 
                className="btn btn-primary"
                onClick={() => navigate(`/package-details/${pkg.id}`, { state: { package: pkg } })}
                >
                Show Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="join flex justify-center">
        <button 
          className="join-item btn" 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button className="join-item btn">Page {currentPage}</button>
        <button 
          className="join-item btn" 
          onClick={() => setCurrentPage(p => (p >= packages.length/itemsPerPage ? p : p + 1))}
          disabled={currentPage >= packages.length/itemsPerPage}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default PackagesPage;