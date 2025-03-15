import React, { useState } from 'react';
import './SignupModal.css';

interface SignupModalProps {
  onComplete: (method: "email" | "guest") => void;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ onComplete, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // For hackathon: mock authentication
      // In real app: Replace with actual auth API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful signup
      onComplete("email");
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="signup-modal">
        <div className="modal-header">
          <h2>Save Your Progress</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <p>Create an account to track your learning progress and unlock personalized features!</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                disabled={isSubmitting}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="modal-actions">
              <button 
                type="submit" 
                className="signup-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <button 
                type="button" 
                className="guest-button"
                onClick={() => onComplete("guest")}
                disabled={isSubmitting}
              >
                Continue as Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;