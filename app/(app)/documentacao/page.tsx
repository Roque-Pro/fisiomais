import { BookText, Shield, UserCheck, Mail, Info, PlayCircle } from 'lucide-react';

export default function DocumentacaoPage() {
  return (
    <div className="space-y-8 pb-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
        <BookText className="h-6 w-6" /> Documentação e Políticas
      </h1>

      {/* Tutorial em Vídeo */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <PlayCircle className="h-5 w-5" /> Tutorial de Uso
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="aspect-video w-full bg-slate-900">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Substitua pelo ID do seu vídeo
              title="Tutorial Fisio+"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-4 bg-brand-50 border-t border-brand-100">
            <p className="text-sm text-brand-900 font-medium">
              Assista ao vídeo acima para aprender a configurar seu perfil, cadastrar pacientes e realizar sua primeira avaliação.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <Info className="h-5 w-5" /> Como funciona o Fisio+
        </div>
        <div className="card space-y-4 text-slate-600 leading-relaxed">
          <p>
            O Fisio+ foi desenvolvido para simplificar a rotina do fisioterapeuta, focando na agilidade do registro de avaliações e evoluções.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Gestão de Pacientes:</strong> Cadastre e organize sua lista de pacientes de forma centralizada.</li>
            <li><strong>Avaliações:</strong> Utilize formulários dinâmicos adaptados para diversas especialidades (Hidroterapia, Pilates, etc).</li>
            <li><strong>Evoluções:</strong> Registre o progresso diário de forma rápida, com histórico completo acessível a qualquer momento.</li>
            <li><strong>Exportação em PDF:</strong> Gere documentos profissionais com um clique para enviar a médicos ou pacientes.</li>
          </ul>
        </div>
      </section>

      {/* Atendimento Inclusivo (LGBT+) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <UserCheck className="h-5 w-5" /> Atendimento Inclusivo e Respeito (LGBT+)
        </div>
        <div className="card space-y-4 text-slate-600 leading-relaxed">
          <p>
            No Fisio+, acreditamos que a saúde deve ser inclusiva e respeitosa. Para o atendimento à comunidade LGBT+, recomendamos as seguintes práticas dentro da plataforma:
          </p>
          <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
            <h4 className="font-bold text-brand-900 mb-2">Nome Social vs. Nome Civil</h4>
            <p className="text-sm">
              Ao cadastrar um paciente, utilize preferencialmente o <strong>Nome Social</strong> no campo principal de nome. Isso garante que todos os PDFs e registros gerados tratem o paciente da forma como ele se identifica. Caso precise do nome civil para questões burocráticas, utilize o campo de observações.
            </p>
          </div>
          <p>
            Respeitar a identidade de gênero e o uso de pronomes corretos não é apenas uma questão de ética, mas uma diretriz de saúde humanizada que impacta diretamente na adesão ao tratamento.
          </p>
        </div>
      </section>

      {/* LGPD */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <Shield className="h-5 w-5" /> Proteção de Dados (LGPD)
        </div>
        <div className="card space-y-4 text-slate-600 leading-relaxed text-sm">
          <p>
            O Fisio+ está em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>. Como profissional de saúde, você é o <em>Controlador</em> dos dados de seus pacientes, e o Fisio+ atua como o <em>Operador</em>.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-1">Finalidade</h4>
              <p>Os dados são coletados estritamente para fins de assistência à saúde, diagnóstico e acompanhamento fisioterapêutico.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-1">Segurança</h4>
              <p>Utilizamos criptografia de ponta e servidores seguros para garantir a integridade das informações sensíveis.</p>
            </div>
          </div>
          <p>
            <strong>Direitos do Titular:</strong> Seus pacientes têm direito ao acesso, correção e exclusão de seus dados. Você, como profissional, pode gerenciar essas solicitações diretamente na plataforma ou através do nosso suporte.
          </p>
        </div>
      </section>

      {/* Privacidade e Exclusão de Dados */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <Shield className="h-5 w-5" /> Privacidade e Exclusão de Dados
        </div>
        <div className="card space-y-4 text-slate-600 leading-relaxed">
          <p>
            Sua privacidade e a de seus pacientes são prioridade. Todos os dados são armazenados de forma segura e criptografada.
          </p>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Mail className="h-6 w-6 text-brand-600 mt-1" />
            <div>
              <h4 className="font-bold text-slate-900">Solicitação de Exclusão</h4>
              <p className="text-sm mt-1">
                Para solicitar a exclusão definitiva da sua conta e de todos os dados associados a ela, envie um e-mail para:
                <br />
                <a href="mailto:fisiomais.jf@gmail.com" className="font-bold text-brand-600 hover:underline">fisiomais.jf@gmail.com</a>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                O prazo para processamento da exclusão é de até 5 dias úteis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outras Informações */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <Info className="h-5 w-5" /> Informações Importantes
        </div>
        <div className="card space-y-4 text-slate-600 text-sm">
          <p>
            <strong>Backup:</strong> Recomendamos a exportação periódica em PDF das avaliações e evoluções importantes para sua segurança offline.
          </p>
          <p>
            <strong>Suporte:</strong> Problemas técnicos ou sugestões podem ser encaminhados diretamente pelo e-mail de contato listado acima.
          </p>
        </div>
      </section>
    </div>
  );
}
