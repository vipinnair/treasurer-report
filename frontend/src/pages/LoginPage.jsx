import { GoogleLogin } from '@react-oauth/google';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen grid place-content-center">
      <div className="bg-white rounded shadow p-8 space-y-4">
        <h1 className="text-xl font-semibold">Sign in with Google</h1>
        <GoogleLogin
          onSuccess={async (cred) => {
            const res = await api.post('/auth/google', { idToken: cred.credential });
            login(res.data);
          }}
          onError={() => alert('Google Login failed')}
        />
      </div>
    </div>
  );
}
