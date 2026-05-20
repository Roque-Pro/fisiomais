export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'scale' | 'checkbox-group' | 'date';

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  help?: string;
};

export type Section = { title: string; fields: Field[] };

export type Specialty = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sections: Section[];
};

const painScale: Field = {
  key: 'pain_scale', label: 'Escala de dor (EVA 0–10)', type: 'scale', min: 0, max: 10
};

export const specialties: Specialty[] = [
  {
    id: 'pilates',
    name: 'Pilates',
    emoji: '🧘‍♀️',
    description: 'Avaliação pré-Pilates Clínico conforme padrões COFFITO/CREFITO.',
    sections: [
      {
        title: 'Queixa e Objetivo',
        fields: [
          { key: 'chief_complaint', label: 'Queixa principal', type: 'textarea' },
          { key: 'functional_objective', label: 'Objetivo funcional', type: 'textarea' }
        ]
      },
      {
        title: 'História Clínica',
        fields: [
          { key: 'current_illness', label: 'História da moléstia atual', type: 'textarea' },
          { key: 'past_history', label: 'Histórico patológico e comorbidades', type: 'textarea' },
          { key: 'medications', label: 'Medicações em uso', type: 'textarea' },
          { key: 'surgeries_exams', label: 'Cirurgias prévias e exames', type: 'textarea' }
        ]
      },
      {
        title: 'Triagem Clínica',
        fields: [
          { key: 'clinical_indication', label: 'Indicação clínica', type: 'text' },
          { key: 'abs_contraindications', label: 'Contraindicações Absolutas', type: 'checkbox-group',
            options: ['Dor aguda incapacitante', 'Instabilidade clínica', 'Febre', 'Crise vestibular', 'Restrição médica'] },
          { key: 'rel_contraindications', label: 'Contraindicações Relativas', type: 'checkbox-group',
            options: ['Osteoporose grave', 'Hipertensão descompensada', 'Labirintopatia', 'Gestação de risco', 'Limitação de mobilidade'] },
          { key: 'medical_clearance', label: 'Liberação médica?', type: 'select', options: ['Sim', 'Não'] }
        ]
      },
      {
        title: 'Exame Físico-Funcional',
        fields: [
          { key: 'bp', label: 'Pressão Arterial', type: 'text', placeholder: 'ex: 120/80' },
          { key: 'hr', label: 'Frequência Cardíaca (bpm)', type: 'number' },
          { key: 'rr', label: 'Frequência Respiratória (rpm)', type: 'number' },
          { key: 'spo2', label: 'Saturação de O2 (%)', type: 'number' },
          { key: 'temp', label: 'Temperatura (°C)', type: 'number' },
          painScale,
          { key: 'inspection_posture', label: 'Inspeção e postura', type: 'textarea' },
          { key: 'rom', label: 'Amplitude de movimento', type: 'textarea' },
          { key: 'strength', label: 'Força muscular', type: 'textarea' },
          { key: 'tone_sensibility', label: 'Tônus, trofismo e sensibilidade', type: 'textarea' },
          { key: 'balance_gait', label: 'Equilíbrio, coordenação e marcha', type: 'textarea' }
        ]
      },
      {
        title: 'Plano Terapêutico',
        fields: [
          { key: 'cbdf_diagnosis', label: 'Diagnóstico (CBDF)', type: 'text' },
          { key: 'prognosis', label: 'Prognóstico', type: 'text' },
          { key: 'therap_objectives', label: 'Objetivos terapêuticos', type: 'textarea' },
          { key: 'conduct', label: 'Conduta', type: 'checkbox-group',
            options: ['Controle motor', 'Estabilização', 'Flexibilidade', 'Fortalecimento', 'Mobilidade', 'Coordenação', 'Equilíbrio', 'Respiração', 'Consciência corporal'] },
          { key: 'resources', label: 'Recursos', type: 'checkbox-group',
            options: ['Solo', 'Reformer', 'Cadillac', 'Chair', 'Barrel', 'Faixa elástica', 'Bola'] },
          { key: 'frequency', label: 'Frequência (x/semana)', type: 'number' },
          { key: 'duration', label: 'Duração (minutos)', type: 'number' },
          { key: 'total_sessions', label: 'Previsão total de sessões', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'hidroterapia',
    name: 'Hidroterapia',
    emoji: '🌊',
    description: 'Avaliação pré-Hidroterapia / Fisioterapia Aquática.',
    sections: [
      {
        title: 'Queixa e Objetivo',
        fields: [
          { key: 'chief_complaint', label: 'Queixa principal', type: 'textarea' },
          { key: 'functional_objective', label: 'Objetivo funcional', type: 'textarea' }
        ]
      },
      {
        title: 'História Clínica',
        fields: [
          { key: 'current_illness', label: 'História da moléstia atual', type: 'textarea' },
          { key: 'past_history', label: 'Histórico patológico e comorbidades', type: 'textarea' },
          { key: 'medications', label: 'Medicações em uso', type: 'textarea' },
          { key: 'surgeries_exams', label: 'Cirurgias prévias e exames', type: 'textarea' }
        ]
      },
      {
        title: 'Triagem para Hidro',
        fields: [
          { key: 'clinical_indication', label: 'Indicação clínica', type: 'text' },
          { key: 'abs_contraindications', label: 'Contraindicações Absolutas', type: 'checkbox-group',
            options: ['Febre', 'Infecção ativa', 'Ferida aberta', 'Incontinência fecal', 'Instabilidade cardiorrespiratória', 'Doença infectocontagiosa'] },
          { key: 'rel_contraindications', label: 'Contraindicações Relativas', type: 'checkbox-group',
            options: ['Hipertensão descompensada', 'Labirintopatia', 'Medo de água', 'Epilepsia não controlada', 'Incontinência urinária', 'Alergia'] },
          { key: 'medical_clearance', label: 'Liberação médica?', type: 'select', options: ['Sim', 'Não'] }
        ]
      },
      {
        title: 'Exame Físico-Funcional',
        fields: [
          { key: 'bp', label: 'Pressão Arterial', type: 'text' },
          { key: 'hr', label: 'Frequência Cardíaca (bpm)', type: 'number' },
          { key: 'spo2', label: 'Saturação de O2 (%)', type: 'number' },
          painScale,
          { key: 'inspection_posture', label: 'Inspeção e postura', type: 'textarea' },
          { key: 'rom', label: 'Amplitude de movimento', type: 'textarea' },
          { key: 'strength', label: 'Força muscular', type: 'textarea' },
          { key: 'balance_gait', label: 'Equilíbrio, coordenação e marcha', type: 'textarea' }
        ]
      },
      {
        title: 'Plano Terapêutico',
        fields: [
          { key: 'therap_objectives', label: 'Objetivos terapêuticos', type: 'textarea' },
          { key: 'conduct', label: 'Conduta', type: 'checkbox-group',
            options: ['Adaptação ao meio líquido', 'Analgesia', 'Ganho de ADM', 'Fortalecimento', 'Equilíbrio', 'Marcha', 'Condicionamento', 'Relaxamento'] },
          { key: 'methods', label: 'Métodos', type: 'checkbox-group',
            options: ['Halliwick', 'Bad Ragaz', 'Watsu', 'Cinesioterapia aquática', 'Treino funcional aquático'] },
          { key: 'frequency', label: 'Frequência (x/semana)', type: 'number' },
          { key: 'duration', label: 'Duração (minutos)', type: 'number' },
          { key: 'total_sessions', label: 'Previsão total de sessões', type: 'number' }
        ]
      }
    ]
  },

  {
    id: 'rpg',
    name: 'RPG',
    emoji: '🧍',
    description: 'Reeducação Postural Global.',
    sections: [
      {
        title: 'Avaliação postural',
        fields: [
          { key: 'main_chain', label: 'Cadeia muscular predominante', type: 'select',
            options: ['Posterior', 'Anterior', 'Mista'] },
          { key: 'observed_compensations', label: 'Compensações observadas', type: 'textarea' },
          { key: 'photos_taken', label: 'Foram feitas fotos posturais?', type: 'select', options: ['Sim', 'Não'] }
        ]
      },
      {
        title: 'Posturas indicadas',
        fields: [
          { key: 'postures', label: 'Posturas selecionadas', type: 'checkbox-group',
            options: ['Rã no chão', 'Rã no ar', 'Sentado', 'Bailarina', 'Em pé contra a parede', 'Em pé inclinado'] },
          { key: 'difficulty', label: 'Dificuldade do paciente (0–10)', type: 'scale', min: 0, max: 10 },
          painScale
        ]
      },
      {
        title: 'Plano',
        fields: [
          { key: 'frequency', label: 'Frequência semanal', type: 'select', options: ['1x', '2x', '3x'] },
          { key: 'sessions_estimate', label: 'Sessões estimadas', type: 'number', min: 1, max: 60 },
          { key: 'plan_notes', label: 'Observações', type: 'textarea' }
        ]
      }
    ]
  },

  {
    id: 'ortopedia',
    name: 'Ortopédica / Traumato',
    emoji: '🦴',
    description: 'Avaliação ortopédica e traumato-ortopédica.',
    sections: [
      {
        title: 'Anamnese',
        fields: [
          { key: 'diagnosis', label: 'Diagnóstico médico', type: 'text' },
          { key: 'mechanism', label: 'Mecanismo de lesão', type: 'textarea' },
          { key: 'onset', label: 'Início dos sintomas', type: 'date' }
        ]
      },
      {
        title: 'Exame físico',
        fields: [
          painScale,
          { key: 'edema', label: 'Edema', type: 'select', options: ['Ausente', 'Leve', 'Moderado', 'Intenso'] },
          { key: 'rom_active', label: 'ADM ativa (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'rom_passive', label: 'ADM passiva (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'muscle_strength', label: 'Força muscular (0–5)', type: 'scale', min: 0, max: 5 },
          { key: 'special_tests', label: 'Testes especiais positivos', type: 'textarea' }
        ]
      },
      {
        title: 'Conduta',
        fields: [
          { key: 'techniques', label: 'Técnicas indicadas', type: 'checkbox-group',
            options: ['TENS', 'US', 'Crioterapia', 'Termoterapia', 'Mobilização articular', 'Terapia manual', 'Cinesioterapia'] },
          { key: 'plan_notes', label: 'Plano de tratamento', type: 'textarea' }
        ]
      }
    ]
  },

  {
    id: 'neurofuncional',
    name: 'Neurofuncional',
    emoji: '🧠',
    description: 'Avaliação neurológica funcional.',
    sections: [
      {
        title: 'Anamnese',
        fields: [
          { key: 'diagnosis', label: 'Diagnóstico médico', type: 'text' },
          { key: 'evolution_time', label: 'Tempo de evolução', type: 'text' },
          { key: 'medications', label: 'Medicações em uso', type: 'textarea' }
        ]
      },
      {
        title: 'Exame neurológico',
        fields: [
          { key: 'tonus', label: 'Tônus muscular', type: 'select',
            options: ['Normal', 'Hipertonia leve', 'Hipertonia moderada', 'Espasticidade', 'Hipotonia'] },
          { key: 'reflexes', label: 'Reflexos', type: 'select',
            options: ['Normoativos', 'Hiporreflexia', 'Hiperreflexia', 'Arreflexia'] },
          { key: 'coordination', label: 'Coordenação (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'balance_sit', label: 'Equilíbrio sentado (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'balance_stand', label: 'Equilíbrio em pé (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'gait', label: 'Marcha', type: 'select',
            options: ['Independente', 'Com auxílio', 'Cadeirante', 'Acamado'] }
        ]
      },
      {
        title: 'Escala funcional',
        fields: [
          { key: 'mif', label: 'Pontuação MIF (18–126)', type: 'number', min: 18, max: 126 },
          { key: 'adl', label: 'Atividades de vida diária', type: 'textarea' },
          { key: 'plan_notes', label: 'Plano de tratamento', type: 'textarea' }
        ]
      }
    ]
  },

  {
    id: 'esportiva',
    name: 'Esportiva',
    emoji: '🏃‍♀️',
    description: 'Avaliação para atletas e praticantes de esportes.',
    sections: [
      {
        title: 'Perfil esportivo',
        fields: [
          { key: 'sport', label: 'Esporte praticado', type: 'text' },
          { key: 'level', label: 'Nível', type: 'select', options: ['Recreativo', 'Amador', 'Semi-profissional', 'Profissional'] },
          { key: 'weekly_hours', label: 'Horas semanais de treino', type: 'number', min: 0, max: 60 },
          { key: 'goals', label: 'Objetivos', type: 'textarea' }
        ]
      },
      {
        title: 'Avaliação física',
        fields: [
          painScale,
          { key: 'strength', label: 'Força (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'endurance', label: 'Resistência (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'flexibility', label: 'Flexibilidade (0–10)', type: 'scale', min: 0, max: 10 },
          { key: 'proprioception', label: 'Propriocepção (0–10)', type: 'scale', min: 0, max: 10 }
        ]
      },
      {
        title: 'Plano',
        fields: [
          { key: 'return_phase', label: 'Fase de retorno ao esporte', type: 'select',
            options: ['Tratamento agudo', 'Reabilitação', 'Retorno gradual', 'Pleno desempenho'] },
          { key: 'plan_notes', label: 'Plano de treino', type: 'textarea' }
        ]
      }
    ]
  }
];

export const specialtyMap = Object.fromEntries(specialties.map((s) => [s.id, s]));
