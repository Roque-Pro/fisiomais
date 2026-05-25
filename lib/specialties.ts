export type AssessmentScale = {
  name: string;
  min: number;
  max: number;
  step?: number;
  labels?: Record<number, string>;
};

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'scale' | 'dynamic-scale' | 'checkbox-group' | 'date';

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  scales?: AssessmentScale[];
  min?: number;
  max?: number;
  placeholder?: string;
  help?: string;
  category?: 'Dor' | 'Força' | 'Mobilidade' | 'Equilíbrio' | 'Marcha' | 'Funcionalidade' | 'Postura' | 'Resistência' | 'Neurológico' | 'Esportivo' | 'Flexibilidade' | 'Estabilidade' | 'Outros';
};

export type Section = { title: string; fields: Field[] };

export type Specialty = {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  description: string;
  sections: Section[];
};

// --- BANCO DE ESCALAS (Scale Bank) ---

export const scaleBank: Record<string, Field> = {
  pain: {
    key: 'pain_scale', 
    label: 'Escala de Dor', 
    type: 'dynamic-scale',
    category: 'Dor',
    scales: [
      { name: 'EVA (0–10)', min: 0, max: 10, labels: { 0: 'Sem dor', 2: 'Leve', 5: 'Moderada', 8: 'Intensa', 10: 'Insuportável' } },
      { name: 'Escala Numérica (0-10)', min: 0, max: 10 },
      { name: 'Faces (0–5)', min: 0, max: 5, labels: { 0: 'Sem dor', 5: 'Máxima dor' } }
    ]
  },
  strength: {
    key: 'muscle_strength',
    label: 'Força Muscular (Oxford/MRC)',
    type: 'dynamic-scale',
    category: 'Força',
    scales: [
      { name: 'Escala 0–5', min: 0, max: 5, labels: { 0: 'Sem contração', 1: 'Esboço', 2: 'Sem gravidade', 3: 'Contra gravidade', 4: 'Resistência', 5: 'Normal' } }
    ]
  },
  borg: {
    key: 'borg_scale',
    label: 'Escala de Borg (Esforço)',
    type: 'dynamic-scale',
    category: 'Resistência',
    scales: [
      { name: 'Borg Modificada (0–10)', min: 0, max: 10, labels: { 0: 'Repouso', 3: 'Moderado', 5: 'Forte', 10: 'Máximo' } },
      { name: 'Borg Tradicional (6–20)', min: 6, max: 20 }
    ]
  },
  goniometry: {
    key: 'goniometry',
    label: 'Goniometria (ADM)',
    type: 'textarea',
    category: 'Mobilidade',
    placeholder: 'Registre as amplitudes (Ex: Ombro D, Flexão 160°)...'
  },
  balance: {
    key: 'balance_scale',
    label: 'Equilíbrio',
    type: 'dynamic-scale',
    category: 'Equilíbrio',
    scales: [
      { name: 'Escala de Berg (0–56)', min: 0, max: 56 },
      { name: 'TUG (segundos)', min: 0, max: 60 }
    ]
  },
  functionalOrtho: {
    key: 'ortho_functional',
    label: 'Escalas Funcionais Ortopédicas',
    type: 'dynamic-scale',
    category: 'Funcionalidade',
    scales: [
      { name: 'Lysholm (Joelho)', min: 0, max: 100 },
      { name: 'IKDC (Joelho)', min: 0, max: 100 },
      { name: 'WOMAC (Quadril/Joelho)', min: 0, max: 96 },
      { name: 'DASH (Membro Superior)', min: 0, max: 100 },
      { name: 'SPADI (Ombro)', min: 0, max: 100 },
      { name: 'Oswestry (Lombar)', min: 0, max: 50 },
      { name: 'Roland Morris (Lombar)', min: 0, max: 24 },
      { name: 'Harris Hip Score (Quadril)', min: 0, max: 100 }
    ]
  },
  functionalNeuro: {
    key: 'neuro_functional',
    label: 'Escalas de Funcionalidade Neurológica',
    type: 'dynamic-scale',
    category: 'Funcionalidade',
    scales: [
      { name: 'Índice de Barthel (AVDs)', min: 0, max: 100 },
      { name: 'MIF (18–126)', min: 18, max: 126 },
      { name: 'Escala de Katz', min: 0, max: 6 }
    ]
  }
};

// --- Common Sections ---

const commonSections: Section[] = [];

