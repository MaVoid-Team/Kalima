import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TeacherReviews from './TeacherReviews';
import WaveBackground from './WaveBackground';
import { loginUser, getUserDashboard } from '../../routes/auth-services';
import { Link, useNavigate } from 'react-router-dom';

const TeacherLogin = () => {
  const navigate = useNavigate();
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
      const credentials = {
        password: formData.password
      };
      
      if (activeTab === 'email_tab') {
        credentials.email = formData.email;
      } else {
        credentials.phoneNumber = formData.phoneNumber;
      }

      const loginResult = await loginUser(credentials);
      
      if (!loginResult.success) {
        setError(loginResult.error || 'Login failed.');
        return;
      }

      const dashboardResult = await getUserDashboard();
      
      if (!dashboardResult.success) {
        setError(dashboardResult.error || 'Failed to fetch user data.');
        return;
      }

      const userRole = dashboardResult.data.data.userInfo.role;
      if (userRole === 'Admin' || userRole === 'SubAdmin') {
        navigate('/dashboard/dashboards-for-admins');
      } else if (userRole === 'Lecturer') {
        navigate('/dashboard/lecturer-dashboard');
      } else if (userRole === 'Student') {
        navigate('/dashboard/student-dashboard/promo-codes');
      } else if (userRole === 'Assistant') {
        navigate('/dashboard/assistant-page');
      }

    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center relative overflow-hidden bg-base-100" dir={isRTL ? 'rtl' : 'ltr'}>
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
            {/* {t('loginWelcome', 'Welcome! Sign in to access your teacher dashboard and resources')} */}
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
                  required
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
                  required
                />
              </div>
            )}
            
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
                <Link to="/forgot-password" className="label-text-alt link link-hover text-primary">
                  {t('forgotPassword', 'Forgot password?')}
                </Link>
              </label>
            </div>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('loggingIn', 'Logging in...') : t('login', 'Login')}
            </button>
            
            <div className="text-center mt-4">
              <p>
                {t('needAccount', "Don't have an account?")}{' '}
                <Link to="/register" className="link link-primary">
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