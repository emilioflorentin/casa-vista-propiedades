import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

  // Reservation extra fields
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [propertyRef, setPropertyRef] = useState('');
  const [reservationAmount, setReservationAmount] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

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

    // Signature columns
    const colW = (contentWidth - 20) / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NAZARÍ HOMES', margin + colW / 2, y, { align: 'center' });
    doc.text('EL INTERESADO', margin + 20 + colW + colW / 2, y, { align: 'center' });
    y += 4;

    // Left side: NAZARÍ HOMES signature (drawn from canvas)
    try {
      doc.addImage(signature, 'PNG', margin + (colW - 60) / 2, y, 60, 28);
    } catch {
      // ignore
    }
    y += 32;

    doc.setDrawColor(120);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + colW, y);
    doc.line(margin + 20 + colW, y, margin + 20 + colW * 2, y);
    y += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Firma y sello', margin + colW / 2, y, { align: 'center' });
    doc.text('Firma manuscrita del interesado', margin + 20 + colW + colW / 2, y, { align: 'center' });
    doc.setTextColor(0);

    drawFooter(doc);

    doc.save(`consentimiento-datos-${propMunicipality.replace(/\s+/g, '_') || 'cliente'}.pdf`);
    toast({ title: 'PDF generado', description: 'El consentimiento se ha descargado correctamente.' });
  };

  const generateReservationPdf = async () => {
    if (!clientName.trim() || !clientDni.trim()) {
      toast({ title: 'Faltan datos', description: 'Indica nombre y DNI/NIE del cliente.', variant: 'destructive' });
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('DOCUMENTO DE RESERVA', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const amountTxt = reservationAmount ? `${Number(reservationAmount).toLocaleString('es-ES')} €` : '________ €';
    const priceTxt = salePrice ? `${Number(salePrice).toLocaleString('es-ES')} €` : '________ €';

    const body =
      `D./Dña. ${clientName}, con DNI/NIE ${clientDni} (en adelante, "el Reservante"), manifiesta su ` +
      `interés en reservar la propiedad identificada con referencia ${propertyRef || '________'}, ` +
      `sita en ${propAddress || '________________'}, ${propPostalCode || ''} ${propMunicipality || ''} (${propProvince || ''}).\n\n` +
      `A tal efecto entrega en este acto, en concepto de señal de reserva, la cantidad de ${amountTxt}, ` +
      `que será descontada del precio total de la operación, fijado en ${priceTxt}.\n\n` +
      `La presente reserva queda sujeta a la formalización del contrato definitivo entre las partes en el ` +
      `plazo acordado. En caso de desistimiento por parte del Reservante, el importe entregado quedará en ` +
      `poder de NAZARÍ HOMES en concepto de indemnización por gastos de gestión.` +
      (extraNotes ? `\n\nObservaciones: ${extraNotes}` : '');

    const lines = doc.splitTextToSize(body, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;

    doc.setFont('helvetica', 'bold');
    doc.text(`En ${signProvince || '________'} a ${day} de ${month} de ${year}.`, margin, y);
    y += 14;

    const colW = (contentWidth - 20) / 2;
    doc.text('NAZARÍ HOMES', margin + colW / 2, y, { align: 'center' });
    doc.text('EL RESERVANTE', margin + 20 + colW + colW / 2, y, { align: 'center' });
    y += 4;

    // Left side: NAZARÍ HOMES signature
    try {
      doc.addImage(signature, 'PNG', margin + (colW - 60) / 2, y, 60, 28);
    } catch {
      // ignore
    }
    y += 32;
    doc.setDrawColor(120);
    doc.line(margin, y, margin + colW, y);
    doc.line(margin + 20 + colW, y, margin + 20 + colW * 2, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('Firma y sello', margin + colW / 2, y, { align: 'center' });
    doc.text(`${clientName} — ${clientDni}`, margin + 20 + colW + colW / 2, y, { align: 'center' });
    doc.setTextColor(0);

    drawFooter(doc);

    doc.save(`reserva-${propertyRef || 'propiedad'}-${clientName.replace(/\s+/g, '_')}.pdf`);
    toast({ title: 'PDF generado', description: 'El documento se ha descargado correctamente.' });
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre completo *</Label>
                  <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Juan Pérez García" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientDni">DNI / NIE *</Label>
                  <Input id="clientDni" value={clientDni} onChange={(e) => setClientDni(e.target.value)} placeholder="12345678A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propRef">Referencia propiedad</Label>
                  <Input id="propRef" value={propertyRef} onChange={(e) => setPropertyRef(e.target.value)} placeholder="ABC12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propAddrR">Dirección propiedad</Label>
                  <Input id="propAddrR" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} placeholder="Calle, nº" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resAmount">Importe reserva (€)</Label>
                  <Input id="resAmount" type="number" value={reservationAmount} onChange={(e) => setReservationAmount(e.target.value)} placeholder="3000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Precio total (€)</Label>
                  <Input id="salePrice" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="180000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="signProvinceR">Lugar de firma</Label>
                  <Input id="signProvinceR" value={signProvince} onChange={(e) => setSignProvince(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observaciones</Label>
                  <Textarea id="notes" value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} rows={3} />
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
