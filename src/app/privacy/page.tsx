import Link from "next/link";

export const metadata = {
  title: "Aviso de Privacidad | Deep Audit",
  description: "Aviso de privacidad y politica de datos de Deep Audit Knowledge Engine.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
            &larr; Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mt-6 mb-2">Aviso de Privacidad</h1>
          <p className="text-gray-500 text-sm">Ultima actualizacion: 16 de mayo de 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Responsable del tratamiento</h2>
          <p className="text-gray-400 leading-relaxed">
            Deep Audit Knowledge Engine es operado por Luis Aguilar Aguila
            (<a href="mailto:luisaguilaraguila@gmail.com" className="text-[#10b981] hover:underline">luisaguilaraguila@gmail.com</a>).
            Este aviso describe como se recopilan, usan y protegen los datos personales de los usuarios
            de la plataforma disponible en{" "}
            <span className="text-[#10b981]">knowledge.luisaguilaraguila.com</span>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Datos que recopilamos</h2>
          <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
            <li><span className="text-white font-medium">Cuenta:</span> correo electronico y contrasena (gestionados por Supabase Auth).</li>
            <li><span className="text-white font-medium">Contenido ingresado:</span> URLs, archivos de audio, feeds RSS, y texto que el usuario envia voluntariamente para analisis.</li>
            <li><span className="text-white font-medium">Datos de uso:</span> timestamps de solicitudes y tipo de operacion (sin registros de contenido de respuestas de IA).</li>
            <li><span className="text-white font-medium">IP de origen:</span> usada unicamente para rate limiting (se descarta al reiniciar el contenedor).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Finalidades del tratamiento</h2>
          <ul className="text-gray-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>Proveer el servicio de analisis y almacenamiento semantico de contenido.</li>
            <li>Autenticar y autorizar el acceso a la plataforma.</li>
            <li>Prevenir abuso mediante rate limiting por IP.</li>
            <li>Mejorar la calidad del servicio mediante metricas de uso anonimas.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Terceros que procesan tus datos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-400 border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/5 text-white">
                  <th className="text-left px-4 py-3 font-bold">Servicio</th>
                  <th className="text-left px-4 py-3 font-bold">Proposito</th>
                  <th className="text-left px-4 py-3 font-bold">Politica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-4 py-3">Supabase</td>
                  <td className="px-4 py-3">Autenticacion y base de datos</td>
                  <td className="px-4 py-3">
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#10b981] hover:underline">supabase.com/privacy</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Google Gemini</td>
                  <td className="px-4 py-3">Inferencia de IA para analisis de contenido</td>
                  <td className="px-4 py-3">
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#10b981] hover:underline">policies.google.com/privacy</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Cloudflare</td>
                  <td className="px-4 py-3">Tunel de red y CDN</td>
                  <td className="px-4 py-3">
                    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-[#10b981] hover:underline">cloudflare.com/privacypolicy</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Retencion de datos</h2>
          <p className="text-gray-400 leading-relaxed">
            El contenido procesado (fragmentos de texto, embeddings) se conserva mientras la cuenta este activa.
            Al eliminar tu cuenta, todos los datos asociados son borrados de la base de datos en un plazo maximo de 30 dias.
            Los logs del servidor se rotan automaticamente cada 7 dias.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">6. Tus derechos</h2>
          <p className="text-gray-400 leading-relaxed">
            Puedes solicitar acceso, correccion o eliminacion de tus datos en cualquier momento escribiendo a{" "}
            <a href="mailto:luisaguilaraguila@gmail.com" className="text-[#10b981] hover:underline">
              luisaguilaraguila@gmail.com
            </a>.
            Respondemos en un plazo maximo de 15 dias habiles.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">7. Seguridad</h2>
          <p className="text-gray-400 leading-relaxed">
            La plataforma usa HTTPS en todas las comunicaciones, autenticacion JWT verificada en el servidor,
            y rate limiting por IP para prevenir abuso. Los datos en reposo estan protegidos por las medidas
            de seguridad de Supabase (cifrado AES-256).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">8. Cambios a este aviso</h2>
          <p className="text-gray-400 leading-relaxed">
            Cualquier cambio material sera notificado por correo electronico a los usuarios registrados
            con al menos 7 dias de anticipacion. La version vigente siempre estara disponible en esta pagina.
          </p>
        </section>

        <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-600">
          Deep Audit Knowledge Engine &mdash; {new Date().getFullYear()} &mdash;{" "}
          <a href="mailto:luisaguilaraguila@gmail.com" className="hover:text-gray-400 transition-colors">
            luisaguilaraguila@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
