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

type DocKind = 'consent' | 'reservation';

interface SignaturePadProps {
  label: string;
  onChange: (dataUrl: string | null) => void;
}

const SignaturePad = ({ label, onChange }: SignaturePadProps) => {
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
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL('image/png'));
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

const todayISO = () => new Date().toISOString().split('T')[0];

const DocumentGenerator = () => {
  const { toast } = useToast();
  const [kind, setKind] = useState<DocKind>('consent');

  // Shared / Consent fields
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [place, setPlace] = useState('');
  const [docDate, setDocDate] = useState(todayISO());
  const [signature, setSignature] = useState<string | null>(null);

  // Reservation extra fields
  const [propertyRef, setPropertyRef] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [reservationAmount, setReservationAmount] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const addWrapped = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 6) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  const generatePdf = () => {
    if (!clientName.trim() || !clientDni.trim()) {
      toast({ title: 'Faltan datos', description: 'Indica nombre y DNI/NIE del cliente.', variant: 'destructive' });
      return;
    }
    if (!signature) {
      toast({ title: 'Falta la firma', description: 'Dibuja la firma antes de generar el PDF.', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NAZARÍ HOMES', margin, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Gestión integral de propiedades', margin, 26);
    doc.setDrawColor(180);
    doc.line(margin, 30, pageWidth - margin, 30);

    let y = 42;

    if (kind === 'consent') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('CONSENTIMIENTO DE TRATAMIENTO DE DATOS', margin, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const body =
        `D./Dña. ${clientName}, con DNI/NIE ${clientDni}, declara haber sido informado/a por NAZARÍ HOMES ` +
        `sobre el tratamiento de sus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la ` +
        `Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales.\n\n` +
        `Mediante la firma del presente documento OTORGA SU CONSENTIMIENTO EXPRESO para que NAZARÍ HOMES ` +
        `trate sus datos con las siguientes finalidades: gestión de la relación contractual, prestación de ` +
        `servicios de intermediación inmobiliaria, gestión integral de la propiedad, comunicaciones ` +
        `relativas al servicio y cumplimiento de las obligaciones legales aplicables.\n\n` +
        `El interesado puede ejercitar en cualquier momento sus derechos de acceso, rectificación, supresión, ` +
        `oposición, limitación del tratamiento y portabilidad dirigiendo una comunicación a info@nazarihomes.com.`;

      y = addWrapped(doc, body, margin, y, contentWidth, 5.5);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('DOCUMENTO DE RESERVA', margin, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const amountTxt = reservationAmount ? `${Number(reservationAmount).toLocaleString('es-ES')} €` : '________ €';
      const priceTxt = salePrice ? `${Number(salePrice).toLocaleString('es-ES')} €` : '________ €';

      const body =
        `D./Dña. ${clientName}, con DNI/NIE ${clientDni} (en adelante, "el Reservante"), manifiesta su ` +
        `interés en reservar la propiedad identificada con referencia ${propertyRef || '________'}, ` +
        `sita en ${propertyAddress || '________________'}.\n\n` +
        `A tal efecto entrega en este acto, en concepto de señal de reserva, la cantidad de ${amountTxt}, ` +
        `que será descontada del precio total de la operación, fijado en ${priceTxt}.\n\n` +
        `La presente reserva queda sujeta a la formalización del contrato definitivo entre las partes en el ` +
        `plazo acordado. En caso de desistimiento por parte del Reservante, el importe entregado quedará en ` +
        `poder de NAZARÍ HOMES en concepto de indemnización por gastos de gestión.\n\n` +
        (extraNotes ? `Observaciones: ${extraNotes}\n\n` : '');

      y = addWrapped(doc, body, margin, y, contentWidth, 5.5);
    }

    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.text(`En ${place || '________'}, a ${formatDate(docDate)}.`, margin, y);
    y += 18;

    // Signature
    doc.setFont('helvetica', 'normal');
    doc.text('Firma del cliente:', margin, y);
    try {
      doc.addImage(signature, 'PNG', margin, y + 2, 70, 28);
    } catch {
      // ignore
    }
    y += 34;
    doc.setDrawColor(120);
    doc.line(margin, y, margin + 70, y);
    y += 5;
    doc.setFontSize(9);
    doc.text(`${clientName} — ${clientDni}`, margin, y);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      'NAZARÍ HOMES · info@nazarihomes.com',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    const filename =
      kind === 'consent'
        ? `consentimiento-datos-${clientName.replace(/\s+/g, '_')}.pdf`
        : `reserva-${propertyRef || 'propiedad'}-${clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);

    toast({ title: 'PDF generado', description: 'El documento se ha descargado correctamente.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Generar documentación</h2>
        <p className="text-stone-600">Rellena los campos y descarga el PDF firmado.</p>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as DocKind)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consent">Consentimiento de datos</TabsTrigger>
          <TabsTrigger value="reservation">Reserva de contrato</TabsTrigger>
        </TabsList>

        <Card className="mt-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                <Label htmlFor="place">Lugar</Label>
                <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Ciudad" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docDate">Fecha</Label>
                <Input id="docDate" type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} />
              </div>
            </div>

            <TabsContent value="reservation" className="m-0 p-0 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propRef">Referencia propiedad</Label>
                  <Input id="propRef" value={propertyRef} onChange={(e) => setPropertyRef(e.target.value)} placeholder="ABC12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propAddr">Dirección propiedad</Label>
                  <Input id="propAddr" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="Calle, nº, ciudad" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resAmount">Importe reserva (€)</Label>
                  <Input id="resAmount" type="number" value={reservationAmount} onChange={(e) => setReservationAmount(e.target.value)} placeholder="3000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Precio total (€)</Label>
                  <Input id="salePrice" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="180000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea id="notes" value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} rows={3} />
              </div>
            </TabsContent>

            <SignaturePad label="Firma del cliente *" onChange={setSignature} />

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={generatePdf} className="bg-stone-700 hover:bg-stone-600">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-stone-500">
        <FileText className="w-3 h-3" />
        El PDF se genera en tu navegador y se descarga al instante. No se almacena en servidor.
      </div>
    </div>
  );
};

export default DocumentGenerator;
