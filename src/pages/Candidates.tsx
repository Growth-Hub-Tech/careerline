import { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { CreditsStrip } from '../components/CreditsStrip';
import { Dialog } from '../components/Dialog';
import { PageLoader } from '../components/Loader';
import { Select } from '../components/Select';
import { StatusLabel } from '../components/StatusLabel';
import { Table, type TableColumn } from '../components/Table';
import { TextField } from '../components/TextField';
import {
  catalogApi,
  invitationsApi,
  recruiterApi,
  type AssessmentSummary,
  type Candidate,
  type Invitation,
} from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { INVITATION_STATUS, SHORTLIST_LIMIT } from '../lib/recruiter/invitations';

const STATUS_FILTERS = [
  { value: 'all', label: 'All tests' },
  ...Object.entries(INVITATION_STATUS).map(([value, { label }]) => ({ value, label })),
];

const EXPIRY_OPTIONS = [3, 7, 14, 30].map((days) => ({
  value: String(days),
  label: `${days} days`,
}));

const CANCELLABLE: readonly Invitation['status'][] = ['sent', 'accepted'];

const assignSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter the candidate’s name'),
  email: z.string().trim().email('Enter a valid email address'),
  testId: z.string().min(1, 'Pick the test to send'),
  expiresInDays: z.string(),
});

type AssignValues = z.infer<typeof assignSchema>;

const load = async () => {
  const [candidates, invitations, tests] = await Promise.all([
    recruiterApi.listCandidates(),
    invitationsApi.list(),
    catalogApi.listTests(),
  ]);
  return { candidates, invitations, tests };
};

interface AssignFormProps {
  readonly tests: readonly AssessmentSummary[];
  readonly candidates: readonly Candidate[];
  readonly onSent: (invitation: Invitation, candidate: Candidate) => void;
}

const AssignForm = ({ tests, candidates, onSent }: AssignFormProps) => {
  const headingId = useId();
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const isFull = candidates.length >= SHORTLIST_LIMIT;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { fullName: '', email: '', testId: '', expiresInDays: '7' },
  });

  const submit = handleSubmit(async (values) => {
    setError(undefined);
    setSentTo(undefined);
    const test = tests.find((item) => String(item.test_id) === values.testId);
    if (!test) return;

    try {
      const email = values.email.trim();
      const known = candidates.find((item) => item.email.toLowerCase() === email.toLowerCase());
      const person =
        known ??
        (await recruiterApi.addCandidate({
          full_name: values.fullName.trim(),
          email,
          role_id: test.role_ids[0] ?? null,
        }));
      const sent = await invitationsApi.send({
        kind: 'candidate',
        full_name: person.full_name,
        email: person.email,
        test_id: test.test_id,
        candidate_id: person.candidate_id,
        expires_in_days: Number(values.expiresInDays),
      });
      onSent(sent, person);
      setSentTo(person.full_name);
      reset();
    } catch (sendError) {
      setError(describeError(sendError));
    }
  });

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
          Send a test
        </h2>
        <p className="text-[14px] text-slate-600">
          {candidates.length} of {SHORTLIST_LIMIT} candidates on your shortlist.
        </p>
      </div>
      {isFull && (
        <Alert variant="warning">
          Your shortlist is full. It holds up to {SHORTLIST_LIMIT} candidates.
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}
      {sentTo && <Alert variant="success">Test sent to {sentTo}.</Alert>}
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Test"
          placeholder="Choose a test"
          options={tests.map((test) => ({ value: String(test.test_id), label: test.title }))}
          error={errors.testId?.message}
          {...register('testId')}
        />
        <Select label="Link works for" options={EXPIRY_OPTIONS} {...register('expiresInDays')} />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            fullWidth={false}
            isLoading={isSubmitting}
            disabled={isFull}
            className="self-start"
          >
            Send test
          </Button>
        </div>
      </form>
    </section>
  );
};

interface SentTestsProps {
  readonly invitations: readonly Invitation[];
  readonly onCancel: (invitation: Invitation) => void;
}

