import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPackages } from '../../routes/packages';

const PackagesPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [priceFilter, setPriceFilter] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('');
    const itemsPerPage = 6;

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const data = await fetchPackages();
                setPackages(data);
                setFilteredPackages(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load packages. Please try again later.');
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    useEffect(() => {
        let filtered = packages;

        // Apply price filter
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            filtered = filtered.filter(pkg => pkg.price >= min && (max ? pkg.price <= max : true));
        }

        // Apply teacher filter
        if (teacherFilter) {
            filtered = filtered.filter(pkg =>
                pkg.points.some(point => point.lecturer.name.toLowerCase() === teacherFilter.toLowerCase())
            );
        }

        setFilteredPackages(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [priceFilter, teacherFilter, packages]);

    // Get unique lecturer names for teacher filter
    const uniqueTeachers = Array.from(
        new Set(
            packages.flatMap(pkg => pkg.points.map(point => point.lecturer.name))
        )
    ).sort();

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <div className="text-center p-8">Loading packages...</div>;
    if (error) return <div className="text-center p-8 text-error">{error}</div>;

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
                        <option value="">All (Price)</option>
                        <option value="0-500">$0 - $500</option>
                        <option value="500-1000">$500 - $1000</option>
                        <option value="1000-">$1000+</option>
                    </select>

                    <select
                        className="select select-bordered w-full max-w-xs"
                        value={teacherFilter}
                        onChange={(e) => setTeacherFilter(e.target.value)}
                    >
                        <option value="">All (Teacher)</option>
                        {uniqueTeachers.map(teacher => (
                            <option key={teacher} value={teacher}>
                                {teacher}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentItems.map(pkg => (
                    <div key={pkg._id} className="card bg-base-100 shadow-xl rounded-xl">
                        <figure className="px-4 pt-4">
                            <img
                                src="https://picsalna.com/600/400"
                                alt={pkg.name}
                                className="rounded-xl h-48 w-full object-cover"
                            />
                        </figure>
                        <div className="card-body">
                            <h3 className="card-title text-center">{pkg.name}</h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Lecturers: {pkg.points.map(point => point.lecturer.name).join(', ')}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Subjects: {pkg.points.length}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Duration: {pkg.type === 'month' ? '1 month' : pkg.type}
                                </p>
                            </div>
                            <div className="card-actions justify-between items-center mt-4">
                                <span className="text-xl font-bold">${pkg.price.toFixed(2)}</span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/package-details/${pkg._id}`, { state: { package: pkg } })}
                                >
                                    More Details
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
                    onClick={() => setCurrentPage(p => (p >= Math.ceil(filteredPackages.length / itemsPerPage) ? p : p + 1))}
                    disabled={currentPage >= Math.ceil(filteredPackages.length / itemsPerPage)}
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
                        <h2 className="text-2xl font-bold">Want to learn a new skill now?</h2>
                        <p className="text-sm text-gray-500">Contact us for more information</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-primary">Watch Video</button>
                    <button className="btn btn-secondary">Contact Us</button>
                </div>
            </div>
        </div>
    );
};

export default PackagesPage;