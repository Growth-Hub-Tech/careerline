import { Link } from 'react-router-dom';
import { HELP_TOPICS } from '../content/help';

export const Help = () => (
  <div className="mx-auto flex w-full max-w-[860px] flex-col gap-10 px-5 py-14 sm:px-8">
    <header className="flex flex-col gap-3">
      <h1 className="font-heading text-[36px] leading-[1.15] font-bold text-slate-950">
        Help Center
      </h1>
      <p className="text-[17px] text-slate-700">Answers to the questions people ask most.</p>
    </header>

    {HELP_TOPICS.map((topic) => (
      <section key={topic.title} className="flex flex-col gap-3">
        <h2 className="font-heading text-[22px] font-bold text-slate-950">{topic.title}</h2>
        <div className="flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {topic.questions.map(({ question, answer }) => (
            <details key={question} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-[16px] font-medium text-slate-900 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <span className="flex items-center justify-between gap-4">
                  {question}
                  <span aria-hidden="true" className="text-slate-400 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-700">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    ))}

    <p className="text-[16px] text-slate-700">
      Still stuck?{' '}
      <Link
        to="/contact?topic=support"
        className="font-medium text-indigo-700 underline hover:text-indigo-900"
      >
        Contact support
      </Link>
    </p>
  </div>
);
