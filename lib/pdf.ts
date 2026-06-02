'use client';

import jsPDF from 'jspdf';
import { specialtyMap, type Field } from '@/lib/specialties';

type Profile = {
  full_name?: string | null;
  crefito?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  workplace?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  specialties?: string[] | null;
};

type Patient = {
  full_name: string;
  birthdate?: string | null;
  gender?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  chief_complaint?: string | null;
  functional_objective?: string | null;
  objective_assessment?: string | null;
  medical_history?: string | null;
  medications?: string | null;
};

type Evolution = {
  session_number?: number | null;
  session_date: string;
  pain_level?: number | null;
  mobility_level?: number | null;
  notes?: string | null;
};

type Assessment = {
  specialty: string;
  data: Record<string, unknown>;
  notes?: string | null;
  created_at: string;
};

const M = 15;

function header(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, 210, 24, 'F');
  
  // Add Logo
  try {
    doc.addImage('/logo.jpg', 'JPEG', M, 4, 16, 16);
  } catch (e) {
    console.error('Error adding logo to PDF:', e);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Fisio+', M + 18, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(title, 210 - M, 15, { align: 'right' });
  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, 210 - M, 20, { align: 'right' });
  }
  doc.setTextColor(15, 23, 42);
}

function footer(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} · Fisio+`, M, 290);
    doc.text(`Página ${i}/${total}`, 210 - M, 290, { align: 'right' });
    doc.setTextColor(15, 23, 42);
  }
}

function section(doc: jsPDF, y: number, label: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(label, M, y);
  doc.setDrawColor(209, 250, 229); // Emerald 100
  doc.line(M, y + 1.5, 210 - M, y + 1.5);
  doc.setTextColor(15, 23, 42);
  return y + 7;
}

function kv(doc: jsPDF, y: number, key: string, value: string, category?: string): number {
  if (value === '—') return y; 

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(key.toUpperCase(), M, y);

  if (category) {
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`[${category.toUpperCase()}]`, 210 - M, y, { align: 'right' });
  }
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(value, 210 - 2 * M);
  doc.text(lines, M, y + 4.5);
  return y + 4.5 + lines.length * 5 + 1.5;
}

function ensureSpace(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 275) {
    doc.addPage();
    return 30;
  }
  return y;
}

export function downloadAssessmentPdf(opts: { profile: Profile; patient: Patient; assessment: Assessment }) {
  const { profile, patient, assessment } = opts;
  const sp = specialtyMap[assessment.specialty];
  const doc = new jsPDF();
  header(doc, `Avaliação · ${sp?.name ?? assessment.specialty}`, profile.full_name ?? '');

  let y = 32;
  y = section(doc, y, 'Profissional');
  y = kv(doc, y, 'Nome', profile.full_name ?? '—');
  y = kv(doc, y, 'CREFITO / WhatsApp', `${profile.crefito ?? '—'}  ·  ${profile.whatsapp ?? '—'}`);

  y = ensureSpace(doc, y + 5, 30);
  y = section(doc, y, 'Paciente');
  y = kv(doc, y, 'Nome', patient.full_name);
  y = kv(doc, y, 'Queixa principal', patient.chief_complaint ?? '—');
  y = kv(doc, y, 'Objetivo funcional', patient.functional_objective ?? '—');
  y = kv(doc, y, 'Avaliação objetiva', patient.objective_assessment ?? '—');

  for (const sec of sp?.sections ?? []) {
    // Check if section has data
    const hasData = sec.fields.some(f => assessment.data?.[f.key] !== undefined && assessment.data?.[f.key] !== null && assessment.data?.[f.key] !== '');
    if (!hasData) continue;

    y = ensureSpace(doc, y + 5, 25);
    y = section(doc, y, sec.title);
    for (const f of sec.fields) {
      const raw = assessment.data?.[f.key];
      if (raw === undefined || raw === null || raw === '') continue;
      
      const v = formatFieldValue(f, raw);
      y = ensureSpace(doc, y, 14);
      y = kv(doc, y, f.label, v, f.category);
    }
  }

  if (assessment.notes) {
    y = ensureSpace(doc, y + 5, 25);
    y = section(doc, y, 'Observações da fisioterapeuta');
    y = kv(doc, y, ' ', assessment.notes);
  }

  footer(doc);
  doc.save(`avaliacao-${assessment.specialty}-${patient.full_name}.pdf`);
}

function formatFieldValue(f: Field, raw: unknown): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  
  if (f.type === 'dynamic-scale' && typeof raw === 'object' && raw !== null) {
    const data = raw as { scale: string; value: number };
    const scale = f.scales?.find(s => s.name === data.scale);
    const label = scale?.labels?.[data.value];
    return `${data.scale}: ${data.value}${label ? ` (${label})` : ''}`;
  }

  if (Array.isArray(raw)) return raw.length ? raw.join(', ') : '—';
  return String(raw);
}

export function downloadEvolutionPdf(opts: { profile: Profile; patient: Patient; evolutions: Evolution[]; assessments?: Assessment[] }) {
  const { profile, patient, evolutions, assessments } = opts;
  const doc = new jsPDF();
  header(doc, 'Relatório de Evolução do Paciente', profile.full_name ?? '');

  let y = 32;
  y = section(doc, y, 'Identificação do Paciente');
  y = kv(doc, y, 'Nome', patient.full_name);
  y = kv(doc, y, 'WhatsApp', patient.whatsapp ?? '—');
  y = kv(doc, y, 'Queixa Principal', patient.chief_complaint ?? '—');

  // Assessments Section
  if (assessments && assessments.length > 0) {
    y = ensureSpace(doc, y + 5, 30);
    y = section(doc, y, 'Avaliações Realizadas');
    
    for (const a of assessments) {
      const sp = specialtyMap[a.specialty];
      y = ensureSpace(doc, y + 2, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text(`${sp?.name ?? a.specialty} — ${new Date(a.created_at).toLocaleDateString('pt-BR')}`, M, y);
      doc.setTextColor(15, 23, 42);
      y += 6;

      if (sp) {
        for (const sectionObj of sp.sections) {
          const hasData = sectionObj.fields.some(f => a.data && a.data[f.key] !== undefined && a.data[f.key] !== null && a.data[f.key] !== '');
          if (!hasData) continue;

          y = ensureSpace(doc, y, 12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(sectionObj.title.toUpperCase(), M, y);
          y += 4.5;

          for (const field of sectionObj.fields) {
            const val = a.data[field.key];
            if (val === undefined || val === null || val === '') continue;
            
            const v = formatFieldValue(field, val);
            y = ensureSpace(doc, y, 12);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const label = field.label.toUpperCase();
            doc.text(label, M, y);

            if (field.category) {
              doc.setFontSize(7);
              doc.setTextColor(148, 163, 184);
              doc.text(`[${field.category.toUpperCase()}]`, 210 - M, y, { align: 'right' });
            }
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            const lines = doc.splitTextToSize(v, 210 - 2 * M);
            doc.text(lines, M, y + 4.5);
            y += (lines.length * 5) + 6.5;
          }
          y += 2;
        }
      }

      if (a.notes) {
        y = ensureSpace(doc, y, 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        doc.text('Observações:', M, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(a.notes, 210 - M - (M + 45));
        doc.text(lines, M + 45, y);
        y += (lines.length * 5) + 2;
      }

      y += 4;
      doc.setDrawColor(240, 253, 244);
      doc.line(M, y, 210 - M, y);
      y += 8;
    }
  }

  y = ensureSpace(doc, y + 5, 20);
  y = section(doc, y, `Histórico de Evolução (${evolutions.length} sessões)`);

  for (const e of evolutions) {
    y = ensureSpace(doc, y, 30);
    doc.setFillColor(248, 250, 252);
    doc.rect(M, y - 1, 210 - 2 * M, 7, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Sessão #${e.session_number ?? '—'} · ${new Date(e.session_date).toLocaleDateString('pt-BR')}`, M + 2, y + 4);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dor: ${e.pain_level ?? '—'}/10  ·  Mobilidade: ${e.mobility_level ?? '—'}/10`, 210 - M - 2, y + 4, { align: 'right' });
    
    y += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    if (e.notes) {
      const lines = doc.splitTextToSize(e.notes, 210 - 2 * M - 4);
      doc.text(lines, M + 2, y);
      y += lines.length * 5 + 6;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('Sem anotações nesta sessão.', M + 2, y);
      y += 10;
    }
    
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y - 4, 210 - M, y - 4);
  }

  footer(doc);
  doc.save(`evolucao-${patient.full_name}.pdf`);
}

async function getRoundedImageData(url: string, bgColor: string = '#ffffff'): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Failed to fetch image');
    const blob = await res.blob();
    
    return await new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }

        // Fundo combinando com a cor da seção no PDF para esconder os cantos do quadrado
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Desenhar círculo com anti-aliasing melhorado
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Desenhar a imagem centralizada
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        ctx.restore();
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  } catch (e) {
    console.error('Error rounding image:', e);
    return null;
  }
}

async function getLogoImageData(bgColor: string = '#ffffff'): Promise<string | null> {
  try {
    const res = await fetch('/fisio.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    
    return await new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);

          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2, img.width, img.height);
          ctx.restore();

          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  } catch {
    return null;
  }
}

export async function downloadDigitalCardPdf(profile: Profile & { theme?: { primary?: string } }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 55] });
  const emerald50 = '#f0fdf4'; // A cor exata da faixa lateral
  const emerald500 = '#10b981';
  const emerald600 = '#059669';
  const emerald900 = '#064e3b';
  const slate400 = '#94a3b8';
  const slate600 = '#475569';
  const slate800 = '#1e293b';

  // 1. Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 90, 55, 'F');
  
  // Faixa lateral esquerda
  doc.setFillColor(emerald50);
  doc.rect(0, 0, 25, 55, 'F');
  
  doc.setDrawColor(209, 250, 229);
  doc.setLineWidth(0.5);
  doc.line(25, 0, 25, 55);

  // 2. Photo (Circular)
  const px = 12.5, py = 18, pr = 9;
  if (profile.photo_url) {
    const data = await getRoundedImageData(profile.photo_url, emerald50);
    if (data) {
      try {
        doc.addImage(data, 'JPEG', px - pr, py - pr, pr * 2, pr * 2, undefined, 'FAST');
        
        doc.setDrawColor(emerald500);
        doc.setLineWidth(0.2);
        doc.circle(px, py, pr, 'S');
      } catch (e) {
        doc.setFillColor(emerald500);
        doc.circle(px, py, pr, 'F');
      }
    }
  } else {
    doc.setFillColor(emerald500);
    doc.circle(px, py, pr, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text((profile.full_name?.[0] ?? 'F').toUpperCase(), px, py + 2, { align: 'center' });
  }

  // 3. Official Logo (fisio.png) - Aumentado
  const logoData = await getLogoImageData(emerald50);
  if (logoData) {
    try {
      doc.addImage(logoData, 'JPEG', px - 7.5, 35, 15, 15, undefined, 'FAST');
    } catch (e) {
      console.error('Logo render error:', e);
    }
  }
  doc.setFontSize(6);
  doc.setTextColor(emerald500);
  doc.setFont('helvetica', 'bold');
  doc.text('FISIO+', px, 51, { align: 'center' });

  // 4. Name and Professional Info
  doc.setTextColor(emerald900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(profile.full_name ?? 'Fisioterapeuta', 30, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(emerald600);
  doc.text(`CREFITO: ${profile.crefito ?? '—'}`, 30, 16);

  // Divisor horizontal sutil
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.line(30, 18, 85, 18);

  // 5. Specialties
  let sy = 23;
  if (profile.specialties?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(slate800);
    const specs = profile.specialties.join('  •  ');
    const specLines = doc.splitTextToSize(specs, 55);
    doc.text(specLines, 30, sy);
    sy += (specLines.length * 4);
  }

  // 6. Bio
  if (profile.bio) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(slate600);
    const bioLines = doc.splitTextToSize(profile.bio, 55);
    doc.text(bioLines, 30, sy + 1);
  }

  // 7. Contact Info Footer Card - Agora vertical para evitar sobreposição
  const hasLocation = !!(profile.workplace || profile.city);
  const footerHeight = hasLocation ? 15 : 11;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(28, 39, 58, footerHeight, 2, 2, 'F');
  
  let currentY = 43;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(slate800);
  
  if (profile.whatsapp) {
    doc.text(`WhatsApp: ${profile.whatsapp}`, 32, currentY);
    currentY += 4;
  }
  
  if (profile.email) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`E-mail: ${profile.email}`, 32, currentY);
    currentY += 3.5;
  }
  
  if (hasLocation) {
    const loc = [profile.workplace, profile.city].filter(Boolean).join(', ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(slate600);
    const locLines = doc.splitTextToSize(loc, 50);
    doc.text(locLines, 32, currentY);
  }

  const fileName = `cartao-${(profile.full_name ?? 'fisio').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  
  if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    return {
      blob: doc.output('blob'),
      fileName,
      save: () => doc.save(fileName)
    };
  }

  doc.save(fileName);
  return { fileName, save: () => doc.save(fileName) };
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
