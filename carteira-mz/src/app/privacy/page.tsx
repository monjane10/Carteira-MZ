import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade do Carteira MZ - saiba como tratamos os seus dados.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualização: Maio de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Introdução</h2>
            <p>
              A sua privacidade é importante para nós. Esta Política de Privacidade descreve como o Carteira MZ
              (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo; ou &ldquo;aplicação&rdquo;) coleta, usa, armazena e protege as informações pessoais dos
              utilizadores (&ldquo;você&rdquo; ou &ldquo;utilizador&rdquo;) ao utilizar a nossa aplicação de gestão financeira pessoal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Dados que Coletamos</h2>
            <p className="mb-2">Ao utilizar o Carteira MZ, podemos coletar os seguintes tipos de dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dados de identificação:</strong> nome completo, endereço de email e foto de perfil.</li>
              <li><strong>Dados financeiros:</strong> informações sobre contas bancárias, transacções, orçamentos, metas de poupança, empréstimos e transferências que você regista voluntariamente na aplicação.</li>
              <li><strong>Dados de utilização:</strong> informações sobre como você interage com a aplicação, incluindo páginas visitadas e funcionalidades utilizadas.</li>
              <li><strong>Dados do dispositivo:</strong> tipo de dispositivo, sistema operativo e identificadores únicos do dispositivo para efeitos de notificações push.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Como Utilizamos os Seus Dados</h2>
            <p className="mb-2">Os seus dados são utilizados para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer, manter e melhorar a aplicação de gestão financeira.</li>
              <li>Processar e armazenar as suas transacções financeiras.</li>
              <li>Gerar relatórios e estatísticas financeiras personalizadas.</li>
              <li>Enviar notificações push sobre lembretes e alertas financeiros.</li>
              <li>Responder a solicitações de suporte e assistência.</li>
              <li>Cumprir obrigações legais e regulamentares aplicáveis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Armazenamento e Segurança</h2>
            <p>
              Os seus dados são armazenados em servidores seguros através do Supabase, um serviço de backend
              com conformidade com padrões de segurança da indústria. Implementamos medidas técnicas e
              organizacionais adequadas para proteger os seus dados contra acesso não autorizado, alteração,
              divulgação ou destruição, incluindo encriptação em trânsito (TLS) e em repouso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Partilha de Dados</h2>
            <p className="mb-2">Não vendemos, alugamos ou partilhamos os seus dados pessoais com terceiros, exceto:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Prestadores de serviços:</strong> utilizamos o Supabase como fornecedor de infraestrutura de backend e base de dados.</li>
              <li><strong>Obrigações legais:</strong> quando exigido por lei, processo judicial ou solicitação governamental válida.</li>
              <li><strong>Com o seu consentimento:</strong> em outras situações, mediante a sua autorização explícita.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Os Seus Direitos</h2>
            <p className="mb-2">De acordo com a legislação aplicável de proteção de dados, você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Aceder</strong> aos seus dados pessoais que mantemos.</li>
              <li><strong>Rectificar</strong> dados inexactos ou incompletos.</li>
              <li><strong>Eliminar</strong> os seus dados pessoais (&ldquo;direito ao esquecimento&rdquo;).</li>
              <li><strong>Limitar</strong> o processamento dos seus dados.</li>
              <li><strong>Portabilidade</strong> dos seus dados para outro serviço.</li>
              <li><strong>Opor-se</strong> ao processamento dos seus dados para determinadas finalidades.</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer um destes direitos, entre em contacto connosco através do email abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Retenção de Dados</h2>
            <p>
              Mantemos os seus dados pessoais enquanto a sua conta estiver ativa. Se você eliminar a sua conta,
              todos os seus dados serão permanentemente removidos dos nossos servidores no prazo máximo de 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Cookies e Tecnologias Semelhantes</h2>
            <p>
              O Carteira MZ utiliza cookies essenciais para o funcionamento da autenticação e sessão. Estas
              tecnologias são necessárias para que a aplicação funcione correctamente. Não utilizamos cookies
              de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Notificações Push</h2>
            <p>
              Com o seu consentimento, podemos enviar notificações push para o seu dispositivo para o lembrar
              de pagamentos, alertar sobre movimentos importantes ou partilhar actualizações da aplicação.
              Pode gerir as suas preferências de notificação a qualquer momento nas configurações do seu
              dispositivo ou na aplicação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Alterações a Esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidade periodicamente. Notificaremos os utilizadores
              sobre alterações significativas através da aplicação ou por email. O uso continuado da aplicação
              após tais alterações constitui aceitação da política actualizada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Contacto</h2>
            <p>
              Se tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre o tratamento dos
              seus dados, entre em contacto connosco:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:louramonja52.n@gmail.com" className="text-emerald-600 hover:text-emerald-700">
                louramonja52.n@gmail.com
              </a>
              <br />
              <strong>Desenvolvedor:</strong> Lourenço Monjane
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center">
          <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Voltar ao Carteira MZ
          </Link>
        </div>
      </div>
    </div>
  )
}
