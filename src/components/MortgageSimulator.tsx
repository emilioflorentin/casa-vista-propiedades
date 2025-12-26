import { useState, useEffect } from "react";
import { Calculator, Info, Minus, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MortgageSimulatorProps {
  propertyPrice: number;
  propertyLocation?: string;
}

const spanishProvinces = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona",
  "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca",
  "Gerona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares",
  "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lérida", "Lugo", "Madrid",
  "Málaga", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca",
  "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
  "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

const MortgageSimulator = ({ propertyPrice, propertyLocation = "Madrid" }: MortgageSimulatorProps) => {
  const [price, setPrice] = useState(propertyPrice);
  const [savings, setSavings] = useState(Math.round(propertyPrice * 0.2));
  const [years, setYears] = useState(25);
  const [interestType, setInterestType] = useState<'fixed' | 'variable'>('fixed');
  const [interestRate, setInterestRate] = useState(2.5);
  const [location, setLocation] = useState(propertyLocation);
  const [propertyStatus, setPropertyStatus] = useState<'new' | 'secondHand'>('secondHand');

  // Calculate values
  const savingsPercentage = Math.round((savings / price) * 100);
  const mortgageAmount = Math.max(0, price - savings);
  
  // Taxes and expenses based on Spanish regulations
  // New properties: 10% IVA + ~2-3% other expenses
  // Second hand: 6-10% ITP (varies by region) + ~2-3% other expenses
  const taxRate = propertyStatus === 'new' ? 0.12 : 0.11;
  const taxesAndExpenses = Math.round(price * taxRate);
  const totalCost = price + taxesAndExpenses;
  
  // Calculate monthly payment using French amortization formula (same as Idealista)
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const annualRate = interestRate / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  let monthlyPayment = 0;
  if (mortgageAmount > 0) {
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = Math.round(mortgageAmount * (monthlyRate * factor) / (factor - 1));
    } else {
      // 0% interest rate case
      monthlyPayment = Math.round(mortgageAmount / totalMonths);
    }
  }
  
  // Total interest paid over the life of the loan
  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalPayments - mortgageAmount);
  const totalWithMortgage = savings + mortgageAmount + totalInterest + taxesAndExpenses;
  
  // Financing percentage (LTV - Loan to Value)
  const financingPercentage = price > 0 ? Math.round((mortgageAmount / price) * 100) : 0;

  // Reset when property price changes
  useEffect(() => {
    setPrice(propertyPrice);
    setSavings(Math.round(propertyPrice * 0.2));
  }, [propertyPrice]);

  const adjustInterestRate = (delta: number) => {
    const newRate = Math.max(0.1, Math.min(10, interestRate + delta));
    setInterestRate(Math.round(newRate * 100) / 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate bar widths for visualization
  const savingsBarWidth = (savings / totalWithMortgage) * 100;
  const mortgageBarWidth = (mortgageAmount / totalWithMortgage) * 100;
  const interestBarWidth = (totalInterest / totalWithMortgage) * 100;

  return (
    <div className="py-6 border-t border-stone-200">
      <h2 className="text-xl font-semibold mb-6 text-stone-800 flex items-center">
        <Calculator className="h-5 w-5 mr-2 text-stone-600" />
        Simulador de hipotecas
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Inputs */}
        <div className="space-y-6">
          {/* Property Price */}
          <div className="space-y-3">
            <Label className="text-stone-700 font-medium">Precio del inmueble</Label>
            <Input
              type="text"
              value={formatCurrency(price)}
              onChange={(e) => {
                const value = parseInt(e.target.value.replace(/\D/g, ''));
                if (!isNaN(value)) setPrice(value);
              }}
              className="h-12 text-lg font-semibold border-stone-300"
            />
            <Slider
              value={[price]}
              onValueChange={([value]) => setPrice(value)}
              min={50000}
              max={2000000}
              step={5000}
              className="mt-2"
            />
          </div>

          {/* Savings */}
          <div className="space-y-3">
            <Label className="text-stone-700 font-medium">Ahorro aportado</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={formatCurrency(savings)}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/\D/g, ''));
                  if (!isNaN(value)) setSavings(Math.min(value, price));
                }}
                className="h-12 text-lg font-semibold border-stone-300 flex-1"
              />
              <span className="text-stone-600 font-medium w-14">{savingsPercentage}%</span>
            </div>
            <Slider
              value={[savings]}
              onValueChange={([value]) => setSavings(value)}
              min={0}
              max={price}
              step={1000}
              className="mt-2"
            />
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Recuerda que los bancos suelen pedir una aportación mínima del 10% más gastos.
              </p>
            </div>
          </div>

          {/* Years */}
          <div className="space-y-3">
            <Label className="text-stone-700 font-medium">Plazo en años</Label>
            <Input
              type="number"
              value={years}
              onChange={(e) => setYears(Math.min(40, Math.max(5, parseInt(e.target.value) || 5)))}
              className="h-12 text-lg font-semibold border-stone-300"
            />
            <Slider
              value={[years]}
              onValueChange={([value]) => setYears(value)}
              min={5}
              max={40}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Interest Type & Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-stone-700 font-medium">Tipo de interés</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-stone-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Fijo: el interés no cambia durante toda la hipoteca.
                    Variable: el interés puede cambiar según el Euribor.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4">
              <RadioGroup
                value={interestType}
                onValueChange={(value) => setInterestType(value as 'fixed' | 'variable')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="cursor-pointer">Fijo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="variable" id="variable" />
                  <Label htmlFor="variable" className="cursor-pointer">Variable</Label>
                </div>
              </RadioGroup>
              
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustInterestRate(-0.05)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-semibold">{interestRate.toFixed(2)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustInterestRate(0.05)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-stone-700 font-medium">Localización del inmueble</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-12 border-stone-300">
                <SelectValue placeholder="Selecciona provincia" />
              </SelectTrigger>
              <SelectContent>
                {spanishProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Status */}
          <div className="space-y-3">
            <Label className="text-stone-700 font-medium">Estado del inmueble</Label>
            <RadioGroup
              value={propertyStatus}
              onValueChange={(value) => setPropertyStatus(value as 'new' | 'secondHand')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="cursor-pointer">Nuevo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secondHand" id="secondHand" />
                <Label htmlFor="secondHand" className="cursor-pointer text-green-600">Segunda mano</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Right side - Results */}
        <div className="bg-blue-50 rounded-xl p-6 h-fit">
          <div className="text-center mb-6">
            <p className="text-stone-600 font-medium">Tu cuota mensual</p>
            <p className="text-4xl font-bold text-stone-800">{formatCurrency(monthlyPayment)}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-stone-700">Importe hipoteca</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-stone-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Cantidad que financiarás con la hipoteca</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-semibold">{formatCurrency(mortgageAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-stone-700">Porcentaje de financiación</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-stone-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">% del precio del inmueble que financiarás</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-semibold">{financingPercentage} %</span>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                <span className="text-stone-700">Precio del inmueble</span>
              </div>
              <span className="font-semibold">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
                <div className="flex items-center gap-1">
                  <span className="text-stone-700">Impuestos y gastos de la compra</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-stone-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Incluye IVA/ITP, notaría, registro, gestoría</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <span className="font-semibold">{formatCurrency(taxesAndExpenses)}</span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-stone-800">Coste total del inmueble</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Cost Bar Visualization */}
          <div className="mt-4 mb-2">
            <div className="h-8 flex rounded-lg overflow-hidden">
              <div className="bg-amber-500" style={{ width: `${(price / totalCost) * 100}%` }}></div>
              <div className="bg-amber-600" style={{ width: `${(taxesAndExpenses / totalCost) * 100}%` }}></div>
            </div>
          </div>

          {/* Mortgage Distribution Bar */}
          <div className="mt-6 mb-4">
            <div className="h-8 flex rounded-lg overflow-hidden">
              <div className="bg-teal-400" style={{ width: `${savingsBarWidth}%` }}></div>
              <div className="bg-teal-600" style={{ width: `${mortgageBarWidth}%` }}></div>
              <div className="bg-pink-500" style={{ width: `${interestBarWidth}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-stone-600 mt-1">
              <span>Tu ahorro aportado</span>
              <span>Hipoteca</span>
              <span>Interés</span>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-400 rounded-sm"></div>
                <span className="text-stone-700">Ahorro aportado</span>
              </div>
              <span className="font-semibold">{formatCurrency(savings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-600 rounded-sm"></div>
                <span className="text-stone-700">Importe hipoteca</span>
              </div>
              <span className="font-semibold">{formatCurrency(mortgageAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-sm"></div>
                <span className="text-stone-700">Interés hipoteca</span>
              </div>
              <span className="font-semibold">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-stone-800">Coste total con hipoteca</span>
              <span>{formatCurrency(totalWithMortgage)}</span>
            </div>
          </div>

          <Button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white">
            Encontrar hipoteca
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MortgageSimulator;
