import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const ResendVerification = ({ email, password, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resendVerificationEmail } = useAuth();

  const handleResend = async () => {
    try {
      setLoading(true);
      setError('');
      await resendVerificationEmail(email, password);
      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <p className="text-sm text-gray-300 mb-2">
        Haven&apos;t received the verification email?
      </p>
      <button
        onClick={handleResend}
        disabled={loading}
        className="text-emerald-500 hover:text-emerald-400 text-sm font-medium"
      >
        {loading ? 'Sending...' : 'Resend verification email'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default ResendVerification;