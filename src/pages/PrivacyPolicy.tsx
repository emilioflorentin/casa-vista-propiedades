import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t("privacy.title")}</h1>
          <p className="text-xl text-stone-50">{t("privacy.subtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-stone max-w-none">
            <p className="text-gray-700 mb-6">{t("privacy.intro_p1")}</p>

            <p className="text-gray-700 mb-6">{t("privacy.intro_p2")}</p>

            <p className="text-gray-700 mb-8">
              {t("privacy.intro_p3")}
              <a href="mailto:info@nazarihomes.com" className="text-blue-600 hover:underline ml-1">
                info@nazarihomes.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.who_we_are")}</h2>
            <p className="text-gray-700 mb-4">
              {t("privacy.who_we_are_p1")}
              <a href="https://nazarihomes.com/" className="text-blue-600 hover:underline ml-1">
                https://nazarihomes.com/
              </a>{" "}
              {t("privacy.who_we_are_p1_cont")}
            </p>

            <p className="text-gray-700 mb-8">{t("privacy.who_we_are_p2")}</p>

            <p className="text-gray-700 mb-8">{t("privacy.who_we_are_p3")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.limitations")}</h2>
            <p className="text-gray-700 mb-8">{t("privacy.limitations_p1")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.data_purpose")}</h2>
            <p className="text-gray-700 mb-4">{t("privacy.data_purpose_p1")}</p>
            <p className="text-gray-700 mb-8 font-semibold">{t("privacy.data_purpose_p2")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.what_data")}</h2>
            <p className="text-gray-700 mb-4">{t("privacy.what_data_p1")}</p>
            <p className="text-gray-700 mb-8">{t("privacy.what_data_p2")}</p>

            <p className="text-gray-700 mb-8">{t("privacy.what_data_p3")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">Uso de Cookies</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para mejorar su experiencia en nuestro sitio web y proporcionar funcionalidades
              personalizadas:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
              <li>
                <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio web
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> Para recordar sus configuraciones, idioma y propiedades
                favoritas
              </li>
              <li>
                <strong>Cookies analíticas:</strong> Para entender cómo usa nuestro sitio (solo si las acepta)
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              Para la funcionalidad de favoritos, utilizamos un identificador único que se almacena en una cookie. Este
              identificador no contiene información personal y se utiliza únicamente para asociar sus propiedades
              favoritas con su navegador.
            </p>
            <p className="text-gray-700 mb-8">
              Puede gestionar sus preferencias de cookies a través del banner que aparece en su primera visita al sitio.
              Si rechaza las cookies, algunas funcionalidades como recordar sus favoritos no estarán disponibles.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.why_use_data")}</h2>
            <p className="text-gray-700 mb-4">{t("privacy.why_use_data_p1")}</p>
            <p className="text-gray-700 mb-8">{t("privacy.why_use_data_p2")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.data_retention")}</h2>
            <p className="text-gray-700 mb-4">
              {t("privacy.data_retention_p1")}
              <a href="mailto:info@nazarihomes.com" className="text-blue-600 hover:underline">
                info@nazarihomes.com
              </a>
              {t("privacy.data_retention_p1_cont")}
            </p>

            <p className="text-gray-700 mb-4">{t("privacy.data_retention_p2")}</p>
            <p className="text-gray-700 mb-8">{t("privacy.data_retention_p3")}</p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.data_sharing")}</h2>
            <p className="text-gray-700 mb-4">{t("privacy.data_sharing_p1")}</p>
            <p className="text-gray-700 mb-4">{t("privacy.data_sharing_p2")}</p>
            <p className="text-gray-700 mb-8">
              {t("privacy.data_sharing_p3")}
              <a href="mailto:info@nazarihomes.com" className="text-blue-600 hover:underline">
                info@nazarihomes.com
              </a>
              .
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.your_rights")}</h2>
            <p className="text-gray-700 mb-4">
              {t("privacy.your_rights_p1")}
              <a href="mailto:info@nazarihomes.com" className="text-blue-600 hover:underline">
                info@nazarihomes.com
              </a>
              .
            </p>

            <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
              <li>{t("privacy.your_rights_li1")}</li>
              <li>{t("privacy.your_rights_li2")}</li>
              <li>{t("privacy.your_rights_li3")}</li>
              <li>{t("privacy.your_rights_li4")}</li>
            </ul>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t("privacy.policy_changes")}</h2>
            <p className="text-gray-700 mb-4">{t("privacy.policy_changes_p1")}</p>
            <p className="text-gray-700 mb-4">{t("privacy.policy_changes_p2")}</p>
            <p className="text-gray-700 mb-8">{t("privacy.policy_changes_p3")}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
