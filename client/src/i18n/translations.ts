export const translations = {
  en: {
    header: {
      loginSignup: 'Log in/Sign up',
      home: 'Home',
    },
    login: {
      emailPlaceholder: 'Login/e-mail',
      passwordPlaceholder: 'Password',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign in',
      keepLoggedIn: 'Keep me logged in',
      githubLogin: 'Continue with Github',
      googleLogin: 'Continue with Google',
      signUp: 'Sign up',
    },
    home: {
      currentUserSettings: 'Current User Settings',
      yourProfilePage: 'Your Profile Page (how others see you)',
      gameStatistics: 'Game Statistics and Match History',
      playLastSettings: 'Play with the Last Saved Settings',
      playCustomSettings: 'Play with Custom Settings',
    },
    footer: {
      logout: 'Logout',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
    },
  },
  es: {
    header: {
      loginSignup: 'Iniciar sesión/Registrarse',
      home: 'Inicio',
    },
    login: {
      emailPlaceholder: 'Usuario/e-mail',
      passwordPlaceholder: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      signIn: 'Iniciar sesión',
      keepLoggedIn: 'Mantenerme conectado',
      githubLogin: 'Continuar con Github',
      googleLogin: 'Continuar con Google',
      signUp: 'Registrarse',
    },
    home: {
      currentUserSettings: 'Configuración del Usuario Actual',
      yourProfilePage: 'Tu Página de Perfil (cómo te ven los demás)',
      gameStatistics: 'Estadísticas del Juego e Historial de Partidas',
      playLastSettings: 'Jugar con la Última Configuración Guardada',
      playCustomSettings: 'Jugar con Configuración Personalizada',
    },
    footer: {
      logout: 'Cerrar sesión',
      termsOfService: 'Términos de servicio',
      privacyPolicy: 'Política de privacidad',
    },
  },
  ca: {
    header: {
      loginSignup: 'Iniciar sessió/Registrar-se',
      home: 'Inici',
    },
    login: {
      emailPlaceholder: 'Usuari/e-mail',
      passwordPlaceholder: 'Contrasenya',
      forgotPassword: 'Has oblidat la contrasenya?',
      signIn: 'Iniciar sessió',
      keepLoggedIn: 'Mantenir-me connectat',
      githubLogin: 'Iniciar sessió amb Github',
      googleLogin: 'Continua amb Google',
      signUp: 'Registrar-se',
    },
    home: {
      currentUserSettings: 'Configuració de l\'Usuari Actual',
      yourProfilePage: 'La Teva Pàgina de Perfil (com et veuen els altres)',
      gameStatistics: 'Estadístiques del Joc i Historial de Partides',
      playLastSettings: 'Jugar amb l\'Última Configuració Guardada',
      playCustomSettings: 'Jugar amb Configuració Personalitzada',
    },
    footer: {
      logout: 'Tancar sessió',
      termsOfService: 'Termes de servei',
      privacyPolicy: 'Política de privadesa',
    },
  },
  fr: {
    header: {
      loginSignup: 'Se connecter/S\'inscrire',
      home: 'Accueil',
    },
    login: {
      emailPlaceholder: 'Identifiant/e-mail',
      passwordPlaceholder: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      signIn: 'Se connecter',
      keepLoggedIn: 'Rester connecté',
      githubLogin: 'Continuer avec Github',
      googleLogin: 'Continuer avec Google',
      signUp: 'S\'inscrire',
    },
    home: {
      currentUserSettings: 'Paramètres de l\'Utilisateur Actuel',
      yourProfilePage: 'Votre Page de Profil (comment les autres vous voient)',
      gameStatistics: 'Statistiques de Jeu et Historique des Matchs',
      playLastSettings: 'Jouer avec les Derniers Paramètres Enregistrés',
      playCustomSettings: 'Jouer avec des Paramètres Personnalisés',
    },
    footer: {
      logout: 'Se déconnecter',
      termsOfService: 'Conditions d\'utilisation',
      privacyPolicy: 'Politique de confidentialité',
    },
  },
  it: {
    header: {
      loginSignup: 'Accedi/Registrati',
      home: 'Home',
    },
    login: {
      emailPlaceholder: 'Login/e-mail',
      passwordPlaceholder: 'Password',
      forgotPassword: 'Password dimenticata?',
      signIn: 'Accedi',
      keepLoggedIn: 'Resta connesso',
      githubLogin: 'Continua con Github',
      googleLogin: 'Continua con Google',
      signUp: 'Registrati',
    },
    home: {
      currentUserSettings: 'Impostazioni Utente Corrente',
      yourProfilePage: 'La Tua Pagina Profilo (come ti vedono gli altri)',
      gameStatistics: 'Statistiche di Gioco e Cronologia Partite',
      playLastSettings: 'Gioca con le Ultime Impostazioni Salvate',
      playCustomSettings: 'Gioca con Impostazioni Personalizzate',
    },
    footer: {
      logout: 'Esci',
      termsOfService: 'Termini di servizio',
      privacyPolicy: 'Informativa sulla privacy',
    },
  },
  pl: {
    header: {
      loginSignup: 'Zaloguj się/Zarejestruj się',
      home: 'Strona główna',
    },
    login: {
      emailPlaceholder: 'Login/e-mail',
      passwordPlaceholder: 'Hasło',
      forgotPassword: 'Zapomniałeś hasła?',
      signIn: 'Zaloguj się',
      keepLoggedIn: 'Pozostań zalogowany',
      githubLogin: 'Kontynuuj z Github',
      googleLogin: 'Kontynuuj z Google',
      signUp: 'Zarejestruj się',
    },
    home: {
      currentUserSettings: 'Bieżące Ustawienia Użytkownika',
      yourProfilePage: 'Twoja Strona Profilu (jak widzą cię inni)',
      gameStatistics: 'Statystyki Gry i Historia Meczów',
      playLastSettings: 'Graj z Ostatnio Zapisanymi Ustawieniami',
      playCustomSettings: 'Graj z Niestandardowymi Ustawieniami',
    },
    
    footer: {
      logout: 'Wyloguj się',
      termsOfService: 'Warunki korzystania z usługi',
      privacyPolicy: 'Polityka prywatności',
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;
