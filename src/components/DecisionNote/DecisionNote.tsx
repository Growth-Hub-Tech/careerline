interface DecisionNoteProps {
  readonly benchmark: string;
}

export const DecisionNote = ({ benchmark }: DecisionNoteProps) => (
  <div className="flex w-full flex-col gap-2 text-[13px] leading-[1.55] text-slate-600">
    <p>
      <strong className="font-semibold text-slate-800">Decision support only.</strong> Use this
      report alongside other evidence, such as interviews and work samples. It should not be the
      only reason for a hiring or career decision.
    </p>
    <p>{benchmark}</p>
  </div>
);
