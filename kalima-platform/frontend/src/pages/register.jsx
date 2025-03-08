import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [activeTab, setActiveTab] = useState('parent');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration attempt for:', activeTab, formData);
    // Here you would handle the registration logic
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-card-foreground">Name</span>
        </label>
        <input 
          type="text" 
          name="name"
          placeholder="Full Name" 
          className="input input-bordered bg-secondary text-foreground" 
          value={formData.name}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-card-foreground">Email</span>
        </label>
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          className="input input-bordered bg-secondary text-foreground" 
          value={formData.email}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-card-foreground">Password</span>
        </label>
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          className="input input-bordered bg-secondary text-foreground" 
          value={formData.password}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-card-foreground">Confirm Password</span>
        </label>
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="Confirm Password" 
          className="input input-bordered bg-secondary text-foreground" 
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required 
        />
      </div>
      <div className="form-control mt-6">
        <button className="btn bg-button-background text-button-foreground border-none hover:bg-accent hover:text-foreground">
          Register as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary">Register now!</h1>
        <p className="py-6 text-foreground">Join our community and start your journey with us.</p>
      </div>
      <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-card-background">
        <div className="card-body">
          <div className="tabs tabs-boxed bg-secondary mb-4">
            <Link
              className={`tab ${activeTab === 'parent' ? 'bg-primary text-secondary duration-500 transition-all' : 'text-foreground'}`}
              onClick={() => setActiveTab('parent')}
            >
              Parent
            </Link>
            <Link
              className={`tab ${activeTab === 'student' ? 'bg-primary text-secondary duration-500 transition-all' : 'text-foreground'}`}
              onClick={() => setActiveTab('student')}
            >
              Student
            </Link>
            <Link
              className={`tab ${activeTab === 'teacher' ? 'bg-primary text-secondary duration-500 transition-all' : 'text-foreground'}`}
              onClick={() => setActiveTab('teacher')}
            >
              Teacher
            </Link>
          </div>
          {renderForm()}
          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover text-accent">Already have an account? Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;