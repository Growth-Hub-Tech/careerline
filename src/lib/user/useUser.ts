import { useUserStore } from './store';

// Who is signed in, for pages anyone can open (the public site, invitations, sign-in screens)
export const useUser = () => useUserStore((state) => state.user);

// For pages behind RequireAccess, which only renders them for a signed-in user
export const useCurrentUser = () => {
  const user = useUser();
  if (!user) throw new Error('useCurrentUser is only for pages behind RequireAccess');
  return user;
};
