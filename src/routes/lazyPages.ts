import { lazy } from 'react';

export const Pricing = lazy(() =>
  import('../pages/Pricing').then((page) => ({ default: page.Pricing })),
);
export const Credits = lazy(() =>
  import('../pages/Credits').then((page) => ({ default: page.Credits })),
);
export const PaymentCheck = lazy(() =>
  import('../pages/PaymentCheck').then((page) => ({ default: page.PaymentCheck })),
);
export const PrivacyCentre = lazy(() =>
  import('../pages/PrivacyCentre').then((page) => ({ default: page.PrivacyCentre })),
);
export const Billing = lazy(() =>
  import('../pages/Billing').then((page) => ({ default: page.Billing })),
);
export const Reports = lazy(() =>
  import('../pages/Reports').then((page) => ({ default: page.Reports })),
);
export const Report = lazy(() =>
  import('../pages/Report').then((page) => ({ default: page.Report })),
);
export const Candidates = lazy(() =>
  import('../pages/Candidates').then((page) => ({ default: page.Candidates })),
);
export const CandidateReport = lazy(() =>
  import('../pages/CandidateReport').then((page) => ({ default: page.CandidateReport })),
);
export const TeamAudits = lazy(() =>
  import('../pages/TeamAudits').then((page) => ({ default: page.TeamAudits })),
);
export const StaffUpload = lazy(() =>
  import('../pages/StaffUpload').then((page) => ({ default: page.StaffUpload })),
);
export const StartAudit = lazy(() =>
  import('../pages/StartAudit').then((page) => ({ default: page.StartAudit })),
);
export const AuditProgress = lazy(() =>
  import('../pages/AuditProgress').then((page) => ({ default: page.AuditProgress })),
);
export const TeamHeatmap = lazy(() =>
  import('../pages/TeamHeatmap').then((page) => ({ default: page.TeamHeatmap })),
);
export const EmployeeReport = lazy(() =>
  import('../pages/EmployeeReport').then((page) => ({ default: page.EmployeeReport })),
);
export const CompanyTargets = lazy(() =>
  import('../pages/CompanyTargets').then((page) => ({ default: page.CompanyTargets })),
);
