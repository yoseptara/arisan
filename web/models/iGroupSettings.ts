import { Member } from './iMember';

export interface GroupSettings {
  title: string;
  telegramGroupUrl: string;
  coordinator: Member;
  coordinatorCommissionPercentage: number;
  contributionAmountInWei: bigint;
  prizePercentage: number;
}
