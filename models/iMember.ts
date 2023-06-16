export interface Member {
  walletAddress: string;
  telegramUsername: string;
  isActiveVoter: boolean;
  // bool hasJoinedPeriod;
  latestPeriodParticipation: number;
}
