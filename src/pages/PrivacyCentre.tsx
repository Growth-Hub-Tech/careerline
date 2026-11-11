import { useCallback, useId, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Dialog } from '../components/Dialog';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed, QueryState } from '../components/PageState';
import { Textarea } from '../components/Textarea';
import { TextField } from '../components/TextField';
import type { AccountDeletion, Consent, ConsentChange, DataExport } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import {
  privacyQueries,
  useCancelDeletion,
  useRequestDeletion,
  useRequestExport,
  useUpdateConsents,
} from '../lib/api/queries';
import { formatDate } from '../lib/format';

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

// The file is made in the background: ask every 3 seconds until it is ready
const POLL_INTERVAL = 3000;

const isReady = (file: DataExport) => file.status === 'ready' && Boolean(file.download_url);

const isPreparing = (file: DataExport) => !isReady(file) && file.status !== 'expired';

const DataDownload = () => {
  const requestExport = useRequestExport();
  const exportId = requestExport.data?.export_id;
  const exportFile = useQuery({
    ...privacyQueries.dataExport(exportId ?? 0),
    enabled: exportId !== undefined,
    refetchInterval: ({ state }) =>
      state.status !== 'error' && state.data && isPreparing(state.data) ? POLL_INTERVAL : false,
  });

  const file = exportId === undefined ? undefined : exportFile.data;
  const error = requestExport.error ?? (exportFile.isError ? exportFile.error : null);
  const preparing = Boolean(file && isPreparing(file) && !exportFile.isError);

  return (
    <Section title="Download your data">
      <p className="text-[15px] text-slate-700">
        Get a copy of everything CareerLine holds about you: your account, answers and results.
      </p>
      {preparing && (
        <p role="status" className="text-[14px] text-slate-600">
          We are preparing your file. This can take a minute.
        </p>
      )}
      {file && isReady(file) && (
        <div className="flex flex-col gap-2">
          <a href={file.download_url ?? undefined} className={`${PRIMARY_ACTION} w-fit`} download>
            Download your file
          </a>
          {file.expires_at && (
            <p className="text-[14px] text-slate-600">
              The link works until {formatDate(file.expires_at)}.
            </p>
          )}
        </div>
      )}
      {file?.status === 'expired' && (
        <p className="text-[14px] text-slate-600">
          That download link has expired. Ask for a new copy.
        </p>
      )}
      {error && <Alert variant="error">{describeError(error)}</Alert>}
      {!(file && isReady(file)) && (
        <Button
          fullWidth={false}
          className="self-start"
          isLoading={preparing || requestExport.isPending}
          onClick={() => requestExport.mutate()}
        >
          Download my data
        </Button>
      )}
    </Section>
  );
};

// A cancelled request from before is history: the form shows, with a note only right after
// cancelling here
const DeleteAccount = ({ deletion }: { deletion: AccountDeletion | null }) => {
  const requestDeletion = useRequestDeletion();
  const cancelDeletion = useCancelDeletion();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [isConfirming, setIsConfirming] = useState(false);

  const ask = () => {
    if (password.trim() === '') {
      setPasswordError('Enter your password to confirm.');
      return;
    }
    setPasswordError(undefined);
    setIsConfirming(true);
  };

  const remove = () => {
    cancelDeletion.reset();
    requestDeletion.mutate(
      { password, reason: reason.trim() || null },
      { onSuccess: () => setPassword(''), onSettled: () => setIsConfirming(false) },
    );
  };

  const keep = () => {
    requestDeletion.reset();
    cancelDeletion.mutate();
  };

  if (deletion?.status === 'scheduled') {
    return (
      <Section title="Delete your account">
        <p className="text-[15px] text-slate-700">
          Your account will be deleted on {formatDate(deletion.scheduled_for)}.
        </p>
        {cancelDeletion.isError && (
          <Alert variant="error">{describeError(cancelDeletion.error)}</Alert>
        )}
        <Button
          fullWidth={false}
          className="self-start"
          isLoading={cancelDeletion.isPending}
          onClick={keep}
        >
          Cancel deletion
        </Button>
      </Section>
    );
  }

  return (
    <Section title="Delete your account">
      {cancelDeletion.isSuccess && (
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
      {requestDeletion.isError && (
        <Alert variant="error">{describeError(requestDeletion.error)}</Alert>
      )}
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
              isLoading={requestDeletion.isPending}
              onClick={remove}
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
// cancelled
const DeleteAccountSection = () => {
  const deletion = useQuery(privacyQueries.deletion());

  if (deletion.data !== undefined) return <DeleteAccount deletion={deletion.data} />;

  return (
    <Section title="Delete your account">
      {deletion.isError ? (
        <LoadFailed error={deletion.error} onRetry={() => void deletion.refetch()} />
      ) : (
        <PageLoader title="Loading your account deletion" />
      )}
    </Section>
  );
};

const ConsentSections = ({ items }: { items: readonly Consent[] }) => {
  const updateConsents = useUpdateConsents();

  const granted = useCallback(
    (key: ConsentKey) => items.some((item) => item.key === key && item.granted),
    [items],
  );

  const update = async (change: ConsentChange) => {
    await updateConsents.mutateAsync([change]);
  };

  return (
    <>
      <ResultsSharing granted={granted} update={update} />
      <EmailChoices granted={granted} update={update} />
    </>
  );
};

export const PrivacyCentre = () => {
  const consents = useQuery(privacyQueries.consents());

  return (
    <div className="flex w-full max-w-[860px] flex-col gap-6 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Privacy centre</h1>
        <p className="text-[15px] text-slate-600">
          Choose who sees your results, what we may email you about, and what happens to your data.
        </p>
      </header>
      <QueryState query={consents} loadingTitle="Loading your privacy settings" loaderClassName="">
        {({ items }) => <ConsentSections items={items} />}
      </QueryState>
      <DataDownload />
      <DeleteAccountSection />
    </div>
  );
};
