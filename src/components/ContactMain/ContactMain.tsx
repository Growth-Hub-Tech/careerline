import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdOutlineEmail } from 'react-icons/md';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { LuPhone } from 'react-icons/lu';
import ContactForm from '../ContactForm/ContactForm';
import { config } from '../../config';
import type { ContactTopic } from '../../lib/api';
import { Container } from '../Section';

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
      icon: <MdOutlineEmail size={ICON_SIZE} aria-hidden="true" />,
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
      icon: <HiOutlineLocationMarker size={ICON_SIZE} aria-hidden="true" />,
      label: 'Office',
      description: 'Visit us for anything that needs a room.',
      value: address,
    },
  ];
  return all.filter((channel) => channel.value !== '');
};

const TOPICS: readonly ContactTopic[] = [
  'general',
  'support',
  'sales',
  'partnership',
  'organisation_audit',
];

const topicFrom = (value: string | null): ContactTopic =>
  TOPICS.find((topic) => topic === value) ?? 'general';

export const ContactMain = () => {
  const [params] = useSearchParams();
  const topic = topicFrom(params.get('topic'));
  const contactChannels = channels();

  return (
    <section className="w-full bg-[#f7f7fb] py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[#1f2a44]">
              Contact us
            </h1>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-[#6b7280]">
              Send a message and the right person will answer it. Or reach us directly, whichever
              suits you.
            </p>

            {contactChannels.length > 0 && (
              <ul className="mt-10 border-t border-[#e6e7ee]">
                {contactChannels.map(({ icon, label, description, value, href }) => (
                  <li key={label} className="flex gap-4 border-b border-[#e6e7ee] py-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4a3f8c]/10 text-[#4a3f8c]">
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-[#1f2a44]">{label}</h2>
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
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border-[1px] border-solid border-[#e6e7ee] bg-white p-6 sm:p-8">
              <ContactForm topic={topic} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
