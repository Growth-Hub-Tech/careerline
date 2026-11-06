import { LuWifiOff } from 'react-icons/lu';
import { useOnline } from '../../lib/hooks/useOnline';

export const OfflineBanner = () => {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-slate-900 px-4 py-2 text-center text-[14px] text-white"
    >
      <LuWifiOff size={16} aria-hidden="true" />
      You are offline. Check your internet connection. Your answers are kept until you are back.
    </div>
  );
};
