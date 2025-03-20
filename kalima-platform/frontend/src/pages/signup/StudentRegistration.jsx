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
const apiUrl = process.env.REACT_APP_BASE_URL;
const hobbiesList = [
  { id: 1, name: 'reading', img: '/hobbies/reading.jpg' },
  { id: 2, name: 'sports', img: '/hobbies/sports.jpg' },
  { id: 3, name: 'music', img: '/hobbies/music.jpg' },
  { id: 4, name: 'art', img: '/hobbies/art.jpg' },
  { id: 5, name: 'gaming', img: '/hobbies/gaming.jpg' },
  { id: 6, name: 'cooking', img: '/hobbies/cooking.jpg' },
  { id: 7, name: 'photography', img: '/hobbies/photography.jpg' },
  { id: 8, name: 'dancing', img: '/hobbies/dancing.jpg' },
  { id: 9, name: 'technology', img: '/hobbies/technology.jpg' },
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
    // Common fields
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: '',
    // Student-specific
    faction: '',
    grade: '',
    hobbies: [],
    parentPhoneNumber: '',
    // Parent-specific
    children: [''],
    // Lecturer-specific
    bio: '',
    expertise: ''
  });
  const [errors, setErrors] = useState({});

  
  useEffect(() => setErrors({}), [currentStep]);

  const getStepErrors = (step) => {
    const errors = {};
    const { role } = formData;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (step === 1) {
      if (!formData.fullName?.trim()) errors.fullName = 'validation.required';
      if (!formData.gender) errors.gender = 'validation.required';
      if (!formData.phoneNumber) {
        errors.phoneNumber = 'validation.required';
      } else if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = 'validation.phoneFormat';
      }
      if (role === 'student' && !formData.grade) errors.grade = 'validation.required';
    }
  
    if (step === 2) {
      if (role === 'student') {
        if (!formData.parentPhoneNumber) {
          errors.parentPhoneNumber = 'validation.required';
        } else if (!phoneRegex.test(formData.parentPhoneNumber)) {
          errors.parentPhoneNumber = 'validation.phoneFormat';
        }
        // Email validation
        if (!formData.email) {
          errors.email = 'validation.required';
        } else if (!emailRegex.test(formData.email)) {
          errors.email = 'validation.emailFormat';
        }
        // Password validation
        if (!formData.password) {
          errors.password = 'validation.required';
        } else if (!passwordRegex.test(formData.password)) {
          errors.password = 'validation.passwordRequirements';
        }
      }
      // Similar pattern for other roles...
    }
  
    return errors;
  };
  const toggleHobby = (hobbyId) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobbyId)
        ? prev.hobbies.filter(id => id !== hobbyId)
        : [...prev.hobbies, hobbyId]
    }));
  };
  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    if (currentStep < totalSteps[formData.role]) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleChildrenChange = (index, value) => {
    const newChildren = [...formData.children];
    newChildren[index] = value;
    setFormData(prev => ({ ...prev, children: newChildren }));
  };
  const url = `${apiUrl}/api/v1/register`;
  const handleSubmit = async () => {
    const payload = {
      role: formData.role,
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender
    };

    // Role-specific payload additions
    switch(formData.role) {
      case 'student':
        payload.level = formData.grade;
        payload.hobbies = formData.hobbies.map(id => 
          hobbiesList.find(hobby => hobby.id === id).name
        );
        payload.parentPhoneNumber = formData.parentPhoneNumber;
        break;
      case 'parent':
        payload.children = formData.children.filter(c => c.trim() !== '');
        break;
      case 'lecturer':
        payload.bio = formData.bio;
        payload.expertise = formData.expertise;
        break;
        default: break;
    }

    try {
      await axios.post(url, payload);
      navigate('/success');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const renderStepContent = () => {
    const { role } = formData;
    
    switch(role) {
      case 'student':
        switch(currentStep) {
          case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
          case 2: return <Step2 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} />;
          case 3: return <Step3 formData={formData} toggleHobby={toggleHobby} t={t} hobbiesList={hobbiesList} errors={errors} />;
          case 4: return <Step4 formData={formData} t={t} hobbiesList={hobbiesList} />;
          default: return null;
        }
      case 'parent':
        switch(currentStep) {
          case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
          case 2: return <StepParent formData={formData} handleChildrenChange={handleChildrenChange}  handleInputChange={handleInputChange} t={t} errors={errors} />;
          case 3: return <Step4 formData={formData} t={t} />;
          default: return null;
        }
      case 'lecturer':
        switch(currentStep) {
          case 1: return <Step1 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} role={role} />;
          case 2: return <StepLecturer formData={formData} handleInputChange={handleInputChange} t={t} errors={errors} />;
          case 3: return <Step4 formData={formData} t={t} />;
          default: return null;
        }
      default:
        return null;
    }}
  

  return (
    <div className="flex  bg-primary" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="sm:hidden absolute inset-0 overflow-hidden z-0">
    <img 
      src="/registration-image.png" 
      alt="Background" 
      className="absolute bottom-0 right-0   object-bottom opacity-50"
    />
  </div>

  {/* Desktop Image (original code remains unchanged) */}
  <div className="w-1/3 relative sm:block hidden">
    <img 
      src="/registration-image.png" 
      alt="Background" 
      className="absolute bottom-20 object-cover object-bottom"
    />
  </div>
      <div className="sm:w-2/3 py-2 pr-12 w-full h-full">
        <div className="mx-auto bg-base-100 rounded-tr-[50px] rounded-br-[50px] w-full  p-10  relative shadow-xl"
           >
         <h1 className="text-4xl lg:text-6xl font-bold mb-8 relative">
    {t(`${role}Register`)}
    <div 
  className=" top-full right-0 w-64 lg:w-[400px] h-4 mt-4" // Wider container
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
        setRole(selectedRole);
        setFormData(prev => ({ ...prev, role: selectedRole }));
        setShowRoleModal(false);
        setRoleLocked(true);
      }}
      t={t}
    />
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