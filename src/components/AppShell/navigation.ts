import type { IconType } from 'react-icons';
import {
  LuChartColumn,
  LuClipboardCheck,
  LuWallet,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuListTodo,
  LuSettings,
  LuReceipt,
  LuShieldCheck,
  LuTag,
  LuTarget,
  LuUsers,
} from 'react-icons/lu';
import type { UserType } from '../../lib/session';

export interface NavEntry {
  readonly label: string;
  readonly path: string;
  readonly icon: IconType;
  readonly end?: boolean;
}

export interface UserNavigation {
  readonly main: readonly NavEntry[];
  readonly footer: readonly NavEntry[];
}

const DASHBOARD: NavEntry = { label: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard };
const CREDITS: NavEntry = { label: 'Credits', path: '/credits', icon: LuWallet };
const TASKS: NavEntry = { label: 'Tasks', path: '/tasks', icon: LuListTodo };

const FOOTER: readonly NavEntry[] = [
  { label: 'Support', path: '/support', icon: LuLifeBuoy },
  { label: 'Billing', path: '/billing', icon: LuReceipt },
  { label: 'Settings', path: '/settings', icon: LuSettings, end: true },
  { label: 'Privacy', path: '/settings/privacy', icon: LuShieldCheck },
];

export const NAV_BY_TYPE: Record<UserType, UserNavigation> = {
  beginner: {
    main: [DASHBOARD, { label: 'Assessment', path: '/assessment', icon: LuClipboardCheck }, TASKS],
    footer: FOOTER,
  },
  'self-test': {
    main: [
      DASHBOARD,
      { label: 'Skill tests', path: '/tests', icon: LuClipboardCheck },
      { label: 'Reports', path: '/reports', icon: LuChartColumn },
      CREDITS,
      TASKS,
    ],
    footer: FOOTER,
  },
  recruiter: {
    main: [DASHBOARD, { label: 'Candidates', path: '/candidates', icon: LuUsers }, CREDITS, TASKS],
    footer: FOOTER,
  },
  organization: {
    main: [
      DASHBOARD,
      { label: 'Team', path: '/team', icon: LuUsers, end: true },
      { label: 'Capability heatmap', path: '/team/heatmap', icon: LuChartColumn },
      { label: 'Targets', path: '/team/targets', icon: LuTarget },
      { label: 'Users', path: '/users', icon: LuUsers },
      { label: 'Plans', path: '/pricing', icon: LuTag },
      TASKS,
    ],
    footer: FOOTER,
  },
};
