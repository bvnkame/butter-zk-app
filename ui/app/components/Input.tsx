
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
      {...props}
    />
  );
};

export default Input;
