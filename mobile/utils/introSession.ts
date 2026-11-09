/**
 * Session manager for Circlee intro animation.
 * Ensures the animated video plays only once per app launch session.
 */
let hasPlayedThisSession = false;

export const introSession = {
  hasPlayed: (): boolean => hasPlayedThisSession,
  markPlayed: (): void => {
    hasPlayedThisSession = true;
  },
  reset: (): void => {
    hasPlayedThisSession = false;
  },
};
