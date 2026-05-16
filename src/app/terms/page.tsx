import Link from "next/link";

export const metadata = {
  title: "Terminos de Servicio | Deep Audit",
  description: "Terminos y condiciones de uso de Deep Audit Knowledge Engine.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
            &larr; Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mt-6 mb-2">Terminos de Servicio</h1>
          <p className="text-gray-500 text-sm">Ultima actualizacion: 16 de mayo de 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Aceptacion</h2>
          <p className="text-gray-400 leading-relaxed">
            Al crear una cuenta o usar Deep Audit Knowledge Engine (en adelante, "el Servicio"),
            disponible en{" "}
            <span className="text-[#10b981]">knowledge.luisaguilaraguila.com</span>,
            aceptas quedar vinculado por estos Terminos. Si no estas de acuerdo, no utilices el Servicio.
            El Servicio es operado por Luis Aguilar Aguila (
            <a href="mailto:luisaguilaraguila@gmail.com" className="text-[#10b981] hover:underline">
              luisaguilaraguila@gmail.com
            </a>).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Descripcion del Servicio</h2>
          <p className="text-gray-400 leading-relaxed">
            Deep Audit es una plataforma de inteligencia semantica que permite a los usuarios ingestar,
            vectorizar y consultar contenido proveniente de fuentes como YouTube, audio, GitHub, RSS,
            paginas web y documentos. El procesamiento se realiza mediante modelos de IA de terceros
            (Google Gemini) y el almacenamiento en una base de datos vectorial (Supabase pgvector).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Cuentas de usuario</h2>
          <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>Debes proporcionar un correo electronico valido al registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contrasena.</li>
            <li>Notifica de inmediato cualquier uso no autorizado de tu cuenta a{" "}
              <a href="mailto:luisaguilaraguila@gmail.com" className="text-[#10b981] hover:underline">
                luisaguilaraguila@gmail.com
              </a>.
            </li>
            <li>Nos reservamos el derecho de suspender cuentas que violen estos Terminos.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Uso aceptable</h2>
          <p className="text-gray-400 leading-relaxed">El Servicio no debe usarse para:</p>
          <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>Ingestar contenido que infrinja derechos de autor o propiedad intelectual de terceros.</li>
            <li>Realizar solicitudes automatizadas masivas que superen los limites de tasa establecidos.</li>
            <li>Intentar acceder a datos de otros usuarios o al sistema subyacente sin autorizacion.</li>
            <li>Distribuir malware, spam o cualquier contenido danino a traves del Servicio.</li>
            <li>Cualquier actividad ilegal bajo la legislacion mexicana o internacional aplicable.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Contenido del usuario</h2>
          <p className="text-gray-400 leading-relaxed">
            Conservas todos los derechos sobre el contenido que envias al Servicio. Al usarlo,
            nos otorgas una licencia limitada, no exclusiva y revocable para procesar dicho contenido
            con el unico fin de prestar el Servicio. No vendemos ni compartimos tu contenido con terceros
            mas alla de lo descrito en el{" "}
            <Link href="/privacy" className="text-[#10b981] hover:underline">Aviso de Privacidad</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">6. Limites del Servicio</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-400 border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/5 text-white">
                  <th className="text-left px-4 py-3 font-bold">Endpoint</th>
                  <th className="text-left px-4 py-3 font-bold">Limite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-4 py-3">/analyze/* (analisis de contenido)</td>
                  <td className="px-4 py-3">5 solicitudes / minuto</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">/search/* (busqueda RAG)</td>
                  <td className="px-4 py-3">5-10 solicitudes / minuto</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">/rss/* (feeds)</td>
                  <td className="px-4 py-3">3-20 solicitudes / minuto</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">/sync/*, /vault/*</td>
                  <td className="px-4 py-3">3 solicitudes / minuto</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 leading-relaxed text-sm">
            Superar estos limites resulta en un bloqueo temporal de la IP de origen (HTTP 429).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">7. Disponibilidad</h2>
          <p className="text-gray-400 leading-relaxed">
            El Servicio se ofrece "tal como esta" sin garantia de disponibilidad continua.
            Nos esforzamos por mantener alta disponibilidad, pero pueden existir interrupciones
            por mantenimiento, actualizaciones o causas de fuerza mayor. No somos responsables
            por perdidas derivadas de interrupciones del servicio.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">8. Limitacion de responsabilidad</h2>
          <p className="text-gray-400 leading-relaxed">
            En la maxima medida permitida por la ley, el operador del Servicio no sera responsable
            por danos indirectos, incidentales, especiales o consecuentes derivados del uso o
            imposibilidad de uso del Servicio, incluyendo pero no limitado a perdida de datos
            o perdida de beneficios.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">9. Cancelacion y terminacion</h2>
          <p className="text-gray-400 leading-relaxed">
            Puedes cancelar tu cuenta en cualquier momento escribiendo a{" "}
            <a href="mailto:luisaguilaraguila@gmail.com" className="text-[#10b981] hover:underline">
              luisaguilaraguila@gmail.com
            </a>.
            Nos reservamos el derecho de terminar cuentas que violen estos Terminos, con o sin aviso previo.
            Tras la cancelacion, tus datos se eliminan conforme a lo indicado en el Aviso de Privacidad.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">10. Cambios a estos Terminos</h2>
          <p className="text-gray-400 leading-relaxed">
            Podemos actualizar estos Terminos en cualquier momento. Los cambios materiales se notificaran
            por correo electronico con al menos 7 dias de anticipacion. El uso continuado del Servicio
            despues de la fecha efectiva constituye aceptacion de los Terminos revisados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">11. Ley aplicable</h2>
          <p className="text-gray-400 leading-relaxed">
            Estos Terminos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia
            se sometera a la jurisdiccion de los tribunales competentes en Mexico.
          </p>
        </section>

        <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-3 text-xs text-gray-600">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              Aviso de Privacidad
            </Link>
            <span>&mdash;</span>
            <a href="mailto:luisaguilaraguila@gmail.com" className="hover:text-gray-400 transition-colors">
              luisaguilaraguila@gmail.com
            </a>
          </div>
          <div>Deep Audit Knowledge Engine &mdash; {new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  );
}
