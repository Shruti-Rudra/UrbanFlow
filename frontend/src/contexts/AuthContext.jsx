import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary state for OTP flow
  const [tempUser, setTempUser] = useState(null);
  const [generatedOTP, setGeneratedOTP] = useState(null);

  useEffect(() => {
    // Check localStorage for an active session
    const storedUser = localStorage.getItem('urbanflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check sessionStorage for ongoing OTP verifications (survives page refresh)
    const storedTempUser = sessionStorage.getItem('urbanflow_temp_user');
    const storedOTP = sessionStorage.getItem('urbanflow_temp_otp');
    if (storedTempUser && storedOTP) {
      setTempUser(JSON.parse(storedTempUser));
      setGeneratedOTP(storedOTP);
    }
    
    setLoading(false);
  }, []);

  // Helper to generate a 6-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SIMULATED SMS/EMAIL] Your UrbanFlow OTP is: ${otp}`);
    return otp;
  };

  const requestLogin = (identifier) => {
    const otp = generateOTP();
    const mockRole = identifier === 'admin@urbanflow.com' ? 'admin' : 'user';
    
    const newTempUser = { 
      id: Date.now(),
      identifier,
      name: identifier.includes('@') ? identifier.split('@')[0] : 'Commuter',
      role: mockRole
    };
    
    // Update local state
    setTempUser(newTempUser);
    setGeneratedOTP(otp);
    
    // Persist to sessionStorage so it survives page reloads during the verification step
    sessionStorage.setItem('urbanflow_temp_user', JSON.stringify(newTempUser));
    sessionStorage.setItem('urbanflow_temp_otp', otp);
    
    return new Promise(resolve => setTimeout(() => resolve(true), 600));
  };

  const requestRegister = (name, identifier) => {
    const otp = generateOTP();
    
    const newTempUser = { 
      id: Date.now(),
      name,
      identifier,
      role: 'user'
    };
    
    setTempUser(newTempUser);
    setGeneratedOTP(otp);
    
    sessionStorage.setItem('urbanflow_temp_user', JSON.stringify(newTempUser));
    sessionStorage.setItem('urbanflow_temp_otp', otp);
    
    return new Promise(resolve => setTimeout(() => resolve(true), 600));
  };

  const verifyOTP = (enteredOTP) => {
    return new Promise((resolve, reject) => {
      console.log(`Verifying: Entered [${enteredOTP}] vs Generated [${generatedOTP}]`);
      
      setTimeout(() => {
        if (enteredOTP === generatedOTP && tempUser) {
          // Commit to persistent state
          setUser(tempUser);
          localStorage.setItem('urbanflow_user', JSON.stringify(tempUser));
          
          // Clear temp state
          setTempUser(null);
          setGeneratedOTP(null);
          sessionStorage.removeItem('urbanflow_temp_user');
          sessionStorage.removeItem('urbanflow_temp_otp');
          
          resolve(true);
        } else {
          reject(new Error(`Invalid OTP. Please check the code and try again.`));
        }
      }, 800);
    });
  };

  const resendOTP = () => {
    if (!tempUser) return false;
    const otp = generateOTP();
    
    setGeneratedOTP(otp);
    sessionStorage.setItem('urbanflow_temp_otp', otp);
    
    return otp; // Return the new OTP so the UI can display it
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbanflow_user');
  };

  const value = {
    user,
    tempUser,
    generatedOTP, // Exposed for testing UI display
    loading,
    requestLogin,
    requestRegister,
    verifyOTP,
    resendOTP,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
