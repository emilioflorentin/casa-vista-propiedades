
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Account = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se implementaría la lógica de autenticación
    console.log("Form submitted:", formData);
  };

  const handleGoogleAuth = () => {
    // Aquí se implementaría la autenticación con Google
    console.log("Google authentication");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-stone-800">
                {isLogin ? t('account.login') || 'Iniciar Sesión' : t('account.register') || 'Crear Cuenta'}
              </CardTitle>
              <CardDescription className="text-stone-600">
                {isLogin 
                  ? t('account.loginDescription') || 'Accede a tu cuenta para continuar'
                  : t('account.registerDescription') || 'Crea tu cuenta para comenzar'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Auth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-stone-200 hover:bg-stone-50 text-stone-700"
                onClick={handleGoogleAuth}
              >
                <Chrome className="w-5 h-5 mr-3" />
                {isLogin 
                  ? t('account.continueWithGoogle') || 'Continuar con Google'
                  : t('account.registerWithGoogle') || 'Registrarse con Google'
                }
              </Button>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-stone-500">
                    {t('account.or') || 'o'}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-stone-700">
                      {t('account.fullName') || 'Nombre completo'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('account.enterName') || 'Ingresa tu nombre'}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-700">
                    {t('account.email') || 'Correo electrónico'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('account.enterEmail') || 'Ingresa tu email'}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-stone-700">
                    {t('account.password') || 'Contraseña'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('account.enterPassword') || 'Ingresa tu contraseña'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-stone-200 focus:border-stone-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                      {t('account.confirmPassword') || 'Confirmar contraseña'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('account.confirmPasswordPlaceholder') || 'Confirma tu contraseña'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-stone-600 hover:text-stone-800 underline"
                    >
                      {t('account.forgotPassword') || '¿Olvidaste tu contraseña?'}
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-stone-600 hover:bg-stone-700 text-white font-medium"
                >
                  {isLogin 
                    ? t('account.loginButton') || 'Iniciar Sesión'
                    : t('account.registerButton') || 'Crear Cuenta'
                  }
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-stone-600">
                  {isLogin 
                    ? t('account.noAccount') || '¿No tienes cuenta?'
                    : t('account.hasAccount') || '¿Ya tienes cuenta?'
                  }{' '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-stone-700 hover:text-stone-900 font-medium underline"
                  >
                    {isLogin 
                      ? t('account.createAccount') || 'Crear cuenta'
                      : t('account.loginHere') || 'Inicia sesión aquí'
                    }
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
