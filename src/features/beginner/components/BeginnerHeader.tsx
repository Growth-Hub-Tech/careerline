import whiteLogo from '../../../assests/white.png';

interface BeginnerHeaderProps {
  showBrand?: boolean;
}

export const BeginnerHeader = ({ showBrand = false }: BeginnerHeaderProps) => (
  <header className="flex h-16 w-full items-center justify-between bg-[#4A3F8C] px-6">
    <div className="flex items-center gap-3">
      <img src={whiteLogo} alt="white" className="h-16 w-auto" />
      {showBrand && <span className="text-base font-bold text-white">CareerLine AI</span>}
    </div>
    <span className="text-xs font-semibold tracking-wide text-white/80">BEGINNER PATH</span>
  </header>
);
