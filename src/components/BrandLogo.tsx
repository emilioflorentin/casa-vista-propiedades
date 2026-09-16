import { useState } from "react";
import logo from "@/assets/pisogo-logo-oficial.png.asset.json";

type BrandLogoProps = {
  className?: string;
};

const BrandLogo = ({ className = "h-12" }: BrandLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`${className} inline-flex items-center font-heading text-2xl font-bold text-primary-foreground`}>
        Piso<span className="text-accent">Go</span>
      </span>
    );
  }

  return <img src={logo.url} alt="PisoGo — Alquila, compra, vende" className={`${className} w-auto object-contain`} onError={() => setFailed(true)} />;
};

export default BrandLogo;