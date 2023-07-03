import { Member } from './iMember';

interface Period {
  index: bigint;
  startedAtTimestamp: number;
  endedAtTimestamp: number;
  totalContributionInWei: bigint;
  contributionAmountInWei: bigint;
  prizeForEachWinnerInWei: bigint;
  rounds: Round[];
  dueWinners: Member[];
}

interface Round {
  drawnAtTimestamp: number;
  winner: Member | null;
  contributorCount: number;
}

export type { Round, Period };
