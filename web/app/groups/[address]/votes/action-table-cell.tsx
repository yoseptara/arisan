'use client';

import {
  EthersError,
  getParsedEthersError
} from '@enzoferey/ethers-error-parser';
import { ContractTransaction } from '@ethersproject/contracts';
import LoadingOverlay from '@root/components/LoadingOverlay';
import { useWeb3Context } from '@root/contexts';
import { getConnectedGroupContract } from '@root/lib/contracts';
import { Proposal, ProposalCategory } from '@root/models/iGroupProposals';
import { showSuccessToast } from '@root/utils/toastUtils';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ActionTableCellProps {
  proposalIndex: number;
  proposal: Proposal;
  groupAddress: string;
  className?: string;
}

const ActionTableCell: React.FC<ActionTableCellProps> = ({
  proposalIndex,
  proposal,
  groupAddress,
  className
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address, web3Provider } = useWeb3Context();

  if (!web3Provider) {
    toast.error('Hubungkan wallet anda terlebih dahulu');
    return (
      <td
        colSpan={2}
        className={`text-red-500 border-2 border-gray-500 px-4 py-2 ${
          className || ''
        }`}
      >
        Hubungkan wallet anda terlebih dahulu sebelum melakukan voting
      </td>
    );
  }

  const signer = web3Provider.getSigner();
  const connectedGroupContract = getConnectedGroupContract(
    signer,
    groupAddress
  );

  const approveBasedOnCategory = (
    proposal: Proposal
  ): Promise<ContractTransaction> => {
    switch (proposal.category) {
      case ProposalCategory.title: {
        return connectedGroupContract.approveNewTitleProposal(proposalIndex);
      }

      case ProposalCategory.telegramGroup:
        return connectedGroupContract.approveNewTelegramGroupUrlProposal(
          proposalIndex
        );
      case ProposalCategory.coordinatorCommissionPercentage:
        return connectedGroupContract.approveNewCoordinatorCommissionPercentageProposal(
          proposalIndex
        );
      case ProposalCategory.contributionAmount:
        return connectedGroupContract.approveContributionAmountProposal(
          proposalIndex
        );
      case ProposalCategory.prizePercentage:
        return connectedGroupContract.approvePrizePercentageProposal(
          proposalIndex
        );
      case ProposalCategory.newMember:
        return connectedGroupContract.approveNewMemberProposal(proposalIndex);
      case ProposalCategory.coordinator:
        return connectedGroupContract.approveNewCoordinatorProposal(
          proposalIndex
        );
      case ProposalCategory.transfer:
        return connectedGroupContract.approveTransferProposal(proposalIndex);
      default:
        throw new Error('Kategori proposal tidak diketahui');
    }
  };

  const rejectBasedOnCategory = (
    proposal: Proposal
  ): Promise<ContractTransaction> => {
    switch (proposal.category) {
      case ProposalCategory.title: {
        return connectedGroupContract.approveNewTitleProposal(proposalIndex);
      }

      case ProposalCategory.telegramGroup:
        return connectedGroupContract.rejectStringProposal(proposalIndex);
      case ProposalCategory.coordinatorCommissionPercentage:
        return connectedGroupContract.rejectUintProposal(proposalIndex);
      case ProposalCategory.contributionAmount:
        return connectedGroupContract.rejectUintProposal(proposalIndex);
      case ProposalCategory.prizePercentage:
        return connectedGroupContract.rejectUintProposal(proposalIndex);
      case ProposalCategory.newMember:
        return connectedGroupContract.rejectNewMemberProposal(proposalIndex);
      case ProposalCategory.coordinator:
        return connectedGroupContract.rejectNewCoordinatorProposal(
          proposalIndex
        );
      case ProposalCategory.transfer:
        return connectedGroupContract.rejectTransferProposal(proposalIndex);
      default:
        throw new Error('Kategori proposal tidak diketahui');
    }
  };

  const onApprove = async () => {
    if (window.confirm('Konfirmasi persetujuan anda.')) {
      try {
        setIsLoading(true);
        const tx = await approveBasedOnCategory(proposal);
        await tx.wait();
        showSuccessToast('Proposal berhasil disetujui');
        // window.location.reload();
        router.refresh();
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        const parsedEthersError = getParsedEthersError(err as EthersError);
        console.log(parsedEthersError);
        toast.error(parsedEthersError.context ?? 'Error');
        throw err;
      }
    }
  };

  const onReject = async () => {
    if (window.confirm('Konfirmasi penolakan anda.')) {
      try {
        setIsLoading(true);
        const tx = await rejectBasedOnCategory(proposal);
        await tx.wait();
        showSuccessToast('Proposal berhasil ditolak');
        router.refresh();
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        const parsedEthersError = getParsedEthersError(err as EthersError);
        console.log(parsedEthersError);
        toast.error(parsedEthersError.context ?? 'Error');
        throw err;
      }
    }
  };

  // console.log('cek approvers : ', proposal.approvers);

  if (
    proposal.approvers.some((approver) => approver.walletAddress === address)
  ) {
    return (
      <td
        colSpan={2}
        className={`border-2 border-gray-500 px-4 py-2 ${className || ''}`}
      >
        Anda sudah setuju
      </td>
    );
  }

  return (
    <>
      <td
        onClick={onApprove}
        className={`hover:underline border-2 border-gray-500 px-4 py-2 ${
          className || ''
        }`}
      >
        Setuju
      </td>
      <td
        onClick={onReject}
        className={`hover:underline border-2 border-gray-500 px-4 py-2 ${
          className || ''
        }`}
      >
        Tidak setuju
      </td>
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
};

export default ActionTableCell;
