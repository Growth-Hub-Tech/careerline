import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Dialog } from '../components/Dialog';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { Textarea } from '../components/Textarea';
import { TextField } from '../components/TextField';
import {
  privacyApi,
  type AccountDeletion,
  type Consent,
  type ConsentChange,
  type DataExport,
} from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';

type ConsentKey = Consent['key'];

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 id={headingId} className="font-heading text-[20px] font-bold text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
};

interface ConsentProps {
  readonly granted: (key: ConsentKey) => boolean;
  readonly update: (change: ConsentChange) => Promise<void>;
}

const ResultsSharing = ({ granted, update }: ConsentProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const shared = granted('share_profile_with_recruiters');

  const save = async (next: boolean) => {
    setError(undefined);
    setIsSaving(true);
    try {
      await update({ key: 'share_profile_with_recruiters', granted: next });
      setIsConfirming(false);
    } catch (saveError) {
      setError(describeError(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section title="Who can see your results">
      <p className="text-[15px] text-slate-700">
        {shared
          ? 'Recruiters on CareerLine can see your profile and your test results.'
          : 'Only you can see your results.'}
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      {shared ? (
        <Button
          fullWidth={false}
          variant="deep"
          className="self-start"
          onClick={() => setIsConfirming(true)}
        >
          Take back access
        </Button>
      ) : (
        <Button
          fullWidth={false}
          className="self-start"
          isLoading={isSaving}
          onClick={() => void save(true)}
        >
          Share with recruiters
        </Button>
      )}
      <Dialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        title="Take back access?"
        description="Recruiters will no longer see your profile or your results. Reports they have already downloaded stay with them."
        footer={
          <>
            <Button
              variant="transparent"
              border="solid"
              fullWidth={false}
              onClick={() => setIsConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="deep"
              fullWidth={false}
              isLoading={isSaving}
              onClick={() => void save(false)}
            >
              Take back access
            </Button>
          </>
        }
      />
    </Section>
  );
};

const CHOICES: readonly { key: ConsentKey; label: string; hint: string }[] = [
  {
    key: 'marketing_emails',
    label: 'Send me news and offers by email',
    hint: 'We use your email address only, and never pass it to anyone else.',
  },
  {
    key: 'product_research',
    label: 'Invite me to help improve CareerLine',
    hint: 'We may email you about a short interview or survey. Taking part is always optional.',
  },
];

const EmailChoices = ({ granted, update }: ConsentProps) => {
  const [saving, setSaving] = useState<ConsentKey>();
  const [error, setError] = useState<string>();

  const toggle = async (key: ConsentKey) => {
    setError(undefined);
    setSaving(key);
    try {
      await update({ key, granted: !granted(key) });
    } catch (saveError) {
      setError(describeError(saveError));
    } finally {
      setSaving(undefined);
    }
  };

  return (
    <Section title="Emails and research">
      {CHOICES.map(({ key, label, hint }) => (
        <Checkbox
          key={key}
          label={label}
          hint={hint}
          checked={granted(key)}
          disabled={saving === key}
          onChange={() => void toggle(key)}
        />
      ))}
      {error && <Alert variant="error">{error}</Alert>}
    </Section>
  );
};

type ExportState =
  | { readonly phase: 'idle' }
  | { readonly phase: 'requesting' }
  | { readonly phase: 'preparing'; readonly exportId: number }
  | { readonly phase: 'ready'; readonly file: DataExport }
  | { readonly phase: 'expired' }
  | { readonly phase: 'error'; readonly message: string };

const toExportState = (file: DataExport): ExportState => {
  if (file.status === 'ready' && file.download_url) return { phase: 'ready', file };
  if (file.status === 'expired') return { phase: 'expired' };
  return { phase: 'preparing', exportId: file.export_id };
};

const DataDownload = ({ pollInterval }: { pollInterval: number }) => {
  const [state, setState] = useState<ExportState>({ phase: 'idle' });

  useEffect(() => {
    if (state.phase !== 'preparing') return undefined;

    let active = true;
    const timer = setTimeout(() => {
      privacyApi.getExport(state.exportId).then(
        (file) => {
          if (active) setState(toExportState(file));
        },
        (error: unknown) => {
          if (active) setState({ phase: 'error', message: describeError(error) });
        },
      );
    }, pollInterval);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [state, pollInterval]);

  const request = async () => {
    setState({ phase: 'requesting' });
    try {
      setState(toExportState(await privacyApi.requestExport()));
    } catch (error) {
      setState({ phase: 'error', message: describeError(error) });
    }
  };

  return (
    <Section title="Download your data">
      <p className="text-[15px] text-slate-700">
        Get a copy of everything CareerLine holds about you: your account, answers and results.
      </p>
      {state.phase === 'preparing' && (
        <p role="status" className="text-[14px] text-slate-600">
          We are preparing your file. This can take a minute.
        </p>
      )}
      {state.phase === 'ready' && (
        <div className="flex flex-col gap-2">
          <a
            href={state.file.download_url ?? undefined}
            className={`${PRIMARY_ACTION} w-fit`}
            download
          >
            Download your file
          </a>
          {state.file.expires_at && (
            <p className="text-[14px] text-slate-600">
              The link works until {formatDate(state.file.expires_at)}.
            </p>
          )}
        </div>
      )}
      {state.phase === 'expired' && (
        <p className="text-[14px] text-slate-600">
          That download link has expired. Ask for a new copy.
        </p>
      )}
      {state.phase === 'error' && <Alert variant="error">{state.message}</Alert>}
      {state.phase !== 'ready' && (
        <Button
          fullWidth={false}
          className="self-start"
          isLoading={state.phase === 'preparing' || state.phase === 'requesting'}
          onClick={() => void request()}
        >
          Download my data
        </Button>
      )}
    </Section>
  );
};

const DeleteAccount = ({ initial }: { initial: AccountDeletion | undefined }) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string>();
  const [deletion, setDeletion] = useState(initial);

  const ask = () => {
    if (password.trim() === '') {
      setPasswordError('Enter your password to confirm.');
      return;
    }
    setPasswordError(undefined);
    setIsConfirming(true);
  };

  const run = async (action: () => Promise<AccountDeletion>) => {
    setError(undefined);
    setIsWorking(true);
    try {
      setDeletion(await action());
      setPassword('');
    } catch (actionError) {
      setError(describeError(actionError));
    } finally {
      setIsWorking(false);
      setIsConfirming(false);
    }
  };

  const remove = () =>
    run(() => privacyApi.requestDeletion({ password, reason: reason.trim() || null }));

  if (deletion?.status === 'scheduled') {
    return (
      <Section title="Delete your account">
        <p className="text-[15px] text-slate-700">
          Your account will be deleted on {formatDate(deletion.scheduled_for)}.
        </p>
        {error && <Alert variant="error">{error}</Alert>}
        <Button
          fullWidth={false}
          className="self-start"
          isLoading={isWorking}
          onClick={() => void run(() => privacyApi.cancelDeletion())}
        >
          Cancel deletion
        </Button>
      </Section>
    );
  }

  return (
    <Section title="Delete your account">
      {deletion?.status === 'cancelled' && (
        <Alert variant="success">Your account will not be deleted.</Alert>
      )}
      <p className="text-[15px] text-slate-700">
        We wait 30 days before deleting anything, so you can change your mind. After that, your
        account, answers and results are erased.
      </p>
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={passwordError}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Textarea
        label="Why are you leaving? (optional)"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button variant="secondary" fullWidth={false} className="self-start" onClick={ask}>
        Delete my account
      </Button>
      <Dialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        title="Delete your account?"
        description="Your account will be deleted in 30 days. You can cancel before then."
        footer={
          <>
            <Button
              variant="transparent"
              border="solid"
              fullWidth={false}
              onClick={() => setIsConfirming(false)}
            >
              Keep my account
            </Button>
            <Button
              variant="secondary"
              fullWidth={false}
              isLoading={isWorking}
              onClick={() => void remove()}
            >
              Delete my account
            </Button>
          </>
        }
      />
    </Section>
  );
};

// A deletion scheduled earlier (in another session too) shows after a reload, so it can be
// cancelled. 404: never asked. A cancelled request from before is history: the form shows.
const loadDeletion = async () => {
  try {
    const deletion = await privacyApi.getDeletion();
    return deletion.status === 'scheduled' ? deletion : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
};

const DeleteAccountSection = () => {
  const { state, retry } = useRequest(loadDeletion);

  if (state.status === 'success') return <DeleteAccount initial={state.data} />;

  return (
    <Section title="Delete your account">
      {state.status === 'loading' ? (
        <PageLoader title="Loading your account deletion" />
      ) : (
        <LoadFailed error={state.error} onRetry={retry} />
      )}
    </Section>
  );
};

const ConsentSections = ({ initial }: { initial: readonly Consent[] }) => {
  const [items, setItems] = useState(initial);

  const granted = useCallback(
    (key: ConsentKey) => items.some((item) => item.key === key && item.granted),
    [items],
  );

  const update = useCallback(async (change: ConsentChange) => {
    const reply = await privacyApi.updateConsents([change]);
    setItems(reply.items);
  }, []);

  return (
    <>
      <ResultsSharing granted={granted} update={update} />
      <EmailChoices granted={granted} update={update} />
    </>
  );
};

const loadConsents = () => privacyApi.getConsents();

interface PrivacyCentreProps {
  readonly pollInterval?: number;
}

export const PrivacyCentre = ({ pollInterval = 3000 }: PrivacyCentreProps) => {
  const { state, retry } = useRequest(loadConsents);

  let consents: ReactNode;

  if (state.status === 'loading') {
    consents = <PageLoader title="Loading your privacy settings" />;
  } else if (state.status === 'error') {
    consents = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    consents = <ConsentSections initial={state.data.items} />;
  }

  return (
    <div className="flex w-full max-w-[860px] flex-col gap-6 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Privacy centre</h1>
        <p className="text-[15px] text-slate-600">
          Choose who sees your results, what we may email you about, and what happens to your data.
        </p>
      </header>
      {consents}
      <DataDownload pollInterval={pollInterval} />
      <DeleteAccountSection />
    </div>
  );
};
