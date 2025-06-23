import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import useAuth from '../hooks/useAuth';

const RegisterForm = observer(() => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userFirstname, setUserFirstname] = useState('');
  const [telNumber, setTelNumber] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await auth.register({
      email,
      password,
      userName,
      userFirstname,
      telNumber: telNumber ? parseInt(telNumber, 10) : undefined,
    });
  };

  return (
    <div className="auth-card transform transition-all duration-300 hover:shadow-2xl">
      {auth.error && (
        <div className="error-message">
          {auth.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="input-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            placeholder="your-email@example.com"
          />
        </div>
        
        <div className="form-group">
          <label className="input-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            minLength={8}
            placeholder="Min. 8 characters"
          />
        </div>
        
        <div className="form-group">
          <label className="input-label" htmlFor="userName">
            Last Name
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="input-field"
            required
            placeholder="Doe"
          />
        </div>
        
        <div className="form-group">
          <label className="input-label" htmlFor="userFirstname">
            First Name
          </label>
          <input
            id="userFirstname"
            type="text"
            value={userFirstname}
            onChange={(e) => setUserFirstname(e.target.value)}
            className="input-field"
            required
            placeholder="John"
          />
        </div>
        
        <div className="form-group">
          <label className="input-label" htmlFor="telNumber">
            Phone Number (optional)
          </label>
          <input
            id="telNumber"
            type="tel"
            value={telNumber}
            onChange={(e) => setTelNumber(e.target.value)}
            className="input-field"
            placeholder="Your phone number"
          />
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={auth.isLoading}
            className="btn-primary"
          >
            {auth.isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

export default RegisterForm;