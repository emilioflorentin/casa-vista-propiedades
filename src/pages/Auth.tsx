import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('particular');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Por favor, completa todos los campos requeridos.');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    // Validación de contraseña segura solo para registro
    if (!isLogin) {
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return false;
      }

      if (!/[A-Z]/.test(password)) {
        setError('La contraseña debe contener al menos una letra mayúscula.');
        return false;
      }

      if (!/[a-z]/.test(password)) {
        setError('La contraseña debe contener al menos una letra minúscula.');
        return false;
      }

      if (!/[0-9]/.test(password)) {
        setError('La contraseña debe contener al menos un número.');
        return false;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        setError('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?}');
        return false;
      }
    } else {
      // Para login, solo verificar longitud mínima
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          navigate('/account');
        }
      } else {
        const { error } = await signUp(email, password, fullName, userType, companyName);
        
        if (error) {
          setError(error);
        } else {
          setError('');
          alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setUserType('particular');
    setCompanyName('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-stone-600 hover:text-stone-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-stone-800">
                {isLogin ? t('account.login') : t('account.register')}
              </CardTitle>
              <p className="text-stone-600 mt-2">
                {isLogin ? t('account.loginDescription') : t('account.registerDescription')}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-stone-700">
                        {t('account.fullName')}
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('account.enterName')}
                        required={!isLogin}
                        className="h-12 border-stone-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">
                        Tipo de usuario
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            userType === 'particular'
                              ? 'border-stone-700 bg-stone-50 text-stone-800'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                          onClick={() => setUserType('particular')}
                        >
                          <div className="text-sm font-medium">Particular</div>
                          <div className="text-xs text-stone-500 mt-1">Uso personal</div>
                        </button>
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            userType === 'profesional'
                              ? 'border-stone-700 bg-stone-50 text-stone-800'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                          onClick={() => setUserType('profesional')}
                        >
                          <div className="text-sm font-medium">Profesional</div>
                          <div className="text-xs text-stone-500 mt-1">Inmobiliaria</div>
                        </button>
                      </div>
                    </div>

                    {userType === 'profesional' && (
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-stone-700">
                          Nombre de la empresa
                        </label>
                        <Input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ej. Inmobiliaria López S.L."
                          required={userType === 'profesional'}
                          className="h-12 border-stone-300"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-700">
                    {t('account.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('account.enterEmail')}
                    required
                    className="h-12 border-stone-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-stone-700">
                    {t('account.password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('account.enterPassword')}
                      required
                      className="h-12 border-stone-300 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-stone-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                      {t('account.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('account.confirmPasswordPlaceholder')}
                        required={!isLogin}
                        className="h-12 border-stone-300 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-stone-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-stone-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-stone-600 hover:text-stone-800 hover:underline"
                    >
                      {t('account.forgotPassword')}
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-stone-700 hover:bg-stone-600 text-white font-medium"
                  disabled={loading}
                >
                  {loading 
                    ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
                    : (isLogin ? t('account.loginButton') : t('account.registerButton'))
                  }
                </Button>
              </form>

              {/* Switch Mode */}
              <div className="text-center text-sm text-stone-600">
                {isLogin ? t('account.noAccount') : t('account.hasAccount')}
                {' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-stone-700 hover:text-stone-900 font-medium hover:underline"
                >
                  {isLogin ? t('account.createAccount') : t('account.loginHere')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;