const SentTests = ({ invitations, onCancel }: SentTestsProps) => {
  const headingId = useId();
  const [filter, setFilter] = useState('all');
  const shown =
    filter === 'all' ? invitations : invitations.filter((item) => item.status === filter);

  const columns: readonly TableColumn<Invitation>[] = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.full_name}</span>
          <span className="text-[13px] text-slate-500">{row.email}</span>
        </span>
      ),
    },
    { key: 'test', header: 'Test', render: (row) => row.test_title },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusLabel status={INVITATION_STATUS[row.status].tone}>
          {INVITATION_STATUS[row.status].label}
        </StatusLabel>
      ),
    },
    { key: 'sent', header: 'Sent', render: (row) => formatDate(row.sent_at) },
    { key: 'expires', header: 'Link expires', render: (row) => formatDate(row.expires_at) },
    {
      key: 'action',
      header: 'Action',
      render: (row) => {
        if (row.status === 'completed' && row.candidate_id !== null) {
          return (
            <Link
              to={`/candidates/${row.candidate_id}`}
              className="font-medium text-indigo-700 underline hover:text-indigo-900"
            >
              View report
            </Link>
          );
        }
        if (CANCELLABLE.includes(row.status)) {
          return (
            <Button
              variant="transparent"
              border="solid"
              fullWidth={false}
              onClick={() => onCancel(row)}
            >
              Cancel test
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
          Tests sent
        </h2>
        {invitations.length > 0 && (
          <div className="w-full sm:w-56">
            <Select
              label="Show"
              options={STATUS_FILTERS}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
        )}
      </div>
      {invitations.length === 0 ? (
        <p className="text-[15px] text-slate-600">No tests sent yet.</p>
      ) : (
        <Table
          caption="Tests sent"
          columns={columns}
          rows={shown}
          getRowKey={(row) => String(row.invitation_id)}
          empty="No tests with this status."
        />
      )}
    </section>
  );
};

interface CancelDialogProps {
  readonly invitation: Invitation | null;
  readonly onClose: () => void;
  readonly onCancelled: (invitation: Invitation) => void;
}

const CancelDialog = ({ invitation, onClose, onCancelled }: CancelDialogProps) => {
  const [error, setError] = useState<string>();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setError(undefined);
    setIsCancelling(false);
  }, [invitation]);

  if (!invitation) return null;

  const cancel = async () => {
    setIsCancelling(true);
    setError(undefined);
    try {
      onCancelled(await invitationsApi.revoke(invitation.invitation_id));
    } catch (cancelError) {
      setError(describeError(cancelError));
      setIsCancelling(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Cancel this test?"
      description={`${invitation.full_name} will no longer be able to open the link for ${invitation.test_title}.`}
      footer={
        <>
          <Button variant="transparent" border="solid" fullWidth={false} onClick={onClose}>
            Keep it
          </Button>
          <Button fullWidth={false} isLoading={isCancelling} onClick={cancel}>
            Cancel test
          </Button>
        </>
      }
    >
      {error && <Alert variant="error">{error}</Alert>}
    </Dialog>
  );
};

interface WorkspaceProps {
  readonly tests: readonly AssessmentSummary[];
  readonly initialCandidates: readonly Candidate[];
  readonly initialInvitations: readonly Invitation[];
}

const Workspace = ({ tests, initialCandidates, initialInvitations }: WorkspaceProps) => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [cancelling, setCancelling] = useState<Invitation | null>(null);

  const addSent = useCallback((sent: Invitation, person: Candidate) => {
    setInvitations((current) => [sent, ...current]);
    setCandidates((current) =>
      current.some((item) => item.candidate_id === person.candidate_id)
        ? current
        : [...current, person],
    );
  }, []);

  const replace = (updated: Invitation) => {
    setInvitations((current) =>
      current.map((item) => (item.invitation_id === updated.invitation_id ? updated : item)),
    );
    setCancelling(null);
  };

  return (
    <>
      <AssignForm tests={tests} candidates={candidates} onSent={addSent} />
      <SentTests invitations={invitations} onCancel={setCancelling} />
      <CancelDialog
        invitation={cancelling}
        onClose={() => setCancelling(null)}
        onCancelled={replace}
      />
    </>
  );
};

export const Candidates = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your candidates" className="flex-1" />;
  } else if (state.status === 'error') {
    content = (
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  } else {
    content = (
      <Workspace
        tests={state.data.tests}
        initialCandidates={state.data.candidates}
        initialInvitations={state.data.invitations}
      />
    );
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Candidates</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Send a role-specific test to a candidate and follow it until their report is ready.
        </p>
      </header>
      <CreditsStrip returnTo="/candidates" />
      {content}
    </div>
  );
};
