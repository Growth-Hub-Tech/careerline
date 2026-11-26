import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuMapPin, LuPhone } from 'react-icons/lu';
import { config } from '../../config';

const ICON_SIZE = 18;

interface Channel {
  readonly icon: ReactNode;
  readonly label: string;
  readonly description: string;
  readonly value: string;
  /** Present for channels you can open directly; absent means read-only. */
  readonly href?: string;
}

// A channel with no value set (VITE_CONTACT_*) is left out rather than shown empty
const channels = (): readonly Channel[] => {
  const { email, phone, address } = config.contact;
  const all: readonly Channel[] = [
    {
      icon: <LuMail size={ICON_SIZE} aria-hidden="true" />,
      label: 'Email',
      description: 'We reply within one working day.',
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: <LuPhone size={ICON_SIZE} aria-hidden="true" />,
      label: 'Phone',
      description: 'Monday to Friday, 8am to 5pm.',
      value: phone,
      // tel: links need clean digits, so spaces and punctuation come out
      href: `tel:${phone.replace(/[^\d+]/g, '')}`,
    },
    {
      icon: <LuMapPin size={ICON_SIZE} aria-hidden="true" />,
      label: 'Office',
      description: 'Visit us for anything that needs a room.',
      value: address,
    },
  ];
  return all.filter((channel) => channel.value !== '');
};

// The team's direct channels, on the contact page and the in-app support page
export const ContactChannels = () => {
  const contactChannels = channels();

  if (contactChannels.length === 0) {
    return (
      <p className="text-[15px] text-[#6b7280]">
        Our contact details will be listed here soon. Most questions are answered in the{' '}
        <Link to="/help" className="font-medium text-[#4a3f8c] hover:underline">
          Help Center
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
      {contactChannels.map(({ icon, label, description, value, href }) => (
        <li key={label} className="flex gap-4 rounded-xl border border-[#e6e7ee] bg-white p-5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4a3f8c]/10 text-[#4a3f8c]">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1f2a44]">{label}</p>
            <p className="mt-0.5 text-sm text-[#6b7280]">{description}</p>
            {href ? (
              <a
                href={href}
                className="mt-1.5 inline-block text-sm font-medium break-words text-[#4a3f8c] hover:underline"
              >
                {value}
              </a>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#1f2a44]">{value}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export const ContactMain = () => (
  <section className="w-full bg-[#f7f7fb] py-20">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-heading text-[32px] leading-tight font-bold tracking-tight text-[#1f2a44]">
          Contact us
        </h1>
        <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-[#6b7280]">
          Questions about tests, audits, more seats or a quote for your organisation? Reach the
          CareerLine team directly.
        </p>
      </div>
      <ContactChannels />
    </div>
  </section>
);
