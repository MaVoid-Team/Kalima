import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Step1 from './step1';
import Step2 from './Step2';
import Step3 from './Step3';
import StepParent from './StepParent';
import StepLecturer from './StepLecturer';
import Step4 from './Step4';
import StepsIndicator from './StepsIndicator';
import NavigationButtons from './NavigationButtons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleSelectionModal from './RoleSelctionModal';

const apiUrl = import.meta.env.VITE_API_URL;
const hobbiesList = [
  { id: 1, name: 'reading', img: '/hobbies/reading.jpg' },
  { id: 2, name: 'sports', img: '/hobbies/sports.jpg' },
  { id: 3, name: 'music', img: '/hobbies/music.jpg' },
  { id: 4, name: 'art', img: '/hobbies/art.jpg' },
  { id: 5, name: 'gaming', img: '/hobbies/gaming.jpg' },
  { id: 6, name: 'cooking', img: '/hobbies/cooking.jpg' },
  { id: 7, name: 'photography', img: '/hobbies/photography.jpg' },
  { id: 8, name: 'dancing', img: '/hobbies/dancing.jpg' },
  { id: 9, name: 'technology', img: '/hobbies propagetechnology.jpg' },
];

const totalSteps = {
  student: 4,
  parent: 3,
  lecturer: 3
};

