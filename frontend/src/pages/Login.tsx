import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('agent.vikram@fiu.gov.in');
  const [password, setPassword] = useState('phantom-secure-2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B132B] text-gray-900 dark:text-gray-100 flex items-center justify-center p-6 font-sans transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-none">
        {/* Brand Area */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5750F1] to-[#8E82F6] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Phantom
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            FIU Taskforce & Compliance Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Official Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#F4F7FB] dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#5750F1] focus:ring-1 focus:ring-[#5750F1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Security Token / Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#F4F7FB] dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#5750F1] focus:ring-1 focus:ring-[#5750F1]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5750F1] hover:bg-[#463fc5] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            Authenticate Session <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Need an investigator account?{' '}
          <Link to="/signup" className="text-[#5750F1] dark:text-indigo-400 font-semibold hover:underline">
            Register Officer ID
          </Link>
        </div>
      </div>
    </div>
  );
};
