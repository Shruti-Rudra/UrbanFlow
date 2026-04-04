import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const color = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];
  const text = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-500">
        <span>Password strength:</span>
        <span className={strength > 2 ? 'text-green-600' : 'text-orange-600'}>{text[strength]}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full flex gap-1 overflow-hidden">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-full transition-all duration-300 w-1/4 ${
              index < strength ? color[strength] : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <ul className="text-[10px] text-slate-500 grid grid-cols-2 gap-x-2 mt-1">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>• 8+ characters</li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• 1 uppercase</li>
        <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• 1 number</li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>• 1 special char</li>
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
