import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Termos de Serviço do Carteira MZ - condições de uso da aplicação.",
}

export default function TermsPage() {
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

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Termos de Serviço</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualização: Maio de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Aceitação dos Termos</h2>
            <p>
               Ao aceder ou utilizar o Carteira MZ (&ldquo;aplicação&rdquo;), você concorda em cumprir e ficar vinculado
              por estes Termos de Serviço. Se não concordar com algum dos termos, não deverá utilizar a aplicação.
              O Carteira MZ é uma aplicação de gestão financeira pessoal desenvolvida para Moçambique.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Elegibilidade</h2>
            <p>
              Para utilizar o Carteira MZ, você declara que:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Tem pelo menos 18 anos de idade ou idade legal para celebrar contratos vinculativos em Moçambique.</li>
              <li>Não está impedido de utilizar a aplicação por qualquer lei aplicável.</li>
              <li>Fornece informações precisas e verdadeiras durante o processo de registo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Descrição do Serviço</h2>
            <p>
              O Carteira MZ é uma aplicação web progressiva (PWA) que permite aos utilizadores registar e
              acompanhar as suas finanças pessoais, incluindo contas, transacções, orçamentos, metas de
              poupança, empréstimos e transferências. A aplicação também fornece relatórios e notificações
              para ajudar na gestão financeira. O serviço é fornecido &ldquo;como está&rdquo; e reservamo-nos o direito
              de modificar ou descontinuar funcionalidades a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Registo e Conta</h2>
            <p className="mb-2">
              Para aceder a certas funcionalidades, você precisa criar uma conta. Você é responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manter a confidencialidade das suas credenciais de acesso.</li>
              <li>Todas as actividades que ocorrem na sua conta.</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
            </ul>
            <p className="mt-2">
              Reservamo-nos o direito de recusar o registo, suspender ou encerrar contas a nosso critério.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Conduta do Utilizador</h2>
            <p className="mb-2">Ao utilizar o Carteira MZ, você concorda em:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer informações precisas e manter os seus dados actualizados.</li>
              <li>Utilizar a aplicação apenas para fins lícitos e de acordo com estes termos.</li>
              <li>Não tentar aceder a áreas restritas da aplicação sem autorização.</li>
              <li>Não introduzir malware, código malicioso ou interferir com o funcionamento da aplicação.</li>
              <li>Não utilizar a aplicação para armazenar informações fraudulentas ou enganosas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Propriedade Intelectual</h2>
            <p>
              O Carteira MZ e todo o seu conteúdo, incluindo mas não limitado a código-fonte, design,
              logótipo, ícones e documentação, é propriedade exclusiva do desenvolvedor e está protegido
              pelas leis de propriedade intelectual aplicáveis. Você não pode copiar, modificar, distribuir,
              vender ou criar trabalhos derivados sem autorização explícita.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Privacidade dos Dados Financeiros</h2>
            <p>
              O Carteira MZ não se conecta directamente a instituições bancárias ou financeiras. Todos os
              dados financeiros registados na aplicação são inseridos manualmente por si. Você é o único
              responsável pela precisão e veracidade das informações financeiras que regista. Não nos
              responsabilizamos por decisões financeiras tomadas com base nos dados fornecidos na aplicação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Limitação de Responsabilidade</h2>
            <p>
              Em nenhuma circunstância o Carteira MZ, seus desenvolvedores ou colaboradores serão
              responsáveis por quaisquer danos directos, indirectos, incidentais, especiais ou consequenciais
              decorrentes do uso ou da incapacidade de usar a aplicação. O Carteira MZ é uma ferramenta de
              acompanhamento financeiro e não fornece aconselhamento financeiro profissional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Isenção de Garantias</h2>
            <p>
              A aplicação é fornecida &ldquo;como está&rdquo; e &ldquo;conforme disponível&rdquo;, sem garantias de qualquer tipo,
              expressas ou implícitas. Não garantimos que a aplicação seja ininterrupta, livre de erros ou
              que atenda às suas necessidades específicas. O uso da aplicação é por sua conta e risco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Cancelamento e Exclusão de Conta</h2>
            <p>
              Você pode eliminar a sua conta a qualquer momento nas configurações da aplicação. Ao eliminar
              a conta, todos os seus dados serão permanentemente removidos. Reservamo-nos o direito de
              suspender ou encerrar contas que violem estes Termos de Serviço ou que estejam inactivas por
              um período prolongado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Alterações aos Termos</h2>
            <p>
              Podemos modificar estes Termos de Serviço a qualquer momento. As alterações entram em vigor
              imediatamente após a publicação na aplicação. Notificaremos os utilizadores sobre alterações
              significativas. O uso continuado da aplicação após as alterações constitui aceitação dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">12. Lei Aplicável</h2>
            <p>
              Estes Termos de Serviço são regidos pelas leis da República de Moçambique. Qualquer disputa
              decorrente destes termos será submetida à jurisdição exclusiva dos tribunais moçambicanos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">13. Contacto</h2>
            <p>
              Para questões relacionadas com estes Termos de Serviço, entre em contacto:
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
