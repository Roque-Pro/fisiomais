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
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Fisio+', M, 15);
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

function kv(doc: jsPDF, y: number, key: string, value: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(key.toUpperCase(), M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(value || '—', 210 - 2 * M);
  doc.text(lines, M, y + 5);
  return y + 5 + lines.length * 5 + 2;
}

function ensureSpace(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
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
  y = kv(doc, y, 'Nome', profile.full_name ?? '');
  y = kv(doc, y, 'CREFITO / WhatsApp', `${profile.crefito ?? '—'}  ·  ${profile.whatsapp ?? '—'}`);

  y = ensureSpace(doc, y + 2, 30);
  y = section(doc, y, 'Paciente');
  y = kv(doc, y, 'Nome', patient.full_name);
  y = kv(doc, y, 'Queixa principal', patient.chief_complaint ?? '');

  for (const sec of sp?.sections ?? []) {
    y = ensureSpace(doc, y + 2, 20);
    y = section(doc, y, sec.title);
    for (const f of sec.fields) {
      const raw = assessment.data?.[f.key];
      const v = formatFieldValue(f, raw);
      y = ensureSpace(doc, y, 14);
      y = kv(doc, y, f.label, v);
    }
  }

  if (assessment.notes) {
    y = ensureSpace(doc, y + 2, 20);
    y = section(doc, y, 'Observações da fisioterapeuta');
    y = kv(doc, y, ' ', assessment.notes);
  }

  footer(doc);
  doc.save(`avaliacao-${assessment.specialty}-${patient.full_name}.pdf`);
}

function formatFieldValue(f: Field, raw: unknown): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  if (Array.isArray(raw)) return raw.length ? raw.join(', ') : '—';
  return String(raw);
}

