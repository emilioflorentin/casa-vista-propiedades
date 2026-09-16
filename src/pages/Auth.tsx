import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RoomieHeader from '@/components/roomie/RoomieHeader';
import RoomieFooter from '@/components/roomie/RoomieFooter';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('particular');
  const [companyName, setCompanyName] = useState('');
  const [platform, setPlatform] = useState('nazari');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const roomieMode = pathname.startsWith('/roomie-finder');
  const PageHeader = roomieMode ? RoomieHeader : Header;
  const PageFooter = roomieMode ? RoomieFooter : Footer;

  useEffect(() => {
    if (roomieMode) setPlatform('roomie');
  }, [roomieMode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.email === 'multiservicios@nazarihomes.com') {
        navigate('/service-board');
      } else if (roomieMode) {
        navigate('/roomie-finder/matches');
      } else {
        navigate('/account');
      }
    }
  }, [user, navigate, roomieMode]);

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
          // Redirect multiservicios to service board
          if (email.toLowerCase() === 'multiservicios@nazarihomes.com') {
            navigate('/service-board');
          } else if (roomieMode) {
            navigate('/roomie-finder/matches');
          } else {
            navigate('/account');
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName, userType, companyName, platform);
        
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
    setPlatform(roomieMode ? 'roomie' : 'nazari');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-muted">
      <PageHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Link 
            to={roomieMode ? "/roomie-finder" : "/"} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">
                {isLogin ? t('account.login') : t('account.register')}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
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
                      <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                        {t('account.fullName')}
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('account.enterName')}
                        required={!isLogin}
                        className="h-12 border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Tipo de usuario
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            userType === 'particular'
                              ? 'border-primary bg-muted text-foreground'
                              : 'border-border hover:border-border'
                          }`}
                          onClick={() => setUserType('particular')}
                        >
                          <div className="text-sm font-medium">Particular</div>
                          <div className="text-xs text-muted-foreground mt-1">Uso personal</div>
                        </button>
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            userType === 'empresa'
                              ? 'border-primary bg-muted text-foreground'
                              : 'border-border hover:border-border'
                          }`}
                          onClick={() => setUserType('empresa')}
                        >
                          <div className="text-sm font-medium">Profesional</div>
                          <div className="text-xs text-muted-foreground mt-1">Inmobiliaria</div>
                        </button>
                      </div>
                    </div>

                    {userType === 'empresa' && (
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                          Nombre de la empresa
                        </label>
                        <Input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ej. Inmobiliaria López S.L."
                          required={userType === 'empresa'}
                          className="h-12 border-border"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        ¿Para qué quieres la cuenta?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            platform === 'nazari'
                              ? 'border-primary bg-muted text-foreground'
                              : 'border-border hover:border-border'
                          }`}
                          onClick={() => setPlatform('nazari')}
                        >
                          <div className="text-sm font-medium">Nazarí Homes</div>
                          <div className="text-xs text-muted-foreground mt-1">Comprar o alquilar vivienda</div>
                        </button>
                        <button
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            platform === 'roomie'
                              ? 'border-primary bg-muted text-foreground'
                              : 'border-border hover:border-border'
                          }`}
                          onClick={() => setPlatform('roomie')}
                        >
                          <div className="text-sm font-medium">Roomie Finder</div>
                          <div className="text-xs text-muted-foreground mt-1">Publicar habitación</div>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Si solo buscas habitación no necesitas cuenta: rellena tu ficha en Roomie Finder.
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    {t('account.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('account.enterEmail')}
                    required
                    className="h-12 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
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
                      className="h-12 border-border pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
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
                        className="h-12 border-border pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {t('account.forgotPassword')}
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading 
                    ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
                    : (isLogin ? t('account.loginButton') : t('account.registerButton'))
                  }
                </Button>
              </form>

              {/* Switch Mode */}
              <div className="text-center text-sm text-muted-foreground">
                {isLogin ? t('account.noAccount') : t('account.hasAccount')}
                {' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-foreground hover:text-foreground font-medium hover:underline"
                >
                  {isLogin ? t('account.createAccount') : t('account.loginHere')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Auth;