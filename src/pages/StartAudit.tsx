import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { TextField } from '../components/TextField';
import { organisationsApi, type Organisation, type TeamMember } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';

const load = async () => {
  const organisation = await organisationsApi.me();
  const members = await organisationsApi.listMembers(organisation.organisation_id);
  return { organisation, members };
};

const people = (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`;

const rolesOf = (members: readonly TeamMember[]) => {
  const roles = new Map<number, { title: string; count: number }>();
  members.forEach(({ role_id, role_title }) => {
    const role = roles.get(role_id) ?? { title: role_title, count: 0 };
    roles.set(role_id, { ...role, count: role.count + 1 });
  });
  return [...roles.entries()].map(([roleId, role]) => ({ roleId, ...role }));
};

interface AuditFormProps {
  readonly organisation: Organisation;
  readonly members: readonly TeamMember[];
}

const AuditForm = ({ organisation, members }: AuditFormProps) => {
  const navigate = useNavigate();
  const roles = rolesOf(members);
  const [name, setName] = useState('');
  const [chosen, setChosen] = useState<readonly number[]>(roles.map((role) => role.roleId));
  const [error, setError] = useState<string>();
  const [isSending, setIsSending] = useState(false);

  const invited = members.filter((item) => chosen.includes(item.role_id)).length;
  const hasSeats = invited <= organisation.seats_total;
  const canSend = name.trim() !== '' && invited > 0 && hasSeats;

  const toggle = (roleId: number) =>
    setChosen((current) =>
      current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
    );

  const send = async () => {
    setIsSending(true);
    setError(undefined);
    try {
      const audit = await organisationsApi.startAudit(organisation.organisation_id, {
        name: name.trim(),
        role_ids: [...chosen],
        send_invitations: true,
      });
      navigate(`/team/audits/${audit.audit_id}`);
    } catch (sendError) {
      setError(describeError(sendError));
      setIsSending(false);
    }
  };

  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}
      <TextField
        label="Audit name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-[14px] font-medium text-slate-800">Roles to test</legend>
        {roles.map((role) => (
          <Checkbox
            key={role.roleId}
            label={`${role.title} (${people(role.count)})`}
            checked={chosen.includes(role.roleId)}
            onChange={() => toggle(role.roleId)}
          />
        ))}
      </fieldset>
      {!hasSeats && (
        <Alert variant="warning">
          <span className="flex flex-wrap gap-x-2">
            <span>
              You need {invited} seats but have {organisation.seats_total}.
            </span>
            <Link
              to={`/pricing?return=${encodeURIComponent('/team/audits/new')}`}
              className="font-medium underline"
            >
              Buy seats
            </Link>
          </span>
        </Alert>
      )}
      <Button
        fullWidth={false}
        className="self-start"
        disabled={!canSend}
        isLoading={isSending}
        onClick={send}
      >
        Send invitations to {people(invited)}
      </Button>
    </div>
  );
};

export const StartAudit = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your team" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else if (state.data.members.length === 0) {
    content = (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-slate-600">
          Upload your staff list before you start an audit.
        </p>
        <Link to="/team/import" className={`${SECONDARY_ACTION} w-fit`}>
          Upload staff list
        </Link>
      </div>
    );
  } else {
    content = <AuditForm organisation={state.data.organisation} members={state.data.members} />;
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Start an audit</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Everyone in the roles you choose gets an email with a link to their test.
        </p>
      </header>
      {content}
    </div>
  );
};
