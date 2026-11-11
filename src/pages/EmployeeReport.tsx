import { useQueries } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DecisionNote } from '../components/DecisionNote';
import { QueryState } from '../components/PageState';
import { ProgrammeCard } from '../components/ProgrammeCard';
import { StatusLabel } from '../components/StatusLabel';
import type { HeatmapCell, RoleSkill, Target, TeamMember } from '../lib/api';
import {
  combineResults,
  organisationQueries,
  programmeQueries,
  roleQueries,
} from '../lib/api/queries';
import { MEMBER_STATUS } from '../lib/organisation/labels';
import { compareToStandard } from '../lib/organisation/levels';
import { LEVEL_LABELS } from '../lib/tests/catalog';

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

const ERROR_SPACING = 'mx-5 my-10 sm:mx-20';

interface MemberReportProps {
  readonly person: TeamMember;
  readonly cells: readonly HeatmapCell[];
  readonly targets: readonly Target[];
}

// The person's role says which skills to show and which programmes close the gaps
const MemberReport = ({ person, cells, targets }: MemberReportProps) => {
  const role = useQueries({
    queries: [roleQueries.detail(person.role_id), programmeQueries.forRole(person.role_id)],
    combine: combineResults,
  });

  return (
    <QueryState query={role} loadingTitle="Loading the report" errorClassName={ERROR_SPACING}>
      {([{ skills }, programmes]) => (
        <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
          <Link
            to="/team/heatmap"
            className="w-fit text-[14px] font-medium text-indigo-700 underline hover:text-indigo-900"
          >
            Back to the heatmap
          </Link>
          <header className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-slate-500">Employee report</p>
            <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">
              {person.full_name}
            </h1>
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
              <h2 className="text-[20px] font-bold text-slate-800">
                Programmes that close the gaps
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programmes.map((programme) => (
                  <ProgrammeCard
                    key={programme.programme_id}
                    programme={programme}
                    headingLevel={3}
                  />
                ))}
              </div>
            </section>
          )}

          <DecisionNote benchmark="The role standard is the level the role needs at its mid title. Company targets are the ones your organisation set." />
        </div>
      )}
    </QueryState>
  );
};

const MemberDetails = ({ id }: { id: number }) => {
  const team = useQueries({
    queries: [
      organisationQueries.members(),
      organisationQueries.heatmap('member'),
      organisationQueries.targets(),
    ],
    combine: combineResults,
  });

  return (
    <QueryState query={team} loadingTitle="Loading the report" errorClassName={ERROR_SPACING}>
      {([members, heatmap, targets]) => {
        const person = members.find((item) => item.member_id === id);
        if (!person) return <Navigate to="/page-not-found" replace />;

        return (
          <MemberReport
            person={person}
            cells={heatmap.rows.find((item) => item.key === String(id))?.cells ?? []}
            targets={targets.items.filter((item) => item.role_id === person.role_id)}
          />
        );
      }}
    </QueryState>
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
