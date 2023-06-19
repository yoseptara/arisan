import { Member } from './iMember';

interface Period {
  index: bigint;
  startedAt: Date;
  endedAt: Date | null;
  totalContributionInWei: bigint;
  contributionAmountInWei: bigint;
  prizeForEachWinnerInWei: bigint;
  rounds: Round[];
  dueWinners: Member[];
}

interface Round {
  drawnAt: Date | null;
  winner: Member | null;
  contributorCount: number;
}

export type { Round, Period };
