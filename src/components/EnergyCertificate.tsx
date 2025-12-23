import { Zap, Leaf } from "lucide-react";

interface EnergyCertificateProps {
  consumptionRating?: string;
  emissionsRating?: string;
  consumptionValue?: number;
  emissionsValue?: number;
}

const energyLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const labelColors: Record<string, string> = {
  A: 'bg-green-600',
  B: 'bg-green-500',
  C: 'bg-lime-500',
  D: 'bg-yellow-400',
  E: 'bg-orange-400',
  F: 'bg-orange-500',
  G: 'bg-red-500'
};

const labelWidths: Record<string, string> = {
  A: 'w-[35%]',
  B: 'w-[45%]',
  C: 'w-[55%]',
  D: 'w-[65%]',
  E: 'w-[75%]',
  F: 'w-[85%]',
  G: 'w-full'
};

const EnergyLabel = ({ 
  rating, 
  value, 
  unit, 
  isSelected 
}: { 
  rating: string; 
  value?: number; 
  unit: string; 
  isSelected: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className={`${labelWidths[rating]} ${labelColors[rating]} h-6 flex items-center justify-between px-2 rounded-r-lg transition-all ${isSelected ? 'ring-2 ring-stone-800 ring-offset-1' : ''}`}>
        <span className="text-white font-bold text-sm">{rating}</span>
        {isSelected && value && (
          <span className="text-white text-xs font-medium">{value} {unit}</span>
        )}
      </div>
      {isSelected && (
        <div className="bg-stone-800 text-white text-xs px-2 py-1 rounded font-bold">
          {rating}
        </div>
      )}
    </div>
  );
};

const EnergyCertificate = ({
  consumptionRating = 'D',
  emissionsRating = 'E',
  consumptionValue = 156,
  emissionsValue = 32
}: EnergyCertificateProps) => {
  return (
    <div className="py-6 border-t border-stone-200">
      <h2 className="text-xl font-semibold mb-6 text-stone-800 flex items-center">
        <Zap className="h-5 w-5 mr-2 text-yellow-500" />
        Certificado Energético
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Consumo */}
        <div className="bg-stone-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-stone-800">Consumo de energía</h3>
          </div>
          <p className="text-sm text-stone-600 mb-4">kWh/m² año</p>
          
          <div className="space-y-1">
            {energyLabels.map((label) => (
              <EnergyLabel
                key={`consumption-${label}`}
                rating={label}
                value={consumptionValue}
                unit="kWh/m²"
                isSelected={label === consumptionRating}
              />
            ))}
          </div>
        </div>

        {/* Emisiones */}
        <div className="bg-stone-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-stone-800">Emisiones</h3>
          </div>
          <p className="text-sm text-stone-600 mb-4">kg CO₂/m² año</p>
          
          <div className="space-y-1">
            {energyLabels.map((label) => (
              <EnergyLabel
                key={`emissions-${label}`}
                rating={label}
                value={emissionsValue}
                unit="kg CO₂/m²"
                isSelected={label === emissionsRating}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-500 mt-4">
        * Los valores indicados corresponden al certificado energético oficial del inmueble.
      </p>
    </div>
  );
};

export default EnergyCertificate;