export function downloadEvolutionPdf(opts: { profile: Profile; patient: Patient; evolutions: Evolution[]; assessments?: Assessment[] }) {
  const { profile, patient, evolutions, assessments } = opts;
  const doc = new jsPDF();
  header(doc, 'Relatório de evolução', profile.full_name ?? '');

  let y = 32;
  y = section(doc, y, 'Paciente');
  y = kv(doc, y, 'Nome', patient.full_name);
  y = kv(doc, y, 'WhatsApp', patient.whatsapp ?? '');

  // Assessments Section
  if (assessments && assessments.length > 0) {
    y = ensureSpace(doc, y + 2, 30);
    y = section(doc, y, 'Avaliações Realizadas');
    
    for (const a of assessments) {
      const sp = specialtyMap[a.specialty];
      y = ensureSpace(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      // Removed emoji to avoid strange characters
      doc.text(`${sp?.name ?? a.specialty} - ${new Date(a.created_at).toLocaleDateString('pt-BR')}`, M, y);
      doc.setTextColor(15, 23, 42);
      y += 6;

      // Render assessment sections and fields in order
      if (sp) {
        for (const sectionObj of sp.sections) {
          // Check if this section has any filled data
          const hasData = sectionObj.fields.some(f => a.data && a.data[f.key] !== undefined && a.data[f.key] !== null && a.data[f.key] !== '');
          
          if (hasData) {
            y = ensureSpace(doc, y, 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(sectionObj.title.toUpperCase(), M, y);
            y += 4.5;

            doc.setFontSize(9);
            for (const field of sectionObj.fields) {
              const val = a.data[field.key];
              if (val !== undefined && val !== null && val !== '') {
                const v = formatFieldValue(field, val);
                
                y = ensureSpace(doc, y, 8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                const label = `${field.label}:`;
                doc.text(label, M, y);
                
                doc.setFont('helvetica', 'normal');
                const contentX = M + 55; // Increased margin to avoid overlapping
                const maxWidth = 210 - contentX - M;
                const lines = doc.splitTextToSize(v, maxWidth);
                
                doc.text(lines, contentX, y);
                y += (lines.length * 5) + 1;
              }
            }
            y += 2;
          }
        }
      } else {
        // Fallback for unknown specialty
        const dataEntries = Object.entries(a.data || {});
        for (const [key, val] of dataEntries) {
          if (val !== undefined && val !== null && val !== '') {
            y = ensureSpace(doc, y, 10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${key}:`, M, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(val), M + 55, y);
            y += 6;
          }
        }
      }
      
      if (a.notes) {
        y = ensureSpace(doc, y, 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('Observações Gerais:', M, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(a.notes, 140);
        doc.text(lines, M + 55, y);
        y += (lines.length * 5) + 2;
      }

      y += 2;
      doc.setDrawColor(240, 253, 244);
      doc.line(M, y, 210 - M, y);
      y += 8;
    }
  }

  y = ensureSpace(doc, y + 2, 20);
  y = section(doc, y, `Histórico de Sessões (${evolutions.length})`);

  for (const e of evolutions) {
    y = ensureSpace(doc, y, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Sessão #${e.session_number ?? '—'} · ${new Date(e.session_date).toLocaleDateString('pt-BR')}`, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dor: ${e.pain_level ?? '—'}/10  ·  Mobilidade: ${e.mobility_level ?? '—'}/10`, M, y + 5);
    doc.setTextColor(15, 23, 42);
    if (e.notes) {
      const lines = doc.splitTextToSize(e.notes, 210 - 2 * M);
      doc.text(lines, M, y + 11);
      y += 11 + lines.length * 4.5 + 4;
    } else {
      y += 13;
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y - 2, 210 - M, y - 2);
  }

  footer(doc);
  doc.save(`evolucao-${patient.full_name}.pdf`);
}

async function getRoundedImageData(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = URL.createObjectURL(blob);
    });

    const canvas = document.createElement('canvas');
    const size = Math.min(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
    
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Error rounding image:', e);
    return null;
  }
}

async function getLogoImageData(): Promise<string | null> {
  try {
    const res = await fetch('/logo.svg');
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 200;
        canvas.height = img.height || 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch {
    return null;
  }
}

export async function downloadDigitalCardPdf(profile: Profile & { theme?: { primary?: string } }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 55] });
  const emerald500 = '#10b981';
  const emerald900 = '#064e3b';
  const slate500 = '#64748b';
  const slate800 = '#1e293b';

  // 1. Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 90, 55, 'F');
  
  // Subtle top bar
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.rect(0, 0, 90, 15, 'F');
  doc.setFillColor(emerald500);
  doc.rect(0, 14.5, 90, 0.5, 'F');

  // 2. Photo (Circular)
  const px = 15, py = 18, pr = 10;
  if (profile.photo_url) {
    const data = await getRoundedImageData(profile.photo_url);
    if (data) {
      try {
        doc.addImage(data, 'PNG', px - pr, py - pr, pr * 2, pr * 2, undefined, 'FAST');
        doc.setDrawColor(emerald500);
        doc.setLineWidth(0.3);
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

  // 3. Name and Title
  doc.setTextColor(emerald900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(profile.full_name ?? 'Fisioterapeuta', 30, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate500);
  doc.text(`CREFITO: ${profile.crefito ?? '—'}`, 30, 13);

  // 4. Specialties
  let sy = 22;
  if (profile.specialties?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(emerald500);
    const specs = profile.specialties.join('  •  ');
    const specLines = doc.splitTextToSize(specs, 55);
    doc.text(specLines, 30, sy);
    sy += (specLines.length * 4);
  }

  // 5. Bio
  if (profile.bio) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(slate800);
    const bioLines = doc.splitTextToSize(profile.bio, 55);
    doc.text(bioLines, 30, sy + 2);
  }

  // 6. Contact Info
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 42, 90, 13, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 42, 90, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate800);
  
  let cy = 46.5;
  if (profile.whatsapp) {
    doc.setFont('helvetica', 'bold');
    doc.text(`WhatsApp: ${profile.whatsapp}`, 6, cy);
    doc.setFont('helvetica', 'normal');
  }
  if (profile.email) {
    doc.text(`E-mail: ${profile.email}`, 6, cy + 4);
  }
  
  if (profile.workplace || profile.city) {
    const loc = [profile.workplace, profile.city].filter(Boolean).join(', ');
    const locLines = doc.splitTextToSize(loc, 40);
    doc.text(locLines, 50, cy);
  }

  // 7. Official Logo
  const logoData = await getLogoImageData();
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 78, 44, 8, 10, undefined, 'FAST');
    } catch (e) {
      console.error('Logo render error:', e);
    }
  }

  doc.setFontSize(5);
  doc.setTextColor(emerald500);
  doc.text('Fisio+', 82, 53, { align: 'center' });

  doc.save(`cartao-${(profile.full_name ?? 'fisio').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
