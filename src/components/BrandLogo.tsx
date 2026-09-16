import { useState } from "react";
import logo from "@/assets/pisogo-logo-oficial.png";

type BrandLogoProps = {
  className?: string;
};

const BrandLogo = ({ className = "h-20" }: BrandLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`${className} inline-flex items-center font-heading text-2xl font-bold text-primary-foreground`}>
        Piso<span className="text-accent">Go</span>
      </span>
    );
  }

  return <img src={logo} alt="PisoGo — Alquila, compra, vende" className={`${className} w-auto object-contain`} onError={() => setFailed(true)} />;
};

export default BrandLogo;