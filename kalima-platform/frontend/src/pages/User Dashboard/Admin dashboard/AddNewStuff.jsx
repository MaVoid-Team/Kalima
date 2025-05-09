import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserDashboard } from '../../../routes/auth-services';
import { createSubject, getAllSubjects, deleteSubject } from '../../../routes/courses';
import { createPackage, fetchPackages, deletePackage } from '../../../routes/packages';
import { getAllLecturers } from '../../../routes/fetch-users';
import { getAllLevels, createLevel, deleteLevel } from '../../../routes/levels';

export default function AdminCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [packages, setPackages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [activeForm, setActiveForm] = useState('subject'); // 'subject', 'package', or 'level'

  // Subject form state
  const [subjectData, setSubjectData] = useState({ name: '' });

  // Package form state
  const [packageData, setPackageData] = useState({
    name: '',
    price: '',
    type: 'month',
    points: [{ lecturer: '', points: '' }],
  });

  // Level form state
  const [levelData, setLevelData] = useState({ name: '' });

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

    const fetchSubjects = async () => {
      try {
        const response = await getAllSubjects();
        if (response.success) {
          setSubjects(response.data);
        } else {
          setError(response.error || 'Failed to fetch subjects');
        }
      } catch (err) {
        setError('Failed to fetch subjects');
      }
    };

    const fetchAllPackages = async () => {
      try {
        const response = await fetchPackages();
        if (response.success) {
          setPackages(response.data);
        } else {
          setError(response.error || 'Failed to fetch packages');
        }
      } catch (err) {
        setError('Failed to fetch packages');
      }
    };

    const fetchAllLevels = async () => {
      try {
        const response = await getAllLevels();
        if (response.success) {
          setLevels(response.data);
        } else {
          setError(response.error || 'Failed to fetch levels');
        }
      } catch (err) {
        setError('Failed to fetch levels');
      }
    };

    fetchUserData();
    fetchLecturers();
    fetchSubjects();
    fetchAllPackages();
    fetchAllLevels();
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
        const updatedSubjects = await getAllSubjects();
        if (updatedSubjects.success) {
          setSubjects(updatedSubjects.data);
        }
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
        const updatedPackages = await fetchPackages();
        if (updatedPackages.success) {
          setPackages(updatedPackages.data);
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create package');
    }
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await createLevel(levelData);
      if (response.success) {
        setSuccess('Level created successfully');
        setLevelData({ name: '' });
        const updatedLevels = await getAllLevels();
        if (updatedLevels.success) {
          setLevels(updatedLevels.data);
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create level');
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

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await deleteSubject(subjectId);
        if (response.success) {
          setSuccess('Subject deleted successfully');
          const updatedSubjects = await getAllSubjects();
          if (updatedSubjects.success) {
            setSubjects(updatedSubjects.data);
          }
        } else {
          setError(response.error || 'Failed to delete subject');
        }
      } catch (err) {
        setError('Failed to delete subject');
      }
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const response = await deletePackage(packageId);
        if (response.success) {
          setSuccess('Package deleted successfully');
          const updatedPackages = await fetchPackages();
          if (updatedPackages.success) {
            setPackages(updatedPackages.data);
          }
        } else {
          setError(response.error || 'Failed to delete package');
        }
      } catch (err) {
        setError('Failed to delete package');
      }
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        const response = await deleteLevel(levelId);
        if (response.success) {
          setSuccess('Level deleted successfully');
          const updatedLevels = await getAllLevels();
          if (updatedLevels.success) {
            setLevels(updatedLevels.data);
          }
        } else {
          setError(response.error || 'Failed to delete level');
        }
      } catch (err) {
        setError('Failed to delete level');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
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
        <button
          className={`tab tab-lifted ${activeForm === 'level' ? 'tab-active' : ''}`}
          onClick={() => setActiveForm('level')}
        >
          Create New Level
        </button>
      </div>

      {/* Subject Creation Form */}
      {activeForm === 'subject' && (
        <>
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

          {/* Subject Table */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Existing Subjects</h2>
            {subjects.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="bg-base-100 shadow-md rounded-lg">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-base-200 rounded-t-lg font-semibold text-sm">
                    <div>Subject Name</div>
                    <div>Created On</div>
                    <div>Actions</div>
                  </div>
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="grid grid-cols-3 gap-4 p-4 border-b border-base-200 hover:bg-base-200/50 transition-colors"
                    >
                      <div className="text-sm font-medium">{subject.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(subject.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        {userRole === 'Admin' && (
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteSubject(subject._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-4">No subjects available.</p>
            )}
          </div>
        </>
      )}

      {/* Package Creation Form */}
      {activeForm === 'package' && (
        <>
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

          {/* Package List */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Existing Packages</h2>
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg._id} className="card bg-base-100 shadow-md p-4">
                    <div className="card-body">
                      <h3 className="card-title">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">
                        Price: ${pkg.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(pkg.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Points Distribution:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {pkg.points.map((point, index) => (
                            <li key={index}>
                              {point.lecturer.name}: {point.points} points
                            </li>
                          ))}
                        </ul>
                      </div>
                      {userRole === 'Admin' && (
                        <button
                          className="btn btn-error btn-sm mt-2"
                          onClick={() => handleDeletePackage(pkg._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No packages available.</p>
            )}
          </div>
        </>
      )}

      {/* Level Creation Form */}
      {activeForm === 'level' && (
        <>
          <form onSubmit={handleLevelSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Level Name</span>
              </label>
              <input
                type="text"
                value={levelData.name}
                onChange={(e) => setLevelData({ name: e.target.value })}
                placeholder="e.g., Higher Secondary"
                className="input input-bordered w-full"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Level
            </button>
          </form>

          {/* Level Table */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Existing Levels</h2>
            {levels.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="bg-base-100 shadow-md rounded-lg">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-base-200 rounded-t-lg font-semibold text-sm">
                    <div>Level Name</div>
                    <div>Created On</div>
                    <div>Actions</div>
                  </div>
                  {levels.map((level) => (
                    <div
                      key={level._id}
                      className="grid grid-cols-3 gap-4 p-4 border-b border-base-200 hover:bg-base-200/50 transition-colors"
                    >
                      <div className="text-sm font-medium">{level.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(level.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        {userRole === 'Admin' && (
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteLevel(level._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-4">No levels available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}