const clinicalHistorySection: Section = {
  title: 'História Clínica',
  fields: [
    { key: 'current_illness', label: 'História da moléstia atual', type: 'textarea' },
    { key: 'past_history', label: 'Histórico patológico e comorbidades', type: 'textarea' },
    { key: 'medications', label: 'Medicações em uso', type: 'textarea' },
    { key: 'surgeries_exams', label: 'Cirurgias prévias e exames', type: 'textarea' }
  ]
};

// --- Specialties Definitions ---

export const specialties: Specialty[] = [
  {
    id: 'pilates',
    name: 'Pilates',
    emoji: '🧘‍♀️',
    iconName: 'Flower2',
    description: 'Foco em postura, core, flexibilidade e controle motor.',
    sections: [
      ...commonSections,
      clinicalHistorySection,
      {
        title: 'Exame Físico e Postural',
        fields: [
          { key: 'static_posture', label: 'Avaliação Postural Estática', type: 'textarea', category: 'Postura' },
          { key: 'biophotogrammetry', label: 'Biofotogrametria (Ângulos/Fotos)', type: 'textarea', category: 'Postura' },
          scaleBank.goniometry,
          { key: 'wells_test', label: 'Banco de Wells (cm)', type: 'number', category: 'Flexibilidade' },
          { key: 'sit_reach', label: 'Sit and Reach Test', type: 'text', category: 'Flexibilidade' },
          scaleBank.pain
        ]
      },
      {
        title: 'Core e Estabilidade',
        fields: [
          { key: 'plank_test', label: 'Teste de Prancha (tempo)', type: 'number', category: 'Estabilidade', help: 'Tempo em segundos' },
          { key: 'lumbar_endurance', label: 'Endurance Lombar', type: 'text', category: 'Estabilidade' },
          { key: 'bridge_test', label: 'Teste de Ponte', type: 'text', category: 'Estabilidade' },
          { key: 'motor_control', label: 'Controle Motor', type: 'textarea', category: 'Outros' },
          { key: 'breathing', label: 'Padrão Respiratório', type: 'text', category: 'Resistência' }
        ]
      },
      {
        title: 'Funcionalidade',
        fields: [
          {
            key: 'disability_index',
            label: 'Índice de Incapacidade',
            type: 'dynamic-scale',
            category: 'Funcionalidade',
            scales: [
              { name: 'Oswestry (Lombalgia)', min: 0, max: 50 },
              { name: 'Roland Morris', min: 0, max: 24 }
            ]
          }
        ]
      },
      {
        title: 'Plano e Conduta',
        fields: [
          { key: 'conduct', label: 'Conduta Selecionada', type: 'checkbox-group',
            options: ['Controle motor', 'Estabilização', 'Flexibilidade', 'Fortalecimento', 'Mobilidade', 'Coordenação', 'Equilíbrio', 'Respiração', 'Consciência corporal'] },
          { key: 'resources', label: 'Recursos', type: 'checkbox-group',
            options: ['Solo', 'Reformer', 'Cadillac', 'Chair', 'Barrel', 'Faixa elástica', 'Bola'] },
          { key: 'frequency', label: 'Frequência (x/semana)', type: 'number' },
          { key: 'total_sessions', label: 'Previsão total de sessões', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'hidroterapia',
    name: 'Hidroterapia',
    emoji: '🌊',
    iconName: 'Waves',
    description: 'Fisioterapia Aquática para reabilitação e condicionamento.',
    sections: [
      ...commonSections,
      clinicalHistorySection,
      {
        title: 'Equilíbrio e Marcha',
        fields: [
          scaleBank.balance,
          { key: 'walk_6min', label: 'Teste de Caminhada (6 min)', type: 'number', category: 'Marcha', help: 'Distância em metros' },
          { key: 'gait_speed', label: 'Velocidade da Marcha', type: 'text', category: 'Marcha' },
          scaleBank.pain
        ]
      },
      {
        title: 'Condicionamento e Funcionalidade',
        fields: [
          { key: 'hr_max', label: 'FC Máxima (220-idade)', type: 'number', category: 'Resistência', help: 'Cálculo automático recomendado' },
          { key: 'spo2', label: 'Saturação de O2 (%)', type: 'number', category: 'Resistência' },
          scaleBank.borg,
          scaleBank.functionalNeuro
        ]
      },
      {
        title: 'Plano Terapêutico',
        fields: [
          { key: 'conduct', label: 'Conduta', type: 'checkbox-group',
            options: ['Adaptação ao meio líquido', 'Analgesia', 'Ganho de ADM', 'Fortalecimento', 'Equilíbrio', 'Marcha', 'Condicionamento', 'Relaxamento'] },
          { key: 'methods', label: 'Métodos', type: 'checkbox-group',
            options: ['Halliwick', 'Bad Ragaz', 'Watsu', 'Cinesioterapia aquática', 'Treino funcional aquático'] },
          { key: 'frequency', label: 'Frequência (x/semana)', type: 'number' }
        ]
      }
    ]
  },
  {
    id: 'rpg',
    name: 'RPG',
    emoji: '🧍',
    iconName: 'Accessibility',
    description: 'Reeducação Postural Global e Cadeias Musculares.',
    sections: [
      ...commonSections,
      {
        title: 'Avaliação Postural e Cadeias',
        fields: [
          { key: 'main_chains', label: 'Cadeias predominantes', type: 'checkbox-group',
            options: ['Posterior', 'Anterior', 'Inspiratória', 'Antero-interna de quadril', 'Antero-interna de ombro'] },
          { key: 'assymmetries', label: 'Assimetrias e Simetria corporal', type: 'textarea', category: 'Postura' },
          { key: 'scoliosis_eval', label: 'Avaliação de Escoliose', type: 'text', category: 'Postura' },
          { key: 'biophotogrammetry', label: 'Biofotogrametria', type: 'text', category: 'Postura' },
          { key: 'retractions', label: 'Retrações', type: 'textarea', category: 'Postura' }
        ]
      },
      {
        title: 'Flexibilidade e Mobilidade',
        fields: [
          { key: 'finger_floor', label: 'Distância dedo-chão (cm)', type: 'number', category: 'Flexibilidade' },
          { key: 'wells_test', label: 'Banco de Wells (cm)', type: 'number', category: 'Flexibilidade' },
          scaleBank.goniometry,
          scaleBank.pain
        ]
      },
      {
        title: 'Funcionalidade e Respiratório',
        fields: [
          {
            key: 'disability_index',
            label: 'Índice de Incapacidade',
            type: 'dynamic-scale',
            category: 'Funcionalidade',
            scales: [
              { name: 'Roland Morris', min: 0, max: 24 },
              { name: 'Oswestry', min: 0, max: 50 }
            ]
          },
          { key: 'thoracic_perimeter', label: 'Perimetria Torácica', type: 'text', category: 'Resistência' },
          { key: 'resp_capacity', label: 'Capacidade Respiratória', type: 'text', category: 'Resistência' }
        ]
      }
    ]
  },
  {
    id: 'ortopedia',
    name: 'Fisioterapia Traumato-Ortopédica',
    emoji: '🦴',
    iconName: 'Bone',
    description: 'Traumato-Ortopedia com foco em ADM, força e testes.',
    sections: [
      ...commonSections,
      {
        title: 'Exame Físico e Dor',
        fields: [
          scaleBank.pain,
          { key: 'mcgill', label: 'Questionário McGill', type: 'textarea', category: 'Dor' },
          scaleBank.goniometry,
          scaleBank.strength,
          { key: 'edema_perimeter', label: 'Edema (Perimetria)', type: 'textarea', category: 'Outros' },
          { key: 'special_tests', label: 'Testes Especiais Positivos', type: 'textarea' }
        ]
      },
      {
        title: 'Funcionalidade, Equilíbrio e Marcha',
        fields: [
          scaleBank.functionalOrtho,
          scaleBank.balance,
          { key: 'walk_6min', label: 'Caminhada 6 min (m)', type: 'number', category: 'Marcha' }
        ]
      },
      {
        title: 'Conduta',
        fields: [
          { key: 'techniques', label: 'Técnicas indicadas', type: 'checkbox-group',
            options: ['TENS', 'US', 'Crioterapia', 'Termoterapia', 'Mobilização articular', 'Terapia manual', 'Cinesioterapia', 'Fortalecimento'] },
          { key: 'plan_notes', label: 'Plano de tratamento', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 'neurofuncional',
    name: 'Fisioterapia Neurofuncional',
    emoji: '🧠',
    iconName: 'Brain',
    description: 'Reabilitação neurológica (AVC, Parkinson, Pediatria).',
    sections: [
      ...commonSections,
      clinicalHistorySection,
      {
        title: 'Exame Neurológico',
        fields: [
          {
            key: 'ashworth',
            label: 'Tônus (Ashworth Modificada)',
            type: 'dynamic-scale',
            category: 'Neurológico',
            scales: [{ name: 'Ashworth (0–4)', min: 0, max: 4, labels: { 0: 'Normal', 4: 'Rígido' } }]
          },
          { key: 'coord_finger_nose', label: 'Coordenação: Finger-to-nose', type: 'text', category: 'Neurológico' },
          { key: 'coord_heel_shin', label: 'Coordenação: Heel-to-shin', type: 'text', category: 'Neurológico' },
          { key: 'motor_control_fugl', label: 'Controle Motor (Fugl-Meyer)', type: 'text', category: 'Neurológico' },
          { key: 'cognition_meem', label: 'Cognição (MEEM)', type: 'number', min: 0, max: 30, category: 'Neurológico' },
          { key: 'reflexes', label: 'Reflexos', type: 'select', options: ['Normoativos', 'Hiporreflexia', 'Hiperreflexia', 'Arreflexia'] }
        ]
      },
      {
        title: 'Equilíbrio e Marcha',
        fields: [
          scaleBank.balance,
          { key: 'dgi_index', label: 'Dynamic Gait Index', type: 'text', category: 'Marcha' },
          { key: 'freezing_gait', label: 'Freezing of Gait (Parkinson)', type: 'text', category: 'Marcha' }
        ]
      },
      {
        title: 'Escalas de Funcionalidade e Específicas',
        fields: [
          scaleBank.functionalNeuro,
          {
            key: 'pathology_specific',
            label: 'Selecione a Escala por Patologia',
            type: 'dynamic-scale',
            category: 'Neurológico',
            scales: [
              { name: 'UPDRS (Parkinson)', min: 0, max: 199 },
              { name: 'Hoehn & Yahr (Parkinson)', min: 1, max: 5 },
              { name: 'GMFM (Pediatria)', min: 0, max: 100 },
              { name: 'Denver II (Pediatria)', min: 0, max: 100 },
              { name: 'GMFCS (Paralisia Cerebral)', min: 1, max: 5 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'esportiva',
    name: 'Fisioterapia Esportiva',
    emoji: '🏃‍♀️',
    iconName: 'Trophy',
    description: 'Performance, retorno ao esporte e risco de lesão.',
    sections: [
      ...commonSections,
      {
        title: 'Perfil e Performance',
        fields: [
          { key: 'sport', label: 'Esporte praticado', type: 'text' },
          scaleBank.pain,
          { key: 'dynamometry', label: 'Dinamometria', type: 'text', category: 'Força' },
          scaleBank.strength,
          scaleBank.goniometry,
          { key: 'wells_flex', label: 'Flexibilidade (Wells)', type: 'number', category: 'Flexibilidade' }
        ]
      },
      {
        title: 'Potência, Agilidade e Resistência',
        fields: [
          { key: 'vertical_jump', label: 'Salto Vertical', type: 'text', category: 'Esportivo' },
          { key: 'hop_tests', label: 'Hop Tests', type: 'text', category: 'Esportivo' },
          { key: 'yo_yo_cooper', label: 'Yo-Yo Test / Cooper', type: 'text', category: 'Esportivo' },
          { key: 'agility_tests', label: 'Agilidade (Illinois / Shuttle Run)', type: 'text', category: 'Esportivo' },
          scaleBank.borg,
          { key: 'y_balance', label: 'Y Balance Test', type: 'text', category: 'Equilíbrio' },
          { key: 'vo2_max', label: 'Estimativa VO2 Max', type: 'text', category: 'Resistência', help: '44.73 * dist - 504.9' }
        ]
      },
      {
        title: 'Retorno Esportivo',
        fields: [
          {
            key: 'return_scales',
            label: 'Escalas de Retorno',
            type: 'dynamic-scale',
            category: 'Funcionalidade',
            scales: [
              { name: 'IKDC (Joelho)', min: 0, max: 100 },
              { name: 'LEFS (Membro Inferior)', min: 0, max: 80 }
            ]
          },
          { key: 'injury_risk', label: 'Risco de Lesão / Observações', type: 'textarea' }
        ]
      }
    ]
  }
];

export const specialtyMap = Object.fromEntries(specialties.map((s) => [s.id, s]));
