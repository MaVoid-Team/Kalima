import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getToken } from "../../routes/auth-services";
const API_URL = process.env.REACT_APP_BASE_URL;


const PackageDetails = () => {
    const navigate = useNavigate();
    const { packageId } = useParams();
    const { state } = useLocation();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch package details if not in state
    useEffect(() => {
        if (state?.package) {
            setPkg(state.package);
            setLoading(false);
        } else {
            const fetchPackage = async () => {
                try {
                    const response = await fetch(`${API_URL}/packages/${packageId}`, {
                        headers: {
                            Authorization: `Bearer ${getToken()}`,
                        },
                    });
                    const data = await response.json();
                    const apiPackage = data.data.package;
                    const mappedPackage = {
                        id: apiPackage._id,
                        title: apiPackage.name,
                        image: 'https://picsum.photos/600/400',
                        subjects: apiPackage.points.length,
                        teachers: apiPackage.points.map(() => 'https://dummyimage.com/40x40/000/fff'),
                        duration: apiPackage.type === 'month' ? '1 month' : 'per lecture',
                        students: Math.floor(Math.random() * 500) + 100,
                        price: `$${apiPackage.price}`,
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
                    };
                    setPkg(mappedPackage);
                    setLoading(false);
                } catch (error) {
                    console.error('Error:', error);
                    setLoading(false);
                }
            };
            fetchPackage();
        }
    }, [packageId, state]);

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (!pkg) return <div className="text-center p-8">Package not found</div>;

        const galleryImages = Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          url: `https://dummyimage.com/200x200/000/fff?text=Preview+${i+1}`
        }));
      
        if (loading) return <div className="text-center p-8">Loading...</div>;
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
      <div className="lg:w-1/3 ">
        <img 
          src={pkg.image} 
          alt="Package" 
          className="rounded-3xl w-full h-full p-6  object-cover" 
        />
      </div>

      {/* Right Side - Text Content */}
      <div className="lg:w-2/3 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-4xl font-bold mb-4">{pkg.title}</h2>
          <p className="text-lg mb-6">{pkg.description}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold">{pkg.price}</span>
          <button className="btn btn-primary px-8">Subscribe Now</button>
        </div>
      </div>
    </div>
  </div>

  {/* Preview Images - Vertical Right Side */}
  <div className="lg:w-3/4 grid grid-cols-8 gap-4">
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
            <p><strong>Package Name:</strong> {pkg.title}</p>
            <p><strong>Package Goal:</strong> {pkg.goal}</p>
            <p><strong>Description:</strong> {pkg.description}</p>
          </div>
        </div>

        <div className="bg-base-200 p-6 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Package Content</h3>
          <ul className="list-disc pl-6 space-y-2">
            {pkg.content?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-base-200 p-6 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Features</h3>
          <ul className="list-disc pl-6 space-y-2">
            {pkg.features?.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;