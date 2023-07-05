import { Member } from './iMember';

enum ProposalCategory {
  title = 0,
  telegramGroup = 1,
  coordinatorCommissionPercentage = 2,
  contributionAmount = 3,
  prizePercentage = 4,
  newMember = 5,
  coordinator = 6,
  transfer = 7
}

// interface GroupProposals {
//   incompleteProposalsCount: number;
//   proposals: Proposal[];
// }

interface Proposal {
  index: number;
  category: ProposalCategory;
  proposedAtTimestamp: number;
  proposer: Member;
  completedAtTimestamp: number;
  isApproved: boolean;
  approvers: Member[];
  stringProposalValue: string;
  uintProposalValue: number;
  coordinatorProposalValue: Member;
  newMemberProposalValue: NewMemberVal;
  transferProposalValue: TransferVal;
}

interface NewMemberVal {
  memberAddress: string;
  telegramUsername: string;
}

interface TransferVal {
  recipient: string;
  transferAmount: number;
}

// Export the enum normally
export { ProposalCategory };

export type { Proposal, NewMemberVal, TransferVal };
