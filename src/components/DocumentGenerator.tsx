import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Eraser, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

const LOGO_URL = '/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png';

let cachedLogo: string | null = null;
let cachedLogoRatio: number = 1; // width / height
const loadLogoDataUrl = async (): Promise<string | null> => {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogo = reader.result as string;
        resolve(cachedLogo);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    // Determine native aspect ratio so the logo isn't stretched in the PDF
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width && img.height) cachedLogoRatio = img.width / img.height;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
    return dataUrl;
  } catch {
    return null;
  }
};
const getLogoRatio = () => cachedLogoRatio || 1;

// Convert a number (integer euros) to Spanish words (uppercase). Supports up to millions.
const numberToSpanishWords = (n: number): string => {
  if (!isFinite(n) || n < 0) return '';
  if (n === 0) return 'CERO';
  const ones = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
    'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
    'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS',
    'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const tens = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  const under1000 = (num: number): string => {
    if (num === 100) return 'CIEN';
    const h = Math.floor(num / 100);
    const rest = num % 100;
    let out = '';
    if (h > 0) out += hundreds[h];
    if (rest > 0) {
      if (out) out += ' ';
      if (rest < 30) out += ones[rest];
      else {
        const t = Math.floor(rest / 10);
        const u = rest % 10;
        out += tens[t] + (u > 0 ? ' Y ' + ones[u] : '');
      }
    }
    return out;
  };
  const num = Math.floor(n);
  if (num < 1000) return under1000(num);
  if (num < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    const thouTxt = thousands === 1 ? 'MIL' : under1000(thousands).replace(/\bUNO\b$/, 'UN') + ' MIL';
    return thouTxt + (rest > 0 ? ' ' + under1000(rest) : '');
  }
  const millions = Math.floor(num / 1_000_000);
  const rest = num % 1_000_000;
  const milTxt = millions === 1 ? 'UN MILLÓN' : under1000(millions) + ' MILLONES';
  return milTxt + (rest > 0 ? ' ' + numberToSpanishWords(rest) : '');
};

