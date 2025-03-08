import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WaveBackground from './WaveBackground';
import StudentReviews from './StudentReviews';

function Login() {
  const { t, i18n } = useTranslation('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isAr = i18n.language === 'ar';

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      alert('You are offline. Please connect to the internet and try again.');
      return;
    }
    // Here you would typically handle the login logic
    console.log('Login attempt with:', { email, password });
    // Simulating an API call
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        // Handle successful login
        console.log('Login successful');
      } else {
        // Handle login error
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className=" pt-[30%] md:pt-[10%]  lg:pt-[0] min-h-screen bg-base-300 flex flex-col items-center justify-center p-4 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <WaveBackground />
      
      <div className="flex flex-col lg:flex-row w-full gap-4 md:gap-8 z-10 justify-center items-center">
        {/* Login Form Section */}
        <div className="mt-[8%]    mx-2 md:mx-[10%] flex flex-col items-center justify-center">
          <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100 mx-4">
            <div className="card-body px-4 md:px-6 py-6">
              <div className="text-center mb-0 md:mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
                <p className="text-sm md:text-base text-base-600 dark:text-gray-300">{t('welcome')}</p>
              </div>
              {!isOnline && (
                <div className="alert alert-warning mb-4">
                  {t('offline_warning')}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('email_label')}:</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder={t('email_label')}
                    className="input input-bordered" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-control mt-1 md:mt-4">
                  <label className="label">
                    <span className="label-text">{t('password_label')}:</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder={t("password_label")} 
                    className="input input-bordered" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <label className="label">
                    <Link to="#" className="label-text-alt link link-hover">
                      {t('forgot_password')}
                    </Link>
                  </label>
                </div>
                <div className="form-control mt-2 md:mt-8">
                <button className="btn btn-primary btn-md md:btn-lg" disabled={!isOnline}>
                  {t('login_button')}
                </button>
              </div>
              <div className="text-center mt-1 sm:mt-3">
                <Link to="/register" className="link link-hover text-xs md:text-sm">
                  {t('register_prompt')}
                </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Student Reviews Section */}  
        <div className='my-10'>
          <StudentReviews />
          </div> 
      </div>
    </div>
  );
}

export default Login;