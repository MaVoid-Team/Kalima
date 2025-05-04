import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserDashboard } from '../../../routes/auth-services';
import { createSubject } from '../../../routes/courses';
import { createPackage } from '../../../routes/packages';
import { getAllLecturers } from '../../../routes/fetch-users';

export default function AdminCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [activeForm, setActiveForm] = useState('subject'); // 'subject' or 'package'

  // Subject form state
  const [subjectData, setSubjectData] = useState({ name: '' });

  // Package form state
  const [packageData, setPackageData] = useState({
    name: '',
    price: '',
    type: 'month',
    points: [{ lecturer: '', points: '' }],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getUserDashboard();
        if (result.success) {
          setUserRole(result.data.data.userInfo.role);
        } else {
          navigate('/');
        }
      } catch (err) {
        setError('Failed to verify user permissions');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchLecturers = async () => {
      try {
        const response = await getAllLecturers();
        if (response.success) {
          setLecturers(response.data);
        } else {
          setError(response.error || 'Failed to fetch lecturers');
        }
      } catch (err) {
        setError('Failed to fetch lecturers');
      }
    };

    fetchUserData();
    fetchLecturers();
  }, [navigate]);

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await createSubject(subjectData);
      if (response.success) {
        setSuccess('Subject created successfully');
        setSubjectData({ name: '' });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create subject');
    }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formattedPoints = packageData.points.filter(point => point.lecturer && point.points);
      const response = await createPackage({
        ...packageData,
        price: parseFloat(packageData.price),
        points: formattedPoints,
      });
      if (response.success) {
        setSuccess('Package created successfully');
        setPackageData({
          name: '',
          price: '',
          type: 'month',
          points: [{ lecturer: '', points: '' }],
        });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create package');
    }
  };

  const addPoint = () => {
    setPackageData(prev => ({
      ...prev,
      points: [...prev.points, { lecturer: '', points: '' }],
    }));
  };

  const updatePoint = (index, field, value) => {
    setPackageData(prev => {
      const newPoints = [...prev.points];
      newPoints[index] = { ...newPoints[index], [field]: value };
      return { ...prev, points: newPoints };
    });
  };

  const removePoint = (index) => {
    setPackageData(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Create New {activeForm}</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setSuccess(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Form Selector */}
      <div className="tabs tabs-border mb-6">
        <button
          className={`tab ${activeForm === 'subject' ? 'tab-active' : ''}`}
          onClick={() => setActiveForm('subject')}
        >
            Create New Subject
        </button>
        <button
          className={`tab tab-lifted ${activeForm === 'package' ? 'tab-active' : ''}`}
          onClick={() => setActiveForm('package')}
        >
            Create New Package
        </button>
      </div>

      {/* Subject Creation Form */}
      {activeForm === 'subject' && (
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject Name</span>
            </label>
            <input
              type="text"
              value={subjectData.name}
              onChange={(e) => setSubjectData({ name: e.target.value })}
              placeholder="e.g., Geography"
              className="input input-bordered w-full"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Subject
          </button>
        </form>
      )}

      {/* Package Creation Form */}
      {activeForm === 'package' && (
        <form onSubmit={handlePackageSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Create New Package</span>
            </label>
            <input
              type="text"
              value={packageData.name}
              onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
              placeholder="e.g., Premium Monthly"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Package Price</span>
            </label>
            <input
              type="number"
              value={packageData.price}
              onChange={(e) => setPackageData({ ...packageData, price: e.target.value })}
              placeholder="e.g., 300"
              className="input input-bordered w-full"
              min={0}
              step="0.01"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Package Type</span>
            </label>
            <select
              value={packageData.type}
              onChange={(e) => setPackageData({ ...packageData, type: e.target.value })}
              className="select select-bordered w-full"
              disabled
            >
              <option value="month">Monthly</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Points</span>
            </label>
            {packageData.points.map((point, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                <select
                  value={point.lecturer}
                  onChange={(e) => updatePoint(index, 'lecturer', e.target.value)}
                  className="select select-bordered w-full sm:w-1/2"
                  required
                >
                  <option value="">Select Lecturers</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name} ({lecturer.expertise})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={point.points}
                  onChange={(e) => updatePoint(index, 'points', e.target.value)}
                  placeholder="e.g., 200"
                  className="input input-bordered w-full sm:w-1/3"
                  min="0"
                  required
                />
                {packageData.points.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-error btn-sm"
                    onClick={() => removePoint(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={addPoint}
            >
              Add Points
            </button>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Package
          </button>
        </form>
      )}
    </div>
  );
}