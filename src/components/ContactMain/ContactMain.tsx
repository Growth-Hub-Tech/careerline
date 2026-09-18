import type { ReactNode } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { LuPhone } from 'react-icons/lu';
import ContactForm from '../ContactForm/ContactForm';
import { PageContainer } from '../PageContainer';
import { config } from '../../config';

const ICON_SIZE = 18;

// Read config defensively. Everything below this line runs while the module is
// being imported, not while the component renders — so one undefined value here
// throws before React starts and takes the whole page down with it, blank and
// silent. Optional chaining plus a fallback keeps a missing config entry as a
// missing row instead of a white screen.
const EMAIL = config.contact?.email ?? '';
const PHONE = config.contact?.phone ?? '';
const ADDRESS = config.contact?.address ?? '';

interface Channel {
  readonly icon: ReactNode;
  readonly label: string;
  readonly description: string;
  /** Empty means the channel has no value configured yet. */
  readonly action: string;
  /** Present for channels you can open directly; absent means read-only. */
  readonly href?: string;
}

const CHANNELS: readonly Channel[] = [
  {
    icon: <MdOutlineEmail size={ICON_SIZE} aria-hidden="true" />,
    label: 'Email',
    description: 'We reply within one working day.',
    action: EMAIL,
    href: EMAIL ? `mailto:${EMAIL}` : undefined,
  },
  {
    icon: <LuPhone size={ICON_SIZE} aria-hidden="true" />,
    label: 'Phone',
    description: 'Monday to Friday, 8am to 5pm.',
    action: PHONE,
    // tel: links need clean digits, so spaces and punctuation come out.
    href: PHONE ? `tel:${PHONE.replace(/[^\d+]/g, '')}` : undefined,
  },
  {
    icon: <IoChatbubbleOutline size={ICON_SIZE} aria-hidden="true" />,
    label: 'Live chat',
    description: 'Quickest way to reach the team.',
    action: 'Start a new chat',
  },
  {
    icon: <HiOutlineLocationMarker size={ICON_SIZE} aria-hidden="true" />,
    label: 'Office',
    description: 'Visit us for anything that needs a room.',
    action: ADDRESS,
  },
] as const;

export const ContactMain = () => (
  <section className="w-full bg-[#f7f7fb] py-20">
    <PageContainer>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[#1f2a44]">
            Contact us
          </h1>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-[#6b7280]">
            Send a message and the right person will answer it. Or reach us directly, whichever
            suits you.
          </p>

          <ul className="mt-10 border-t border-[#e6e7ee]">
            {CHANNELS.map(({ icon, label, description, action, href }) => (
              <li key={label} className="flex gap-4 border-b border-[#e6e7ee] py-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4a3f8c]/10 text-[#4a3f8c]">
                  {icon}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#1f2a44]">{label}</h2>
                  <p className="mt-0.5 text-sm text-[#6b7280]">{description}</p>

                  {/* A real link where the channel can be opened, a button for
                      chat, plain text otherwise — an address isn't a button.
                      Nothing renders at all if the value is missing, so a gap
                      in config never shows up as "undefined" on the page. */}
                  {href ? (
                    <a
                      href={href}
                      className="mt-1.5 inline-block text-sm font-medium break-words text-[#4a3f8c] hover:underline"
                    >
                      {action}
                    </a>
                  ) : label === 'Live chat' ? (
                    <button
                      type="button"
                      // TODO: open the chat widget
                      className="mt-1.5 cursor-pointer text-sm font-medium text-[#4a3f8c] hover:underline"
                    >
                      {action}
                    </button>
                  ) : action ? (
                    <p className="mt-1.5 text-sm font-medium text-[#1f2a44]">{action}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-xl border-[1px] border-solid border-[#e6e7ee] bg-white p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </PageContainer>
  </section>
);
