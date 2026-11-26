import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ContactChannels } from '../components/ContactMain/ContactMain';
import { LINK_CLASS } from '../components/Button';

export const Support = () => {
  const contactId = useId();

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-3">
        <h1 className="page-title">Support</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Most questions about tests, reports, payments and privacy are answered in the{' '}
          <Link to="/help" className={LINK_CLASS}>
            Help Center
          </Link>
          .
        </p>
      </header>

      <section aria-labelledby={contactId} className="flex flex-col gap-4">
        <h2 id={contactId} className="text-[20px] font-bold text-slate-800">
          Contact us
        </h2>
        <p className="max-w-[60ch] text-[14px] text-slate-600">
          Tell us what happened. For a payment problem, include your payment reference. For an
          error, include the reference number shown in the message.
        </p>
        <ContactChannels />
      </section>
    </div>
  );
};
