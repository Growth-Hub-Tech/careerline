import specText from '../../../docs/openapi.json?raw';
import { API_ROUTES } from './routes';

interface Spec {
  readonly paths: Readonly<Record<string, unknown>>;
}

const PREFIX = '/api/v1';

// Every path the API documents, as a pattern: {organisation_id} matches one path segment
const documented = Object.keys((JSON.parse(specText) as Spec).paths)
  .filter((path) => path.startsWith(PREFIX))
  .map((path) => new RegExp(`^${path.slice(PREFIX.length).replace(/\{[^}]+\}/g, '[^/]+')}$`));

type Route = string | ((...args: never[]) => string) | { readonly [name: string]: Route };

// Each route with its name, built with sample ids where it takes some
const flatten = (routes: Route, name: string): [string, string][] => {
  if (typeof routes === 'string') return [[name, routes]];
  if (typeof routes === 'function') {
    const build = routes as (...args: unknown[]) => string;
    return [[name, build(...Array.from({ length: build.length }, () => 7))]];
  }
  return Object.entries(routes).flatMap(([key, value]) => flatten(value, `${name}.${key}`));
};

describe('API routes', () => {
  it.each(flatten(API_ROUTES, 'API_ROUTES'))('%s is a path the API documents', (_name, path) => {
    expect(documented.some((pattern) => pattern.test(path))).toBe(true);
  });

  it('puts text from a link into the path safely', () => {
    expect(API_ROUTES.invitations.byToken('a/b c')).toBe('/invitations/token/a%2Fb%20c');
    expect(API_ROUTES.payments.detail('ref#1')).toBe('/payments/ref%231');
  });
});
