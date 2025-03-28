import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TeacherReviews from './TeacherReviews';
import WaveBackground from './WaveBackground';
import { loginUser } from '../../routes/auth-services'; // Assuming this is the correct import path
import { Link } from 'react-router-dom';

const TeacherLogin = () => {
  const { t, i18n } = useTranslation("login");
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('email_tab');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare credentials based on active tab
      const credentials = {
        password: formData.password
      };
      
      if (activeTab === 'email_tab') {
        credentials.email = formData.email;
      } else {
        credentials.phoneNumber = formData.phoneNumber;
      }

      const result = await loginUser(credentials);
      
      if (!result.success) {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
      // Successful login is handled by the loginUser function (sets token in sessionStorage)
      
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center relative overflow-hidden">
      <WaveBackground />
      
      {/* Left side - Teacher Reviews */}
      <div className="w-full md:w-1/2 z-10">
        <TeacherReviews />
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center z-0">
        <div className="bg-base-100 shadow-xl rounded-lg p-6 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">
            {t('loginNow', 'Login Now!')}
          </h1>
          <p className="text-center text-base-600 mb-6">
            {t('loginWelcome', 'Welcome! Sign in to access your teacher dashboard and resources')}
          </p>
          
          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === 'phone_tab' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('phone_tab')}
            >
              {t('phoneTab', 'Phone')}
            </button>
            <button 
              className={`tab ${activeTab === 'email_tab' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('email_tab')}
            >
              {t('emailTab', 'Email')}
            </button>
          </div>
          
          <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Conditional Input Fields */}
            {activeTab === 'email_tab' ? (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('emailLabel', 'Email Address')}</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="teacher@example.com" 
                  className="input input-bordered w-full" 
                  required={activeTab === 'email_tab'}
                />
              </div>
            ) : (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">{t('phoneLabel', 'Phone Number')}</span>
                </label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="01234567890" 
                  className="input input-bordered w-full" 
                  required={activeTab === 'phone_tab'}
                />
              </div>
            )}
            
            {/* Password Field */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">{t('passwordLabel', 'Password')}</span>
              </label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••" 
                className="input input-bordered w-full" 
                required
              />
              <label className="label">
                <Link href="#" className="label-text-alt link link-hover text-primary">
                  {t('forgotPassword', 'Forgot password?')}
                </Link>
              </label>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('loggingIn', 'Logging in...') : t('login', 'Login')}
            </button>
            
            {/* Register Link */}
            <div className="text-center mt-4">
              <p>
                {t('needAccount', "Don't have an account?")} {' '}
                <Link href="#" className="link link-primary">
                  {t('register', 'Register here')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;