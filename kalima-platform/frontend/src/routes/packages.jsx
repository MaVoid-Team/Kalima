import axios from 'axios';
import { getToken } from "./auth-services";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPackages = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/v1/packages/`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        const data = response.data;
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
        return mappedPackages;
    } catch (error) {
        console.error('Error fetching packages:', error);
        throw error;
    }
};