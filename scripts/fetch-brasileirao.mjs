// Fetches real Campeonato Brasileiro Série A data (standings + current round's
// matches/results) via the open-source `campeonato-brasileiro-api` package and
// writes a small, stable-shaped JSON snapshot to data/brasileirao.json.
//
// This file is what InvestBola's Supabase sync actually reads — over a plain
// `net.http_get` to this repo's raw.githubusercontent.com URL, no API key or
// hosted server required — the same free-tier-friendly pattern already used
// for the Transfermarkt sync.
import { getCompetition } from 'campeonato-brasileiro-api';
import { writeFile, mkdir } from 'node:fs/promises';

function mapTeam(t) {
  if (!t) return null;
  return { name: t.name, shortName: t.shortName || null, badge: t.badge || null };
}

function mapMatch(m) {
  return {
    id: m.id,
    round: m.round,
    dateTime: m.dateTime,
    status: m.status, // 'scheduled' | 'live' | 'finished' (as reported by the source)
    venue: m.venue || null,
    home: mapTeam(m.homeTeam),
    away: mapTeam(m.awayTeam),
    scoreHome: m.score ? m.score.home : null,
    scoreAway: m.score ? m.score.away : null,
  };
}

function mapEntry(e) {
  return {
    position: e.position,
    team: mapTeam(e.team),
    points: e.points,
    matches: e.matches,
    wins: e.wins,
    draws: e.draws,
    losses: e.losses,
    goalsFor: e.goalsFor,
    goalsAgainst: e.goalsAgainst,
    goalDifference: e.goalDifference,
    recentForm: e.recentForm || [],
  };
}

async function main() {
  const data = await getCompetition('a');
  const table = data.tables && data.tables[0];
  const round = data.rounds && data.rounds[0];

  const snapshot = {
    updatedAt: new Date().toISOString(),
    competitionName: data.competition && data.competition.name,
    round: round ? { number: round.number, total: round.total, label: round.label } : null,
    standings: table ? table.entries.map(mapEntry) : [],
    matches: round ? round.matches.map(mapMatch) : [],
  };

  await mkdir(new URL('../data', import.meta.url), { recursive: true });
  await writeFile(
    new URL('../data/brasileirao.json', import.meta.url),
    JSON.stringify(snapshot, null, 2) + '\n',
    'utf8'
  );

  console.log(`Wrote ${snapshot.matches.length} matches and ${snapshot.standings.length} standings rows (round ${snapshot.round ? snapshot.round.number : '?'}).`);
}

main().catch(err => {
  console.error('Failed to fetch Brasileirão data:', err);
  process.exit(1);
});
