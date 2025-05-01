import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPackages } from '../../routes/packages'; 

const PackagesPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [priceFilter, setPriceFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('');
    const itemsPerPage = 6;

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const data = await fetchPackages();
                setPackages(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load packages. Please try again later.');
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    if (loading) return <div className="text-center p-8">Loading packages...</div>;
    if (error) return <div className="text-center p-8 text-error">{error}</div>;

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = packages.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Filters */}
            <div className="mb-12 flex justify-center">
                <div className="flex gap-4 flex-wrap justify-center">
                    <select 
                        className="select select-bordered w-full max-w-xs" 
                        value={priceFilter} 
                        onChange={(e) => setPriceFilter(e.target.value)}
                    >
                        <option value="">الكل (Price)</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-150">$100 - $150</option>
                    </select>

                    <select 
                        className="select select-bordered w-full max-w-xs" 
                        value={subjectFilter} 
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="">الكل (Subject)</option>
                        <option value="math">Mathematics</option>
                        <option value="science">Science</option>
                        <option value="history">History</option>
                    </select>

                    <select 
                        className="select select-bordered w-full max-w-xs" 
                        value={teacherFilter} 
                        onChange={(e) => setTeacherFilter(e.target.value)}
                    >
                        <option value="">الكل (Teacher)</option>
                        <option value="john">John Doe</option>
                        <option value="jane">Jane Smith</option>
                        <option value="mike">Mike Johnson</option>
                    </select>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentItems.map(pkg => (
                    <div key={pkg.id} className="card bg-base-100 shadow-xl rounded-xl">
                        <figure className="px-4 pt-4">
                            <img 
                                src={pkg.image} 
                                alt="Package" 
                                className="rounded-xl h-48 w-full object-cover" 
                            />
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
                            <h3 className="card-title text-center">{pkg.title}</h3>
                            <div className="card-actions justify-between items-center mt-4">
                                <span className="text-xl font-bold">{pkg.price}</span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/package-details/${pkg.id}`, { state: { package: pkg } })}
                                >
                                    اشترك الآن
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="join flex justify-center mb-12">
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
                    onClick={() => setCurrentPage(p => (p >= packages.length / itemsPerPage ? p : p + 1))}
                    disabled={currentPage >= packages.length / itemsPerPage}
                >
                    »
                </button>
            </div>

            {/* Footer Section */}
            <div className="bg-base-100 p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <img 
                        src="https://picsum.photos/100/100" 
                        alt="Graduation Cap" 
                        className="w-16 h-16" 
                    />
                    <div>
                        <h2 className="text-2xl font-bold">هل تريد تعلم مهارة جديدة الآن؟</h2>
                        <p className="text-sm text-gray-500">تواصل معنا للحصول على المزيد من المعلومات</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-primary">شاهد الفيديو</button>
                    <button className="btn btn-secondary">تواصل معنا</button>
                </div>
            </div>
        </div>
    );
};

export default PackagesPage;