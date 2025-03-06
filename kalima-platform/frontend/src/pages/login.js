import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary">Login now!</h1>
        <p className="py-6 text-foreground">Welcome back! Log in to access your account and enjoy our services.</p>
        {!isOnline && (
          <div className="alert bg-accent text-foreground border-none mt-4">
            You are currently offline. Some features may be limited.
          </div>
        )}
      </div>
      <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-card-background">
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-card-foreground">Email</span>
            </label>
            <input 
              type="email" 
              placeholder="email" 
              className="input input-bordered bg-secondary text-foreground" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-card-foreground">Password</span>
            </label>
            <input 
              type="password" 
              placeholder="password" 
              className="input input-bordered bg-secondary text-foreground" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <label className="label">
              <Link to="/forgot-password" className="label-text-alt link link-hover text-accent">Forgot password?</Link>
            </label>
          </div>
          <div className="form-control mt-6">
            <button className="btn bg-button-background text-button-foreground border-none hover:bg-accent hover:text-foreground" disabled={!isOnline}>Login</button>
          </div>
          <div className="text-center mt-4">
            <Link to="/register" className="link link-hover text-accent">Need an account? Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;