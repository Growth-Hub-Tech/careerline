import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthHeader, ROLES } from '../Auth';
import { createDevSession, useSession } from '../../lib/session';
import { Button } from '../Button';

export const GetStarted = () => {
  const navigate = useNavigate();
  const { session, signIn } = useSession();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chosen = new FormData(e.currentTarget).get('role');
    const role = ROLES.find((r) => r.key === chosen);
    if (!role) return;
    if (session) {
      signIn({ ...session, user: { ...session.user, userType: role.key } });
    } else if (import.meta.env.DEV) {
      signIn(createDevSession(role.key));
    }
    navigate(role.nextPath);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <AuthHeader />

      <main className="flex flex-1 justify-center px-5 py-12 sm:px-8 sm:py-16 lg:py-[120px]">
        <form className="w-full max-w-108" onSubmit={onSubmit}>
          <fieldset>
            <legend className="max-w-75 font-heading text-[24px] leading-tight font-bold text-slate-950 sm:text-[26px]">
              How are you planning to use Careerline?
            </legend>

            <div className="mt-8 flex flex-col gap-4">
              {ROLES.map(({ key, title, description, icon: Icon, iconClass }) => (
                <label
                  key={key}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600 sm:gap-5 sm:p-5"
                >
                  <input type="radio" name="role" value={key} required className="sr-only" />
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[18px] font-semibold text-slate-950">
                      {title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.4] text-slate-600">
                      {description}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-slate-600 transition-colors group-has-[:checked]:border-indigo-600"
                  >
                    <span className="size-2.5 scale-0 rounded-full bg-indigo-600 transition-transform group-has-[:checked]:scale-100" />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" fullWidth={false} className="mt-8">
            Continue
          </Button>
        </form>
      </main>
    </div>
  );
};
