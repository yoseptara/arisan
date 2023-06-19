import { Member } from './iMember';

export interface GroupSettings {
  title: string;
  telegramGroupUrl: string;
  coordinator: Member;
  coordinatorRewardPercentage: number;
  contributionAmountInWei: bigint;
  prizePercentage: number;
}
