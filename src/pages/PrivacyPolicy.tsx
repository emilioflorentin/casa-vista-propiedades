
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Política de Privacidad</h1>
          <p className="text-xl text-stone-50">Información sobre el tratamiento de sus datos personales</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-stone max-w-none">
            
            <p className="text-gray-700 mb-6">
              En esta Política de Privacidad encontrarás toda la información relativa al uso que hacemos de los datos personales que utilizas para interactuar con nosotros como usuario.
            </p>

            <p className="text-gray-700 mb-6">
              Dispones de forma permanente de esta Política de Privacidad que puedes consultar cuando lo estimes oportuno.
            </p>

            <p className="text-gray-700 mb-8">
              Cualquier duda que te surja en la lectura de esta información no dudes en preguntarnos al email: 
              <a href="mailto:info@inmobiliariagranaideal.com" className="text-blue-600 hover:underline ml-1">
                info@inmobiliariagranaideal.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Quiénes somos?</h2>
            <p className="text-gray-700 mb-4">
              GRUPO HIDALGO GRANADA, S.L. con CIF B19905674 y domicilio social en PASEO DE COLÓN Nº1 LOCAL 4, titular de la web 
              <a href="https://granahidal.es/" className="text-blue-600 hover:underline ml-1">
                https://granahidal.es/
              </a> y responsable del tratamiento de tus datos personales, se usa para y de su protección.
            </p>

            <p className="text-gray-700 mb-8">
              El uso de los servicios del Sitio Web, así como la adquisición de cualesquiera de los productos ofertados, supone tu aceptación como Cliente, sin reservas de ninguna clase, de todas las manifestaciones contenidas en esta Política de Privacidad y en las Condiciones Generales.
            </p>

            <p className="text-gray-700 mb-8">
              Tu registro en la web y el uso de sus servicios conlleva que los datos personales que hayas facilitado en el formulario de alta como Cliente pasarán a formar parte de ficheros para su tratamiento con la finalidad, legitimación, cesiones y períodos de conservación que se detalla a continuación, y que declaras conocer y aceptar al pulsar el botón de acción del formulario.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">Limitaciones</h2>
            <p className="text-gray-700 mb-8">
              El contenido promocional de la web está dirigida a todos los usuarios, pero si vas a registrarte como cliente o realizar alguna compra debes ser mayor de edad.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Para qué finalidad usamos tus datos?</h2>
            <p className="text-gray-700 mb-4">
              Dependiendo de cómo interactúes en nuestra web, trataremos tus datos personales para las siguientes finalidades:
            </p>
            <p className="text-gray-700 mb-8 font-semibold">
              Atender las consultas, sugerencias o solicitudes que nos realices a través de la web.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Qué datos personales te solicitaremos?</h2>
            <p className="text-gray-700 mb-4">
              A través de nuestro formulario de contacto: Nombre, correo electrónico y teléfono.
            </p>
            <p className="text-gray-700 mb-8">
              En la <span className="text-blue-600">Política de cookies</span> podrás encontrar qué otro tipo de información recogeremos a través del uso de cookies.
            </p>

            <p className="text-gray-700 mb-8">
              Recuerda que todos los datos que te solicitamos como obligatorios son los mínimos necesarios para poder prestarte el servicio o permitirte el acceso a determinada funcionalidad de la web. Si decides no facilitar estos datos es posible que no puedas completar tu registro o no podamos proporcionarte determinados servicios o funcionalidades.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Por qué usamos tus datos?</h2>
            <p className="text-gray-700 mb-4">
              La legitimación para el tratamiento de tus datos proviene de que necesitamos tratarlos para ejecutar el contrato que aceptas con nosotros al registrarte y al disfrutar de nuestros servicios (base legal: contractual).
            </p>
            <p className="text-gray-700 mb-8">
              Hay otras razones como nuestro interés en atender tus consultas o solicitudes y el consentimiento que nos prestas para poder enviarte nuestra información comercial.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Cuánto tiempo conservamos tus datos?</h2>
            <p className="text-gray-700 mb-4">
              Tus datos personales serán conservados durante el tiempo que permanezca tu cuenta de usuario activa. Recuerda que puedes cancelarla en cualquier momento mediante solicitud al email 
              <a href="mailto:info@inmobiliariagranaideal.com" className="text-blue-600 hover:underline">
                info@inmobiliariagranaideal.com
              </a>. Una vez cancelada la cuenta, tus datos personales se conservarán bloqueados durante el período exigido por la legislación fiscal para la prescripción de responsabilidades en el caso de que hayas efectuado alguna adquisición de productos.
            </p>

            <p className="text-gray-700 mb-4">
              En cualquier otro caso tus datos personales se conservarán durante un período de 3 meses desde tu decisión de cancelación, por si pudieran derivarse algún tipo de responsabilidades.
            </p>
            <p className="text-gray-700 mb-8">
              Una vez finalizados los plazos, los datos serán eliminados de nuestros registros.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Con quién compartimos tus datos?</h2>
            <p className="text-gray-700 mb-4">
              Para el cumplimiento de las finalidades expresadas, tus datos personales serán comunicados a prestadores de servicios auxiliares que nos faciliten la gestión o nuestras obligaciones legales, tales como empresas de transporte, de asesoramientos fiscal y jurídico y de alojamiento web entre otras.
            </p>
            <p className="text-gray-700 mb-4">
              También cedemos los datos personales a Organismos o Administraciones públicas a las que estemos obligados por exigencia legal.
            </p>
            <p className="text-gray-700 mb-8">
              Puedes solicitar una lista de estas empresas y organismo a través de nuestro email 
              <a href="mailto:info@inmobiliariagranaideal.com" className="text-blue-600 hover:underline">
                info@inmobiliariagranaideal.com
              </a>.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">¿Qué derechos tienes sobre tus datos personales?</h2>
            <p className="text-gray-700 mb-4">
              Con independencia de la justificación legal con la que hemos realizado el tratamiento de tus datos personales, tienes una serie de derechos que puedes ejercer ante GRUPO HIDALGO GRANADA, S.L., mediante comunicación al email 
              <a href="mailto:info@inmobiliariagranaideal.com" className="text-blue-600 hover:underline">
                info@inmobiliariagranaideal.com
              </a>.
            </p>

            <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
              <li>
                Cuando ejerzas este derecho de supresión, bloquearemos tus datos personales para cualquier tipo de tratamiento durante el período de conservación que te hemos indicado líneas arriba, transcurrido el mismo procederá la eliminación definitiva.
              </li>
              <li>
                Derecho a que limitemos el tratamiento de tus datos, lo que supone que en determinados casos puedas solicitarnos que suspendamos temporalmente el tratamiento de los datos conservados sin allí del derecho a conserva y a poder hacer uso de los mismos cuando puedas necesitar reactivar los.
              </li>
              <li>
                Derecho a solicitar la portabilidad de sus datos personales. Esto significa que tendrás derecho a recibir los datos personales que nos hayas facilitado en un formato estructurado, de uso común y legible por una máquina, para poder transmitirlo a otra entidad directamente, siempre que técnicamente sea posible.
              </li>
              <li>
                También puedes presentar una reclamación ante la autoridad de control en materia de protección de datos, en particular, ante la Agencia Española de Protección de Datos.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-stone-800 mb-4">Cambios en la Política de Privacidad</h2>
            <p className="text-gray-700 mb-4">
              Es posible que adaptemos o modifiquemos la información contenida en esta Política de Privacidad cuando lo estimemos conveniente o incorporemos nuevas funcionalidades en la plataforma que así lo exijan.
            </p>
            <p className="text-gray-700 mb-4">
              En caso de que lo hagamos, te lo notificaremos mediante un banner informativo en la propia web.
            </p>
            <p className="text-gray-700 mb-8">
              Te aconsejamos revises periódicamente esta Política de Privacidad.
            </p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
