import { useId } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm/ContactForm';

const LINK = 'font-medium text-indigo-700 underline hover:text-indigo-900';

export const Support = () => {
  const formId = useId();

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Support</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Most questions about tests, reports, payments and privacy are answered in the{' '}
          <Link to="/help" className={LINK}>
            Help Center
          </Link>
          .
        </p>
      </header>

      <section
        aria-labelledby={formId}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 id={formId} className="text-[20px] font-bold text-slate-800">
          Send us a message
        </h2>
        <p className="text-[14px] text-slate-600">
          Tell us what happened. For a payment problem, include your payment reference. For an
          error, include the reference number shown in the message.
        </p>
        <ContactForm topic="support" />
      </section>
    </div>
  );
};
