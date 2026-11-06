import { useCallback } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DecisionNote } from '../components/DecisionNote';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { ProgrammeCard } from '../components/ProgrammeCard';
import { StatusLabel } from '../components/StatusLabel';
import {
  organisationsApi,
  programmesApi,
  rolesApi,
  type HeatmapCell,
  type RoleSkill,
  type Target,
} from '../lib/api';
import { useRequest } from '../lib/hooks/useRequest';
import { MEMBER_STATUS } from '../lib/organisation/labels';
import { compareToStandard } from '../lib/organisation/levels';
import { LEVEL_LABELS } from '../lib/tests/catalog';

class MemberNotFound extends Error {}

const loadReport = async (memberId: number) => {
  const organisation = await organisationsApi.me();
  const id = organisation.organisation_id;
  const [members, heatmap, targets] = await Promise.all([
    organisationsApi.listMembers(id),
    organisationsApi.heatmap(id, 'member'),
    organisationsApi.getTargets(id),
  ]);
  const person = members.find((item) => item.member_id === memberId);
  if (!person) throw new MemberNotFound();

  const [role, programmes] = await Promise.all([
    rolesApi.get(person.role_id),
    programmesApi.listForRole(person.role_id),
  ]);
  const row = heatmap.rows.find((item) => item.key === String(memberId));

  return {
    person,
    skills: role.skills,
    cells: row?.cells ?? [],
    targets: targets.items.filter((item) => item.role_id === person.role_id),
    programmes,
  };
};

interface SkillRowProps {
  readonly skill: RoleSkill;
  readonly cell: HeatmapCell | undefined;
  readonly target: Target | undefined;
}

const SkillRow = ({ skill, cell, target }: SkillRowProps) => {
  const level = cell?.level ?? null;
  const current =
    level && cell?.average_score !== null && cell?.average_score !== undefined
      ? `${LEVEL_LABELS[level]} (${Math.round(cell.average_score)})`
      : 'Not tested yet';

  return (
    <tr className="border-t border-slate-100">
      <th scope="row" className="px-4 py-3 text-left font-medium text-slate-800">
        {skill.skill_name}
      </th>
      <td className="px-4 py-3 text-slate-800">{current}</td>
      <td className="px-4 py-3 text-slate-800">{compareToStandard(level, skill.target_level)}</td>
      <td className="px-4 py-3 text-slate-800">
        {target ? compareToStandard(level, target.target_level) : 'No target set'}
      </td>
    </tr>
  );
};

const MemberDetails = ({ id }: { id: number }) => {
  const load = useCallback(() => loadReport(id), [id]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the report" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (state.error instanceof MemberNotFound) return <Navigate to="/page-not-found" replace />;
    return (
      <div className="px-5 py-10 sm:px-20">
        <LoadFailed error={state.error} onRetry={retry} />
      </div>
    );
  }

  const { person, skills, cells, targets, programmes } = state.data;

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <Link
        to="/team/heatmap"
        className="w-fit text-[14px] font-medium text-indigo-700 underline hover:text-indigo-900"
      >
        Back to the heatmap
      </Link>
      <header className="flex flex-col gap-2">
        <p className="text-[14px] font-medium text-slate-500">Employee report</p>
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">{person.full_name}</h1>
        <p className="text-[16px] text-slate-600">
          {[person.role_title, person.department].filter(Boolean).join(' · ')}
        </p>
        <StatusLabel status={MEMBER_STATUS[person.status].tone} className="w-fit">
          {MEMBER_STATUS[person.status].label}
        </StatusLabel>
      </header>

      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-[14px]">
          <caption className="sr-only">Skills against standards</caption>
          <thead className="bg-gray-50 text-left text-[13px] text-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Skill
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Current level
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Role standard
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Company target
              </th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <SkillRow
                key={skill.skill_id}
                skill={skill}
                cell={cells.find((item) => item.skill_id === skill.skill_id)}
                target={targets.find((item) => item.skill_id === skill.skill_id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {programmes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-[20px] font-bold text-slate-800">Programmes that close the gaps</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.programme_id} programme={programme} headingLevel={3} />
            ))}
          </div>
        </section>
      )}

      <DecisionNote benchmark="The role standard is the level the role needs at its mid title. Company targets are the ones your organisation set." />
    </div>
  );
};

export const EmployeeReport = () => {
  const { memberId } = useParams();
  const id = Number(memberId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <MemberDetails key={id} id={id} />;
};