export default function StudentRegistration() {
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [roleLocked, setRoleLocked] = useState(false);
  const { t, i18n } = useTranslation('register');
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    role: 'student',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gender: '',
    faction: 'Alpha',
    grade: '',
    level: '',
    hobbies: [],
    parentPhoneNumber: '',
    children: [''],
    bio: '',
    expertise: '',
    subject: [],
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    setErrors({});
    setApiError(null);
  }, [currentStep]);

  const getStepErrors = (step) => {
    const errors = {};
    const { role } = formData;
    const phoneRegex = /^\+?[0-9]\d{7,14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (step === 1) {
      if (!formData.fullName?.trim()) errors.fullName = 'Full name is required';
      if (!formData.gender) errors.gender = 'Gender is required';
      if (!formData.phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number format';
      }
      if (role === 'student' && !formData.grade) {
        errors.grade = 'Grade is required';
      }
    }

    if (step === 2) {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!passwordRegex.test(formData.password)) {
        errors.password = 'Password must be at least 6 characters, include one uppercase and one lowercase letter';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirm password is required';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (role === 'student') {
        if (!formData.parentPhoneNumber) {
          errors.parentPhoneNumber = 'Parent phone number is required';
        } else if (!phoneRegex.test(formData.parentPhoneNumber)) {
          errors.parentPhoneNumber = 'Invalid parent phone number format';
        }
      }

      if (role === 'parent') {
        if (!formData.children[0]?.trim()) {
          errors.children = { 0: 'At least one child sequence ID is required' };
        } else {
          formData.children.forEach((child, index) => {
            if (child && !/^\d+$/.test(child.trim())) {
              errors.children = errors.children || {};
              errors.children[index] = 'Child sequence ID must be numeric';
            }
          });
        }
      }

      if (role === 'lecturer') {
        if (!formData.bio?.trim()) errors.bio = 'Bio is required';
        if (!formData.expertise?.trim()) errors.expertise = 'Expertise is required';
        if (!formData.subject?.length) errors.subject = 'At least one subject is required';
      }
    }

    return errors;
  };

  const toggleHobby = (hobbyId) => {
    try {
      setFormData(prev => ({
        ...prev,
        hobbies: prev.hobbies.includes(hobbyId)
          ? prev.hobbies.filter(id => id !== hobbyId)
          : [...prev.hobbies, hobbyId]
      }));
      setErrors(prev => ({ ...prev, hobbies: undefined }));
    } catch (error) {
      console.error('Error toggling hobby:', error);
      setApiError('Failed to update hobby selection');
    }
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setApiError('Please correct the errors in the form before proceeding');
      return;
    }

    if (currentStep < totalSteps[formData.role]) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    try {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? e.target.checked : value
      }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error) {
      console.error('Error handling input change:', error);
      setApiError('Failed to process input');
    }
  };

  const handleChildrenChange = (index, value) => {
    try {
      const newChildren = [...formData.children];
      newChildren[index] = value;
      setFormData(prev => ({ ...prev, children: newChildren }));
      setErrors(prev => ({
        ...prev,
        children: { ...prev.children, [index]: undefined }
      }));
    } catch (error) {
      console.error('Error handling children change:', error);
      setApiError('Failed to update child sequence ID');
    }
  };

  const handleSubmit = async () => {
    try {
      setApiError(null);
      setErrors({});
      let payload;

      switch (formData.role) {
        case 'student':
          payload = {
            role: 'student',
            name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            level: formData.grade,
            hobbies: formData.hobbies.map(id => 
              hobbiesList.find(hobby => hobby.id === id)?.name || ''
            ).filter(name => name !== ''),
            parentPhoneNumber: formData.parentPhoneNumber,
            phoneNumber: formData.phoneNumber,
            faction: formData.faction || "Alpha",
            gender: formData.gender
          };
          break;

        case 'parent':
          payload = {
            role: 'parent',
            children: formData.children.filter(c => c.trim() !== ''),
            name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phoneNumber: formData.phoneNumber,
            gender: formData.gender
          };
          break;

        case 'lecturer':
          payload = {
            role: 'lecturer',
            name: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            bio: formData.bio.trim(),
            expertise: formData.expertise.trim(),
            gender: formData.gender,
            subject: formData.subject,
          };
          break;

        default:
          throw new Error('Invalid role selected');
      }

      const url = `${apiUrl}/register`;
      const response = await axios.post(url, payload);
      navigate('/login', { 
        state: { message: 'Registration successful' } 
      });
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed';
      let fieldErrors = {};

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = 'Invalid data provided';
            if (data.errors) {
              // Assuming server returns errors in format: { field: message }
              fieldErrors = Object.keys(data.errors).reduce((acc, key) => {
                acc[key] = data.errors[key];
                return acc;
              }, {});
            }
            break;
          case 409:
            errorMessage = 'Email already exists';
            fieldErrors.email = 'This email is already registered';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            break;
          default:
            errorMessage = 'Unexpected error occurred';
        }
      } else if (error.request) {
        errorMessage = 'Network error: Unable to reach the server';
      } else {
        errorMessage = 'Error: ' + error.message;
      }

      setApiError(errorMessage);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
    }
  };

  const renderStepContent = () => {
    try {
      const { role } = formData;
      
      switch (role) {
        case 'student':
          switch (currentStep) {
            case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
            case 2: return <Step2 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} />;
            case 3: return <Step3 formData={formData} toggleHobby={toggleHobby} t={t} hobbiesList={hobbiesList} errors={errors} />;
            case 4: return <Step4 formData={formData} t={t} hobbiesList={hobbiesList} />;
            default: return null;
          }
        case 'parent':
          switch (currentStep) {
            case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
            case 2: return <StepParent formData={formData} handleChildrenChange={handleChildrenChange} handleInputChange={handleInputChange} t={t} errors={errors} />;
            case 3: return <Step4 formData={formData} t={t} />;
            default: return null;
          }
        case 'lecturer':
          switch (currentStep) {
            case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
            case 2: return <StepLecturer formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} />;
            case 3: return <Step4 formData={formData} t={t} />;
            default: return null;
          }
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering step content:', error);
      setApiError('Failed to render form content');
      return null;
    }
  };

  return (
    <div className="flex bg-primary" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="sm:hidden absolute inset-0 overflow-hidden z-0">
        <img 
          src="/registration-image.png" 
          alt="Background" 
          className="absolute bottom-0 right-0 object-bottom opacity-50"
        />
      </div>

      <div className="w-1/3 relative sm:block hidden">
        <img 
          src="/registration-image.png" 
          alt="Background" 
          className="absolute bottom-20 object-cover object-bottom"
        />
      </div>
      
      <div className="sm:w-2/3 py-2 pr-12 w-full h-full">
        <div className="mx-auto bg-base-100 rounded-tr-[50px] rounded-br-[50px] w-full p-10 relative shadow-xl">
          <h1 className="text-4xl lg:text-6xl font-bold mb-8 relative">
            {t(`${role}Register`)}
            <div 
              className="top-full right-0 w-64 lg:w-[400px] h-4 mt-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='20' viewBox='0 0 600 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M596 12.5C577.5 3.5 453 -4 354 9.5C255 23 70 16.5 4 11.5' stroke='%23F7DC6F' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'right'
              }}
            />
          </h1>

          {showRoleModal && (
            <RoleSelectionModal 
              onSelectRole={(selectedRole) => {
                try {
                  setRole(selectedRole);
                  setFormData(prev => ({ ...prev, role: selectedRole }));
                  setShowRoleModal(false);
                  setRoleLocked(true);
                } catch (error) {
                  console.error('Error selecting role:', error);
                  setApiError('Failed to select role');
                }
              }}
              t={t}
            />
          )}
          
          {apiError && (
            <div className="alert alert-error mb-4 animate-fade-in">
              <div className="flex flex-col">
                <span>{apiError}</span>
                {Object.keys(errors).length > 0 && (
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(errors).map(([field, message]) => (
                      typeof message === 'string' && (
                        <li key={field}>{field}: {message}</li>
                      )
                    ))}
                  </ul>
                )}
              </div>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setApiError(null);
                  setErrors({});
                }}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {renderStepContent()}

          <NavigationButtons 
            currentStep={currentStep}
            handlePrev={() => setCurrentStep(prev => prev - 1)}
            handleNext={handleNext}
            t={t}
            totalSteps={totalSteps}
            role={formData.role}
          />
          
          <StepsIndicator currentStep={currentStep} t={t} role={formData.role} />
        </div>
      </div>
    </div>
  );
}