import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = observer(() => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login({ email, password });
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="backdrop-blur-sm bg-card/80 glow-border rounded-2xl shadow-lg">
        <div className="text-center space-y-4 p-4 pb-4">
          <img src="/src/assets/logo.png" alt="BloodSky Logo" className="mx-auto w-20 h-20 mb-1" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-400 bg-clip-text text-transparent font-['Iceland',cursive]">
            BloodSky
          </h1>
          <h2 className="text-lg text-muted-foreground font-['Share_Tech',monospace]">
            Connectez-vous à votre compte
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8">
          {auth.error && (
            <div className="mb-2 text-red-500 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm">
              {auth.error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre-email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-3 py-2 w-full rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground glow-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-3 py-2 w-full rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground glow-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <button
            type="submit"
            disabled={auth.isLoading}
            className="block w-full ml-0 mr-0 static appearance-none bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/25 disabled:bg-gray-400"
          >
            {auth.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>© 2024 BloodSky • Accès réservé</p>
        <p className="mt-1">Plateforme de gestion du sang</p>
      </div>
    </div>
  );
});

export default LoginForm;