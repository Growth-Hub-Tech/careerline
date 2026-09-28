export const Processing = () => (
  <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#4A3F8C] px-4 text-center">
    <div
      role="status"
      aria-label="Loading"
      className="h-[120px] w-[120px] animate-spin rounded-full border-4 border-white/15 border-t-[#D99A1B]"
    />
    <h1 className="mt-8 text-2xl font-bold text-white">
      Matching your answers to real career paths.
    </h1>
    <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-white/80">
      This usually takes a few seconds. CareerLine AI is comparing your responses against the
      profiles of people who have thrived on each path.
    </p>
  </div>
);