const formatEuros = (raw: string): { letters: string; figures: string } => {
  const n = Number(raw);
  if (!raw || !isFinite(n) || n <= 0) return { letters: '', figures: '' };
  const intPart = Math.floor(n);
  const cents = Math.round((n - intPart) * 100);
  const figures = `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  let letters = `${numberToSpanishWords(intPart)} EUROS`;
  if (cents > 0) letters += ` CON ${numberToSpanishWords(cents)} CÉNTIMOS`;
  return { letters, figures };
};

const formatDateEs = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

type DocKind = 'consent' | 'reservation';

const SignaturePad = ({ label, onChange }: { label: string; onChange: (d: string | null) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastRef.current = getPos(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current!.x, lastRef.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange(canvasRef.current!.toDataURL('image/png'));
  };
  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border rounded-md bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full h-40 touch-none rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <Button type="button" size="sm" variant="outline" onClick={clear}>
        <Eraser className="w-3 h-3 mr-1" /> Borrar firma
      </Button>
    </div>
  );
};

const todayParts = () => {
  const d = new Date();
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('es-ES', { month: 'long' }),
    year: String(d.getFullYear()),
  };
};

const DocumentGenerator = () => {
  const { toast } = useToast();
  const [kind, setKind] = useState<DocKind>('consent');

  // Consent fields (matching [brackets] in the template)
  const t0 = todayParts();
  const [propAddress, setPropAddress] = useState('');
  const [propPostalCode, setPropPostalCode] = useState('');
  const [propMunicipality, setPropMunicipality] = useState('');
  const [propProvince, setPropProvince] = useState('');
  const [signProvince, setSignProvince] = useState('');
  const [day, setDay] = useState(t0.day);
  const [month, setMonth] = useState(t0.month);
  const [year, setYear] = useState(t0.year);
  const [signature, setSignature] = useState<string | null>(null);

  // Reservation: rental receipt fields (RECIBO DE RESERVA DE ALQUILER)
  const [tenants, setTenants] = useState<Array<{ name: string; dni: string }>>([
    { name: '', dni: '' },
  ]);
  const [reservationAmountNum, setReservationAmountNum] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [contractSignDate, setContractSignDate] = useState('');
  const [depositAmountNum, setDepositAmountNum] = useState('');
  const [feesText, setFeesText] = useState('1 MENSUALIDAD + 21% I.V.A');
  const [monthlyRentNum, setMonthlyRentNum] = useState('');
  // Consent: parties (interesado / avalista)
  const [interestedName, setInterestedName] = useState('');
  const [interestedDni, setInterestedDni] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorDni, setGuarantorDni] = useState('');

  const drawBackground = (doc: jsPDF, logo: string | null) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Soft warm paper background
    doc.setFillColor(253, 251, 247);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Vertical pale Spanish flag stripes on BOTH side edges (red - yellow - red)
    // Red stripes use the same width as the yellow stripe.
    const drawSideFlag = (xLeft: number) => {
      const stripeW = 1.6;
      const gap = 0.6;
      // outer red
      doc.setFillColor(247, 220, 222);
      doc.rect(xLeft, 0, stripeW, pageHeight, 'F');
      // middle yellow
      doc.setFillColor(252, 240, 205);
      doc.rect(xLeft + stripeW + gap, 0, stripeW, pageHeight, 'F');
      // inner red
      doc.setFillColor(247, 220, 222);
      doc.rect(xLeft + (stripeW + gap) * 2, 0, stripeW, pageHeight, 'F');
    };
    const flagBlockW = 1.6 * 3 + 0.6 * 2;
    drawSideFlag(4);
    drawSideFlag(pageWidth - 4 - flagBlockW);
  };

  const drawHeader = (doc: jsPDF, logo: string | null) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;

    // Logo centered (only branding element in header)
    if (logo) {
      try {
        const ratio = getLogoRatio();
        const logoH = 26;
        const logoW = logoH * ratio;
        doc.addImage(logo, 'PNG', (pageWidth - logoW) / 2, 8, logoW, logoH);
      } catch {
        // ignore
      }
    }

    // Decorative double line
    doc.setDrawColor(180, 160, 130);
    doc.setLineWidth(0.6);
    doc.line(margin, 38, pageWidth - margin, 38);
    doc.setLineWidth(0.2);
    doc.line(margin, 39.5, pageWidth - margin, 39.5);
    doc.setTextColor(0);
  };

  const drawFooter = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(180, 160, 130);
    doc.setLineWidth(0.4);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text('NAZARÍ HOMES · info@nazarihomes.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0);
  };

  const generateConsentPdf = async () => {
    if (!propAddress.trim() || !propPostalCode.trim() || !propMunicipality.trim() || !propProvince.trim()) {
      toast({ title: 'Faltan datos', description: 'Completa la dirección de la propiedad.', variant: 'destructive' });
      return;
    }
    if (!signProvince.trim() || !day || !month || !year) {
      toast({ title: 'Faltan datos', description: 'Indica provincia y fecha de firma.', variant: 'destructive' });
      return;
    }
    if (!signature) {
      toast({ title: 'Falta la firma', description: 'Dibuja la firma de Nazarí Homes antes de generar el PDF.', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;
    const contentWidth = pageWidth - margin * 2;

    const logo = await loadLogoDataUrl();
    drawBackground(doc, logo);
    drawHeader(doc, logo);

    let y = 46;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLÁUSULA DE CONSENTIMIENTO EXPRESO DE CLIENTES ARRENDATARIOS', margin, y, { maxWidth: contentWidth });
    y += 10;

    // Property line (highlighted)
    doc.setFillColor(248, 244, 235);
    doc.setDrawColor(200, 180, 145);
    const propLine = `${propAddress.toUpperCase()} | ${propPostalCode} | ${propMunicipality.toUpperCase()} | ${propProvince.toUpperCase()}`;
    const propLines = doc.splitTextToSize(propLine, contentWidth - 6);
    const boxH = propLines.length * 5.5 + 6;
    doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 50, 35);
    doc.text(propLines, margin + 3, y + 6);
    doc.setTextColor(0);
    y += boxH + 8;

    // Intro paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const intro =
      'En aras a dar cumplimiento al Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, ' +
      'de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al ' +
      'tratamiento de datos personales y a la libre circulación de estos datos, y siguiendo las ' +
      'Recomendaciones e Instrucciones emitidas por la Agencia Española de Protección de Datos (A.E.P.D.), ' +
      'SE INFORMA:';
    const introLines = doc.splitTextToSize(intro, contentWidth);
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 4;

    // Bullet points
    const bullets = [
      'Los datos de carácter personal solicitados y facilitados por usted, son incorporados a un fichero de titularidad privada cuyo responsable y único destinatario es Nazarí Homes.',
      'Solo serán solicitados aquellos datos estrictamente necesarios para prestar adecuadamente los servicios solicitados, pudiendo ser necesario recoger datos de contacto de terceros, tales como representantes legales, tutores, o personas a cargo designadas por los mismos.',
      'Todos los datos recogidos cuentan con el compromiso de confidencialidad, con las medidas de seguridad establecidas legalmente, y bajo ningún concepto son cedidos o tratados por terceras personas, físicas o jurídicas, sin el previo consentimiento del cliente, tutor o representante legal, salvo en aquellos casos en los que fuere imprescindible para la correcta prestación del servicio.',
      'Una vez finalizada la relación entre la empresa y el cliente los datos serán archivados y conservados durante un periodo MÍNIMO DE 5 AÑOS Y MÁXIMO DE 10 AÑOS.',
      'Los datos que facilito serán incluidos en el Tratamiento denominado Clientes de Nazarí Homes, con la finalidad de gestión del servicio contratado, emisión de facturas, contacto y todas las gestiones relacionadas con los clientes, y manifiesto mi consentimiento. También se me ha informado de la posibilidad de ejercitar los derechos de acceso, rectificación, cancelación y oposición, indicándolo por escrito a Nazarí Homes a través de correo electrónico a info@nazarihomes.com.',
      'Los datos personales podrán ser cedidos por Nazarí Homes a las entidades que prestan servicios a la misma.',
    ];

    for (const b of bullets) {
      const lines = doc.splitTextToSize(b, contentWidth - 6);
      doc.setFont('helvetica', 'bold');
      doc.text('•', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 2.5;
    }

    y += 4;
    doc.setDrawColor(200, 180, 145);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Date line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`EN ${signProvince.toUpperCase()} A ${day} DE ${month.toUpperCase()} DE ${year}`, margin, y);
    y += 14;

    // Signature columns: 3 columns (Interesado | Avalista | Nazarí Homes)
    const gap = 8;
    const colW = (contentWidth - gap * 2) / 3;
    const colX = [
      margin,
      margin + colW + gap,
      margin + (colW + gap) * 2,
    ];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('EL INTERESADO', colX[0] + colW / 2, y, { align: 'center' });
    doc.text('EL AVALISTA', colX[1] + colW / 2, y, { align: 'center' });
    doc.text('NAZARÍ HOMES', colX[2] + colW / 2, y, { align: 'center' });
    y += 4;

    // Nazarí Homes signature image in the third column
    try {
      const sigW = Math.min(colW, 55);
      const sigH = 26;
      doc.addImage(signature, 'PNG', colX[2] + (colW - sigW) / 2, y, sigW, sigH);
    } catch {
      // ignore
    }
    y += 30;

    doc.setDrawColor(120);
    doc.setLineWidth(0.3);
    colX.forEach((x) => doc.line(x, y, x + colW, y));
    y += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Firma digital o manuscrita', colX[0] + colW / 2, y, { align: 'center' });
    doc.text('Firma digital o manuscrita', colX[1] + colW / 2, y, { align: 'center' });
    doc.text('Firma y sello', colX[2] + colW / 2, y, { align: 'center' });
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60);
    const nameLine = (name: string, dni: string) => {
      const n = name.trim() || '—';
      const d = dni.trim() ? `DNI/NIE: ${dni.trim()}` : '';
      return d ? `${n}\n${d}` : n;
    };
    doc.text(nameLine(interestedName, interestedDni), colX[0] + colW / 2, y, { align: 'center' });
    doc.text(nameLine(guarantorName, guarantorDni), colX[1] + colW / 2, y, { align: 'center' });
    doc.setTextColor(0);

    drawFooter(doc);

    doc.save(`consentimiento-datos-${propMunicipality.replace(/\s+/g, '_') || 'cliente'}.pdf`);
    toast({ title: 'PDF generado', description: 'El consentimiento se ha descargado correctamente.' });
  };

  const generateReservationPdf = async () => {
    const validTenants = tenants.filter((t) => t.name.trim() && t.dni.trim());
    if (validTenants.length === 0) {
      toast({ title: 'Faltan datos', description: 'Añade al menos un arrendatario con nombre y DNI/NIE.', variant: 'destructive' });
      return;
    }
    if (!propAddress.trim() || !propPostalCode.trim() || !propMunicipality.trim() || !propProvince.trim()) {
      toast({ title: 'Faltan datos', description: 'Completa la dirección del inmueble.', variant: 'destructive' });
      return;
    }
    if (!reservationAmountNum || !depositAmountNum || !monthlyRentNum) {
      toast({ title: 'Faltan datos', description: 'Indica importe de reserva, fianza y precio del alquiler.', variant: 'destructive' });
      return;
    }
    if (!signature) {
      toast({ title: 'Falta la firma', description: 'Dibuja la firma de Nazarí Homes antes de generar el PDF.', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;
    const contentWidth = pageWidth - margin * 2;

    const logo = await loadLogoDataUrl();
    drawBackground(doc, logo);
    drawHeader(doc, logo);

    const reservation = formatEuros(reservationAmountNum);
    const deposit = formatEuros(depositAmountNum);
    const rent = formatEuros(monthlyRentNum);

    let y = 50;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RECIBO DE RESERVA DE ALQUILER — NAZARÍ HOMES', margin, y);
    y += 8;

    // Property
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INMUEBLE OBJETO DE RESERVA:', margin, y);
    doc.setFont('helvetica', 'normal');
    const propLine = `${propAddress.toUpperCase()}. CP: ${propPostalCode}. ${propMunicipality.toUpperCase()} (${propProvince.toUpperCase()}).`;
    const propLines = doc.splitTextToSize(propLine, contentWidth - 60);
    doc.text(propLines, margin + 60, y);
    y += propLines.length * 5 + 4;

    // Tenants
    doc.setFont('helvetica', 'bold');
    doc.text('EFECTÚAN LA RESERVA (ARRENDATARIOS*):', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    validTenants.forEach((t) => {
      doc.text(t.name.toUpperCase(), margin + 4, y);
      doc.text(`DNI: ${t.dni.toUpperCase()}`, margin + contentWidth - 60, y);
      y += 5.5;
    });
    y += 3;

    // Reservation amount
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTE DE LA RESERVA:', margin, y);
    y += 5.5;
    doc.setFont('helvetica', 'normal');
    const reservationLine = `Entregan la cantidad de ${reservation.letters} (${reservation.figures}).`;
    const resLines = doc.splitTextToSize(reservationLine, contentWidth);
    doc.text(resLines, margin, y);
    y += resLines.length * 5 + 2;

    // Conditions
    const condText =
      `CONDICIONES: La reserva se aplicará a la fianza descontándose de la misma una vez formalizado el contrato. ` +
      `(FECHA INICIO ALQUILER: ${formatDateEs(rentalStartDate) || '__/__/____'}, FECHA FINALIZACIÓN: ${formatDateEs(rentalEndDate) || '__/__/____'}).\n` +
      `    Se perderá la reserva en caso de no formalización del contrato por causa imputable a la parte que efectúa la reserva o en caso de impago de los honorarios correspondientes por prestación de servicios G.I.A. (Gestión Integral del Alquiler) a la inmobiliaria interviniente. Los honorarios serán abonados el mismo día de realización de la reserva (fianza).`;
    const condLines = doc.splitTextToSize(condText, contentWidth);
    doc.text(condLines, margin, y);
    y += condLines.length * 5 + 4;

    // Contract sign date
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA FIRMA DEL CONTRATO', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${formatDateEs(contractSignDate) || '__/__/____'}).`, margin + 60, y);
    y += 6;

    // Deposit
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTE DE LA FIANZA:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${deposit.letters} (${deposit.figures}).`, margin + 50, y);
    y += 6;

    // Fees
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTE DE HONORARIOS (G.I.A.):', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(feesText, margin + 65, y);
    y += 6;

    // Monthly rent
    doc.setFont('helvetica', 'bold');
    doc.text('PRECIO DEL ALQUILER:', margin, y);
    doc.setFont('helvetica', 'normal');
    const rentLine = `${rent.letters} MENSUALES (${rent.figures}).`;
    const rentLines = doc.splitTextToSize(rentLine, contentWidth - 50);
    doc.text(rentLines, margin + 50, y);
    y += rentLines.length * 5 + 6;

    // Sign place + date
    doc.setFont('helvetica', 'bold');
    doc.text(`EN ${(signProvince || propProvince).toUpperCase()} A ${day} DE ${month.toUpperCase()} DE ${year}`, pageWidth - margin, y, { align: 'right' });
    y += 12;

    // Signature columns: PROPIEDAD | ARRENDATARIOS
    const colW = (contentWidth - 20) / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PROPIEDAD:', margin, y);
    doc.text('ARRENDATARIOS*:', margin + 20 + colW, y);
    y += 4;

    // Nazarí signature on left
    try {
      const sigW = Math.min(colW, 60);
      const sigH = 26;
      doc.addImage(signature, 'PNG', margin + (colW - sigW) / 2, y, sigW, sigH);
    } catch {
      // ignore
    }
    y += 30;

    doc.setDrawColor(120);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + colW, y);
    doc.line(margin + 20 + colW, y, margin + 20 + colW * 2, y);
    y += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Firma y sello', margin + colW / 2, y, { align: 'center' });
    doc.text('Firma digital o manuscrita', margin + 20 + colW + colW / 2, y, { align: 'center' });
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60);
    const tenantsText = validTenants.map((t) => `${t.name} — DNI: ${t.dni}`).join('\n');
    doc.text(tenantsText, margin + 20 + colW + colW / 2, y, { align: 'center' });
    doc.setTextColor(0);

    drawFooter(doc);

    const filename = `reserva-alquiler-${(validTenants[0]?.name || 'arrendatario').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    toast({ title: 'PDF generado', description: 'El recibo de reserva se ha descargado correctamente.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Generar documentación</h2>
        <p className="text-stone-600">Rellena los campos marcados y descarga el PDF firmado.</p>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as DocKind)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consent">Consentimiento de datos</TabsTrigger>
          <TabsTrigger value="reservation">Reserva de contrato</TabsTrigger>
        </TabsList>

        {/* CONSENT TAB */}
        <TabsContent value="consent" className="mt-4">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Dirección de la propiedad
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="propAddress">Dirección exacta *</Label>
                    <Input id="propAddress" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} placeholder="Calle Mayor, 12, 2ºB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propPostalCode">Código postal *</Label>
                    <Input id="propPostalCode" value={propPostalCode} onChange={(e) => setPropPostalCode(e.target.value)} placeholder="18001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propMunicipality">Municipio *</Label>
                    <Input id="propMunicipality" value={propMunicipality} onChange={(e) => setPropMunicipality(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="propProvince">Provincia *</Label>
                    <Input id="propProvince" value={propProvince} onChange={(e) => setPropProvince(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Interesado
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestedName">Nombre completo</Label>
                    <Input id="interestedName" value={interestedName} onChange={(e) => setInterestedName(e.target.value)} placeholder="Juan Pérez García" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestedDni">DNI / NIE</Label>
                    <Input id="interestedDni" value={interestedDni} onChange={(e) => setInterestedDni(e.target.value)} placeholder="12345678A" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Avalista
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guarantorName">Nombre completo</Label>
                    <Input id="guarantorName" value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} placeholder="María López Ruiz" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorDni">DNI / NIE</Label>
                    <Input id="guarantorDni" value={guarantorDni} onChange={(e) => setGuarantorDni(e.target.value)} placeholder="87654321B" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Lugar y fecha de firma
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="signProvince">Provincia firma *</Label>
                    <Input id="signProvince" value={signProvince} onChange={(e) => setSignProvince(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day">Día *</Label>
                    <Input id="day" value={day} onChange={(e) => setDay(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Mes *</Label>
                    <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Año *</Label>
                    <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
                  </div>
                </div>
              </div>

              <SignaturePad label="Firma de Nazarí Homes *" onChange={setSignature} />

              <div className="flex justify-end pt-2">
                <Button onClick={generateConsentPdf} className="bg-stone-700 hover:bg-stone-600">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESERVATION TAB */}
        <TabsContent value="reservation" className="mt-4">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Inmueble objeto de reserva
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rPropAddress">Dirección exacta *</Label>
                    <Input id="rPropAddress" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} placeholder="C/ Doctor Buenaventura Carreras Nº5, Portal Nº3, 3ºB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rPropPostalCode">Código postal *</Label>
                    <Input id="rPropPostalCode" value={propPostalCode} onChange={(e) => setPropPostalCode(e.target.value)} placeholder="18004" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rPropMunicipality">Municipio *</Label>
                    <Input id="rPropMunicipality" value={propMunicipality} onChange={(e) => setPropMunicipality(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rPropProvince">Provincia *</Label>
                    <Input id="rPropProvince" value={propProvince} onChange={(e) => setPropProvince(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                    Arrendatarios
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTenants((prev) => [...prev, { name: '', dni: '' }])}
                  >
                    + Añadir arrendatario
                  </Button>
                </div>
                <div className="space-y-3">
                  {tenants.map((t, idx) => (
                    <div key={idx} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`tName-${idx}`}>Nombre completo {idx === 0 ? '*' : ''}</Label>
                        <Input
                          id={`tName-${idx}`}
                          value={t.name}
                          onChange={(e) =>
                            setTenants((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))
                          }
                          placeholder="Sra. Surya Ganesha Gaston Jiménez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`tDni-${idx}`}>DNI / NIE {idx === 0 ? '*' : ''}</Label>
                        <Input
                          id={`tDni-${idx}`}
                          value={t.dni}
                          onChange={(e) =>
                            setTenants((prev) => prev.map((x, i) => (i === idx ? { ...x, dni: e.target.value } : x)))
                          }
                          placeholder="73518870-Z"
                        />
                      </div>
                      {tenants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTenants((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Importes y condiciones
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resAmt">Importe de la reserva (€) *</Label>
                    <Input id="resAmt" type="number" step="0.01" value={reservationAmountNum} onChange={(e) => setReservationAmountNum(e.target.value)} placeholder="1250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositAmt">Importe de la fianza (€) *</Label>
                    <Input id="depositAmt" type="number" step="0.01" value={depositAmountNum} onChange={(e) => setDepositAmountNum(e.target.value)} placeholder="1250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentAmt">Precio del alquiler mensual (€) *</Label>
                    <Input id="rentAmt" type="number" step="0.01" value={monthlyRentNum} onChange={(e) => setMonthlyRentNum(e.target.value)} placeholder="1250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feesText">Honorarios (G.I.A.)</Label>
                    <Input id="feesText" value={feesText} onChange={(e) => setFeesText(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rStart">Fecha inicio alquiler</Label>
                    <Input id="rStart" type="date" value={rentalStartDate} onChange={(e) => setRentalStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rEnd">Fecha finalización alquiler</Label>
                    <Input id="rEnd" type="date" value={rentalEndDate} onChange={(e) => setRentalEndDate(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rContractDate">Fecha firma del contrato</Label>
                    <Input id="rContractDate" type="date" value={contractSignDate} onChange={(e) => setContractSignDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
                  Lugar y fecha de firma
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rSignProvince">Lugar de firma</Label>
                    <Input id="rSignProvince" value={signProvince} onChange={(e) => setSignProvince(e.target.value)} placeholder="Granada" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rDay">Día</Label>
                    <Input id="rDay" value={day} onChange={(e) => setDay(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rMonth">Mes</Label>
                    <Input id="rMonth" value={month} onChange={(e) => setMonth(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="rYear">Año</Label>
                    <Input id="rYear" value={year} onChange={(e) => setYear(e.target.value)} />
                  </div>
                </div>
              </div>

              <SignaturePad label="Firma de Nazarí Homes *" onChange={setSignature} />

              <div className="flex justify-end pt-2">
                <Button onClick={generateReservationPdf} className="bg-stone-700 hover:bg-stone-600">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-stone-500">
        <FileText className="w-3 h-3" />
        El PDF se genera en tu navegador y se descarga al instante. No se almacena en servidor.
      </div>
    </div>
  );
};

export default DocumentGenerator;
