import { Member } from './iMember';

interface Period {
  startedAt: Date;
  endedAt: Date | null;
  totalContributionInWei: number;
  contributionAmountInWei: number;
  prizeForEachWinnerInWei: number;
  rounds: Round[];
  dueWinners: Member[];
}

interface Round {
  drawnAt: Date | null;
  winner: Member | null;
  contributorCount: number;
}

export type { Round, Period };
