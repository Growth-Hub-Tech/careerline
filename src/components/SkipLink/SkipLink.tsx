export const MAIN_ID = 'main';

export const SkipLink = () => (
  <a
    href={`#${MAIN_ID}`}
    className="sr-only rounded-lg bg-indigo-700 px-4 py-2 text-[14px] font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
  >
    Skip to main content
  </a>
);
