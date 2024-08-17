export const createLeagueIdString = leagues => {
  const baseUrls = [
    'https://football-stats-fixtures-vb.vercel.app/api/fixtures/',
    'https://football-stats-fixtures-vb.vercel.app/api/events/',
    'https://football-stats-fixtures-vb.vercel.app/api/statistics/'
  ];

  const leagueIds = Object.keys(leagues);
  const urlStrings = leagueIds.flatMap(leagueId =>
    baseUrls.map(url => `${url}${leagueId}`)
  );

  return urlStrings;
};
