// src/app/privacidad/page.tsx

export default function PrivacyPage() {
  return (
    <main className="bg-[#f6f2ea] min-h-screen py-24">

      <div className="max-w-3xl mx-auto px-6 md:px-10">

        <h1 className="font-serif text-4xl md:text-5xl mb-10 text-neutral-900">
          Política de Privacidad
        </h1>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-[15px]">

          <p>
            Última actualización: Marzo 2026
          </p>

          <p>
            En <strong>Flowjuyu</strong> valoramos profundamente la privacidad
            de nuestros usuarios. Esta política explica cómo recopilamos,
            utilizamos y protegemos la información personal cuando utilizas
            nuestra plataforma.
          </p>

          {/* Información recopilada */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              1. Información que recopilamos
            </h2>

            <p>
              Para operar la plataforma Flowjuyu podemos recopilar distintos
              tipos de información cuando los usuarios crean una cuenta,
              interactúan con el catálogo o registran una tienda.
            </p>

            <p className="mt-4 font-medium">
              Información de cuenta
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre</li>
              <li>Correo electrónico</li>
              <li>Teléfono</li>
              <li>Dirección</li>
            </ul>

            <p className="mt-4 font-medium">
              Información de vendedores
            </p>

            <p className="mt-2">
              Los vendedores pueden proporcionar información adicional
              necesaria para operar una tienda dentro de la plataforma.
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre del comercio</li>
              <li>Teléfono comercial</li>
              <li>Ubicación (departamento y municipio)</li>
              <li>Descripción del negocio</li>
              <li>Logotipo de la tienda</li>
            </ul>

          </section>

          {/* Verificación */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              2. Verificación de vendedores
            </h2>

            <p>
              Para proteger la integridad del marketplace, Flowjuyu puede
              solicitar documentación para verificar la identidad de
              vendedores.
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Número de DPI</li>
              <li>Fotografía del documento de identidad</li>
              <li>Fotografía de verificación con el documento</li>
            </ul>

            <p className="mt-4">
              Esta información se utiliza únicamente para procesos de
              verificación interna y seguridad de la plataforma.
            </p>

          </section>

          {/* Uso */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              3. Cómo utilizamos la información
            </h2>

            <p>
              Utilizamos la información recopilada para:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Crear y administrar cuentas de usuario</li>
              <li>Permitir la publicación de productos</li>
              <li>Conectar compradores con vendedores</li>
              <li>Mejorar la experiencia de navegación</li>
              <li>Prevenir fraude o abuso de la plataforma</li>
              <li>Gestionar la autenticación y seguridad de las cuentas</li>
            </ul>

          </section>

          {/* Seguridad */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              4. Seguridad de la información
            </h2>

            <p>
              Flowjuyu implementa medidas de seguridad para proteger la
              información personal de los usuarios.
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Contraseñas encriptadas mediante algoritmos seguros</li>
              <li>Autenticación mediante tokens</li>
              <li>Sistemas de recuperación de contraseña</li>
              <li>Protección contra accesos no autorizados</li>
            </ul>

            <p className="mt-4">
              A pesar de estas medidas, ningún sistema en internet puede
              garantizar seguridad absoluta.
            </p>

          </section>

          {/* Almacenamiento */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              5. Almacenamiento de datos
            </h2>

            <p>
              Parte de la información y archivos de verificación pueden
              almacenarse utilizando servicios tecnológicos de terceros
              utilizados por la plataforma para garantizar disponibilidad
              y seguridad.
            </p>

          </section>

          {/* Cookies */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              6. Uso de cookies
            </h2>

            <p>
              Flowjuyu puede utilizar cookies u otras tecnologías similares
              para mejorar la experiencia del usuario y analizar el uso
              de la plataforma.
            </p>

          </section>

          {/* Derechos */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              7. Derechos del usuario
            </h2>

            <p>
              Los usuarios pueden solicitar:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Acceso a su información personal</li>
              <li>Corrección de datos incorrectos</li>
              <li>Eliminación de su cuenta</li>
            </ul>

          </section>

          {/* Cambios */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              8. Cambios en esta política
            </h2>

            <p>
              Flowjuyu puede actualizar esta política ocasionalmente para
              reflejar mejoras en la plataforma o cambios legales.
            </p>

          </section>

          {/* Contacto */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              9. Contacto
            </h2>

            <p>
              Si tienes preguntas sobre esta política de privacidad puedes
              contactarnos en:
            </p>

            <p className="mt-2 font-medium">
              contacto@flowjuyu.com
            </p>

          </section>

        </div>

      </div>

    </main>
  );
}