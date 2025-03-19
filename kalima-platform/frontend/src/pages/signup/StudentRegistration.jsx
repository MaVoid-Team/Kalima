import { useState , useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Step1 from './step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import StepsIndicator from './StepsIndicator';
import NavigationButtons from './NavigationButtons';
import { useNavigate } from 'react-router-dom';


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

export default function StudentRegistration() {
  const { t, i18n } = useTranslation('register');
  const [currentStep, setCurrentStep] = useState(1);
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Step 1
    studentId: '',
    fullName: '',
    studentGender: '',
    parentGender: '',
    isParent: false,
    studentPhone: '',
    
    // Step 2
    parentPhone: '',
    email: '',
    address: '',
    
    // Step 3
    schoolName: '',
    schoolType: '',
    grade: '',
    variant: '',
    
    // Step 4
    selectedHobbies: [],
    
    // Step 5
    avatar: null
  });
  const [errors, setErrors] = useState({});

  // Add this effect to clear errors when step changes
  useEffect(() => setErrors({}), [currentStep]);

  const getStepErrors = (step) => {
    const errors = {};
    switch(step) {
      case 1:
        if (!formData.studentId?.trim()) errors.studentId = true;
        if (!formData.fullName?.trim()) errors.fullName = true;
        if (!formData.studentGender) errors.studentGender = true;
        if (!formData.parentGender) errors.parentGender = true;
        if (!formData.studentPhone?.trim()) errors.studentPhone = true;
        break;
      case 2:
        if (!formData.email?.trim()) errors.email = true;
        if (!formData.address?.trim()) errors.address = true;
        if (!formData.studentPhone?.trim()) errors.studentPhone = true;
        if (!formData.parentPhone?.trim()) errors.parentPhone = true;
        break;
      case 3:
        if (!formData.schoolName?.trim()) errors.schoolName = true;
        if (!formData.schoolType) errors.schoolType = true;
        if (!formData.grade) errors.grade = true;
        if (formData.grade >= 9 && !formData.variant) errors.variant = true;
        break;
      case 4:
        if (formData.selectedHobbies.length === 0) errors.selectedHobbies = true;
        break;
      case 5:
        if (!formData.avatar) errors.avatar = true;
        break;
      default:
        break;
    }
    return errors;
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
      
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const toggleHobby = (hobbyId) => {
    setFormData(prev => ({
      ...prev,
      selectedHobbies: prev.selectedHobbies.includes(hobbyId)
        ? prev.selectedHobbies.filter(id => id !== hobbyId)
        : [...prev.selectedHobbies, hobbyId]
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
// Add this effect to clear errors when step changes
  useEffect(() => setErrors({}), [currentStep]);

 
  const handleSubmit = () => {
    // Add your submission logic here
    console.log('Form submitted:', formData);
    Navigate('/');
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="flex min-h-screen bg-teal-700" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-1/3 relative sm:block hidden" >
      <img 
        src="/registration-image.png" 
        alt="Background" 
        className="absolute bottom-20 object-cover object-bottom"
       /></div>
      <div className="sm:w-2/3 p-8 w-full h-full">
        <div className="mx-auto bg-base-100 rounded-tr-[50px] rounded-br-[50px] w-full max-w-6xl p-10 shadow-xl relative"
           >
          <h1 className="text-3xl font-bold mb-8">{t('studentRegister')}</h1>
          
          

          {currentStep === 1 && (
            <Step1 formData={formData} handleInputChange={handleInputChange} t={t}  errors={errors}/>
          )}

          {currentStep === 2 && (
            <Step2 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors}/>
          )}

          {currentStep === 3 && (
            <Step3 formData={formData} handleInputChange={handleInputChange} t={t} errors={errors}/>
          )}

          {currentStep === 4 && (
            <Step4 
              formData={formData} 
              toggleHobby={toggleHobby} 
              t={t} 
              hobbiesList={hobbiesList} 
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <Step5 
              formData={formData} 
              handleAvatarUpload={handleAvatarUpload} 
              t={t} 
              hobbiesList={hobbiesList} 
              errors={errors}
            />
          )}

          <NavigationButtons 
            currentStep={currentStep}
            handlePrev={handlePrev}
            handleNext={handleNext}
            t={t}
          /> 
          <StepsIndicator currentStep={currentStep} t={t} i18n={i18n} />
        </div>
       
      </div>

    </div>
  );
}