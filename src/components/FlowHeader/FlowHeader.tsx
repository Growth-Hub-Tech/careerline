interface FlowHeaderProps {
  readonly label: string;
  readonly showBrand?: boolean;
}

export const FlowHeader = ({ label, showBrand = false }: FlowHeaderProps) => (
  <header className="flex h-14 shrink-0 items-center justify-between bg-indigo-800 px-5 sm:px-6">
    {showBrand ? <span className="text-[18px] font-bold text-white">CareerLine AI</span> : <span />}
    <p className="text-[12px] font-medium tracking-wide text-white/80 uppercase">{label}</p>
  </header>
);
