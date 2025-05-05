import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { fetchPackageById } from '../../routes/packages';

const PackageDetails = () => {
    const navigate = useNavigate();
    const { packageId } = useParams();
    const { state } = useLocation();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch package details if not in state
    useEffect(() => {
        const loadPackage = async () => {
            try {
                if (state?.package) {
                    setPkg(state.package);
                    setLoading(false);
                } else {
                    const apiPackage = await fetchPackageById(packageId);
                    setPkg(apiPackage);
                    setLoading(false);
                }
            } catch (error) {
                setError('Failed to load package details. Please try again later.');
                setLoading(false);
            }
        };
        loadPackage();
    }, [packageId, state]);

    // Placeholder gallery images
    const galleryImages = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        url: `https://picsum.photos/200/200?random=${i + 1}`,
    }));

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-error">{error}</div>;
    if (!pkg) return <div className="text-center p-8">Package not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                className="btn btn-ghost mb-8"
                onClick={() => navigate(-1)}
            >
                ← Back to Packages
            </button>

            <div className="flex flex-col lg:flex-row gap-8 mb-12">
                {/* Text Card with Integrated Image */}
                <div className="card bg-base-100 shadow-xl lg:w-2/4">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Side - Main Image */}
                        <div className="lg:w-1/3">
                            <img
                                src="https://picsum.photos/600/400"
                                alt={pkg.name}
                                className="rounded-3xl w-full h-full p-6 object-cover"
                            />
                        </div>

                        {/* Right Side - Text Content */}
                        <div className="lg:w-2/3 p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-4xl font-bold mb-4">{pkg.name}</h2>
                                <p className="text-lg mb-6">
                                    A comprehensive {pkg.type}ly package featuring instruction from{' '}
                                    {pkg.points.map(point => point.lecturer.name).join(', ')}.
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-3xl font-bold">${pkg.price.toFixed(2)}</span>
                                <button className="btn btn-primary px-8">Subscribe Now</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Images - Vertical Right Side */}
                <div className="lg:w-3/4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {galleryImages.map(img => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt="Preview"
                            className="rounded-lg h-32 w-full object-cover"
                        />
                    ))}
                </div>
            </div>

            {/* Package Details */}
            <div className="space-y-6">
                <div className="bg-base-200 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4">Package Details</h3>
                    <div className="space-y-2">
                        <p><strong>Package Name:</strong> {pkg.name}</p>
                        <p><strong>Duration:</strong> {pkg.type === 'month' ? '1 month' : pkg.type}</p>
                        <p><strong>Price:</strong> ${pkg.price.toFixed(2)}</p>
                        <p><strong>Lecturers:</strong> {pkg.points.map(point => point.lecturer.name).join(', ')}</p>
                        <p><strong>Subjects:</strong> {pkg.points.length}</p>
                    </div>
                </div>

                <div className="bg-base-200 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4">Package Content</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        {pkg.points.map((point, index) => (
                            <li key={index}>
                                {point.lecturer.name} - {point.points} points
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-base-200 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold mb-4">Features</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Expert-led instruction by {pkg.points.map(point => point.lecturer.name).join(', ')}</li>
                        <li>Structured curriculum covering {pkg.points.length} subject(s)</li>
                        <li>Flexible learning pace</li>
                        <li>{pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}ly access</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;