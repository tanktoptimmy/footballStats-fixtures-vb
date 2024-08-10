export const createLeagueIdString = leagues =>
  Object.keys(leagues)
    .map(lg => lg)
    .join('::')
