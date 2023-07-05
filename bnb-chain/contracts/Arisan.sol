// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.5 <0.9.0;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ArisanGroupFactory {
    address[] public groupAddreseses;

    function createGroup(
        string calldata title,
        string calldata telegramGroupUrl,
        string calldata coordinatorTelegramUsername,
        uint coordinatorCommissionPercentage,
        uint contributionAmountInWei,
        uint prizePercentage
    ) external {
        require(
            bytes(title).length != 0 &&
                bytes(telegramGroupUrl).length != 0 &&
                bytes(coordinatorTelegramUsername).length != 0 &&
                coordinatorCommissionPercentage < 100 - prizePercentage &&
                prizePercentage < 100 - coordinatorCommissionPercentage &&
                contributionAmountInWei > 0,
            "Data tidak lengkap"
        );
        Group newGroup = new Group(
            title,
            telegramGroupUrl,
            msg.sender,
            coordinatorTelegramUsername,
            coordinatorCommissionPercentage,
            contributionAmountInWei,
            prizePercentage
        );
        groupAddreseses.push(address(newGroup));
    }

    function getGroupAddreseses() external view returns (address[] memory) {
        return groupAddreseses;
    }
}

contract Group {
    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using EnumerableSet for EnumerableSet.UintSet;

    string public title;
    string public telegramGroupUrl;
    address public coordinator;
    uint public coordinatorCommissionPercentage;
    uint public contributionAmountInWei;
    uint public prizePercentage;

    // uint public membersCount;
    address[] public memberAddresses;
    // mapping from address to index in the address list (add 1 to all values so that 0 represents absence)
    mapping(address => uint256) public memberIndices;
    mapping(address => Member) public members;

    uint public activeVotersCount;

    Period[] public periods;
    mapping(uint => EnumerableMap.AddressToUintMap) periodToParticipantToContributionCountMaps;

    // Counters.Counter public incompleteProposalsCounter;
    Proposal[] proposals;
    EnumerableSet.UintSet incompleteProposalIndexes;
    mapping(uint => mapping(address => ApprovalStatus)) proposalsApprovals;

    mapping(uint => string) public stringProposalValues;
    mapping(uint => uint) public uintProposalValues;
    mapping(uint => address) public coordinatorProposalValues;
    mapping(uint => NewMemberVal) public newMemberProposalValues;
    mapping(uint => TransferVal) public transferProposalValues;

    event WinnerDrawn(ExternalMember winner);

    constructor(
        string memory _title,
        string memory _telegramGroupUrl,
        address _coordinator,
        string memory coordinatorTelegramUsername,
        uint _coordinatorCommissionPercentage,
        uint _contributionAmountInWei,
        uint _prizePercentage
    ) {
        title = _title;
        telegramGroupUrl = _telegramGroupUrl;
        coordinator = _coordinator;
        coordinatorCommissionPercentage = _coordinatorCommissionPercentage;
        contributionAmountInWei = _contributionAmountInWei;
        prizePercentage = _prizePercentage;

        memberAddresses.push(_coordinator);
        memberIndices[_coordinator] = memberAddresses.length;
        members[_coordinator] = Member({
            telegramUsername: coordinatorTelegramUsername,
            isActiveVoter: true,
            latestPeriodParticipation: 0
        });

        activeVotersCount = 1;
    }

    modifier coordinatorOnly() {
        require(msg.sender == coordinator, "Anda bukan koordinator");
        _;
    }

    modifier memberOnly() {
        require(
            memberIndices[msg.sender] > 0,
            // _isStringEmpty(members[msg.sender].telegramUsername) == false,
            "Anda bukan anggota"
        );
        _;
    }

    modifier activeVoterOnly() {
        require(
            members[msg.sender].isActiveVoter,
            "Anda tidak memiliki hak pilih"
        );
        _;
    }

    modifier onlyDuringOngoingPeriod() {
        require(
            periods.length > 0 && periods[periods.length - 1].endedAt == 0,
            "Tidak ada periode yang sedang berlangsung"
        );
        _;
    }

    modifier votableProposalOnly(uint index) {
        require(proposals[index].completedAt == 0, "Usulan ini sudah berakhir");
        require(
            proposalsApprovals[index][msg.sender] == ApprovalStatus.unset,
            "Anda sudah memberi suara pada usulan ini"
        );
        _;
    }

    modifier onlyWhenPeriodShouldBeOver() {
        Period storage lastPeriod = _getLastPeriod();
        require(
            periods.length > 0 &&
                lastPeriod.endedAt == 0 &&
                lastPeriod.dueWinners.length == 0 &&
                lastPeriod.remainingPeriodBalanceInWei > 0,
            "Tidak ada periode berlangsung yang bisa diakhiri"
        );
        _;
    }

    function isSenderWaitingForJoinApproval() internal view returns (bool) {
        if (proposals.length == 0) {
            return false;
        }

        for (uint i = 0; i < incompleteProposalIndexes.length(); i++) {
            uint index = incompleteProposalIndexes.at(i);
            Proposal storage proposal = proposals[index];
            if (
                proposal.category == ProposalCategory.newMember &&
                proposal.completedAt == 0 &&
                newMemberProposalValues[index].memberAddress == msg.sender
            ) {
                return true;
            }
        }
        return false;
    }

    function getGroupDetail() external view returns (GroupData memory) {
        JoinStatus joinStatus;
        if (msg.sender == address(0)) {
            joinStatus = JoinStatus.unknown;
        } else if (memberIndices[msg.sender] > 0) {
            joinStatus = JoinStatus.joined;
        } else if (isSenderWaitingForJoinApproval()) {
            joinStatus = JoinStatus.waitingApproval;
        } else {
            joinStatus = JoinStatus.notjoined;
        }
        return
            GroupData({
                groupAddress: address(this),
                title: title,
                telegramGroupUrl: telegramGroupUrl,
                membersCount: memberAddresses.length,
                memberAddresses: memberAddresses,
                joinStatus: joinStatus
                // senderAddress: msg.sender,
                // senderTgUsername: members[msg.sender].telegramUsername
            });
    }

    function getGroupSettings() external view returns (GroupSettings memory) {
        return
            GroupSettings({
                title: title,
                telegramGroupUrl: telegramGroupUrl,
                coordinator: ExternalMember({
                    walletAddress: coordinator,
                    telegramUsername: members[coordinator].telegramUsername,
                    isActiveVoter: members[coordinator].isActiveVoter,
                    latestPeriodParticipation: members[coordinator]
                        .latestPeriodParticipation
                }),
                coordinatorCommissionPercentage: coordinatorCommissionPercentage,
                contributionAmountInWei: contributionAmountInWei,
                prizePercentage: prizePercentage
            });
    }

    function getIncompleteProposalsIndexesCount() external view returns (uint) {
        return incompleteProposalIndexes.length();
    }

    function getIncompleteProposalByIncompleteProposalsIndexesIndex(
        uint index
    ) external view returns (ExternalProposal memory) {
        uint proposalIndex = incompleteProposalIndexes.at(index);
        Proposal storage proposal = proposals[proposalIndex];
        Member storage proposer = members[proposal.proposer];
        Member storage newCoordinator = members[
            coordinatorProposalValues[proposalIndex]
        ];
        return
            ExternalProposal({
                index: proposalIndex,
                category: proposal.category,
                proposedAt: proposal.proposedAt,
                proposer: ExternalMember({
                    walletAddress: proposal.proposer,
                    telegramUsername: proposer.telegramUsername,
                    isActiveVoter: proposer.isActiveVoter,
                    latestPeriodParticipation: proposer
                        .latestPeriodParticipation
                }),
                completedAt: proposal.completedAt,
                isApproved: proposal.isApproved,
                approversCount: proposal.approvers.length,
                stringProposalValue: stringProposalValues[proposalIndex],
                uintProposalValue: uintProposalValues[proposalIndex],
                coordinatorProposalValue: ExternalMember({
                    walletAddress: coordinatorProposalValues[proposalIndex],
                    telegramUsername: newCoordinator.telegramUsername,
                    isActiveVoter: newCoordinator.isActiveVoter,
                    latestPeriodParticipation: newCoordinator
                        .latestPeriodParticipation
                }),
                newMemberProposalValue: newMemberProposalValues[proposalIndex],
                transferProposalValue: transferProposalValues[proposalIndex]
            });
    }

    function getApproverByIndexAndProposalIndex(
        uint index,
        uint proposalIndex
    ) external view returns (ExternalMember memory) {
        Member storage approver = members[
            proposals[proposalIndex].approvers[index]
        ];

        return
            ExternalMember({
                walletAddress: proposals[proposalIndex].approvers[index],
                telegramUsername: approver.telegramUsername,
                isActiveVoter: approver.isActiveVoter,
                latestPeriodParticipation: approver.latestPeriodParticipation
            });
    }

    function getPeriodsCount() external view returns (uint) {
        return periods.length;
    }

    function getRoundByIndexAndPeriodIndex(
        uint index,
        uint periodIndex
    ) external view returns (ExternalRound memory) {
        Round storage round = periods[periodIndex].rounds[index];
        Member storage winner = members[round.winner];
        return
            ExternalRound({
                drawnAt: round.drawnAt,
                winner: ExternalMember({
                    walletAddress: round.winner,
                    telegramUsername: winner.telegramUsername,
                    isActiveVoter: winner.isActiveVoter,
                    latestPeriodParticipation: winner.latestPeriodParticipation
                }),
                contributorCount: round.contributorCount
            });
    }

    function getDueWinnerByIndexAndPeriodIndex(
        uint index,
        uint periodIndex
    ) external view returns (ExternalMember memory) {
        Member storage dueWinner = members[
            periods[periodIndex].dueWinners[index]
        ];
        return
            ExternalMember({
                walletAddress: periods[periodIndex].dueWinners[index],
                telegramUsername: dueWinner.telegramUsername,
                isActiveVoter: dueWinner.isActiveVoter,
                latestPeriodParticipation: dueWinner.latestPeriodParticipation
            });
    }

    function getPeriodByIndex(
        uint index
    ) external view returns (ExternalPeriod memory) {
        Period storage period = periods[index];
        return
            ExternalPeriod({
                startedAt: period.startedAt,
                endedAt: period.endedAt,
                remainingPeriodBalanceInWei: period.remainingPeriodBalanceInWei,
                contributionAmountInWei: period.contributionAmountInWei,
                coordinatorCommissionPercentage: period
                    .coordinatorCommissionPercentage,
                prizePercentage: period.prizePercentage,
                // prizeForEachWinnerInWei: period.prizeForEachWinnerInWei,
                roundsCount: period.rounds.length,
                dueWinnersCount: period.dueWinners.length
            });
    }

    function getMemberByIndex(
        uint index
    ) external view returns (ExternalMember memory) {
        Member storage member = members[memberAddresses[index]];
        return
            ExternalMember({
                walletAddress: memberAddresses[index],
                telegramUsername: member.telegramUsername,
                isActiveVoter: member.isActiveVoter,
                latestPeriodParticipation: member.latestPeriodParticipation
            });
    }

    function getMembersCount() external view returns (uint) {
        return memberAddresses.length;
    }

    function _isStringEmpty(string storage value) private view returns (bool) {
        return bytes(value).length == 0;
    }

    function _getLastPeriod() private view returns (Period storage) {
        return periods[periods.length - 1];
    }

    function _getLastRound(
        uint periodIndex
    ) private view returns (Round storage) {
        return
            periods[periodIndex].rounds[periods[periodIndex].rounds.length - 1];
    }

    function _generateRandomIndex(uint256 max) private view returns (uint256) {
        require(max > 0, "Max must be greater than 0");
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
            ) % max;
    }

    function leave() external memberOnly {
        require(
            msg.sender != coordinator,
            "Koordinator tidak boleh keluar dari kelompok"
        );

        require(
            periods.length == 0 ||
                periodToParticipantToContributionCountMaps[periods.length - 1]
                    .contains(msg.sender) ==
                false ||
                _getLastPeriod().endedAt > 0,
            "Anda masih berpartisipasi pada sebuah periode arisan"
        );

        uint256 index = memberIndices[msg.sender] - 1;
        address lastAddress = memberAddresses[memberAddresses.length - 1];
        memberAddresses[index] = lastAddress;
        memberIndices[lastAddress] = index + 1;

        if (members[msg.sender].isActiveVoter) {
            members[msg.sender].isActiveVoter = false;
            activeVotersCount--;
        }

        memberAddresses.pop();
        delete memberIndices[msg.sender];
        // delete members[msg.sender];
    }

    function contribute() public payable memberOnly onlyDuringOngoingPeriod {
        Period storage lastPeriod = _getLastPeriod();
        uint senderContributionCount = periodToParticipantToContributionCountMaps[
                periods.length - 1
            ].contains(msg.sender)
                ? periodToParticipantToContributionCountMaps[periods.length - 1]
                    .get(msg.sender)
                : 0;
        uint lastContributionDifference = lastPeriod.rounds.length -
            senderContributionCount;

        require(
            lastContributionDifference == 1,
            "Anda sudah berkontribusi / tidak berpartisipasi pada putaran sebelumnya"
        );

        uint finalContributionAmountInWei = (lastPeriod
            .contributionAmountInWei * lastContributionDifference);

        require(
            msg.value == finalContributionAmountInWei,
            "Jumlah kontribusi salah"
        );

        if (senderContributionCount == 0) {
            lastPeriod.dueWinners.push(msg.sender);
        }

        periodToParticipantToContributionCountMaps[periods.length - 1].set(
            msg.sender,
            lastPeriod.rounds.length
        );

        _getLastRound(periods.length - 1).contributorCount++;
        lastPeriod.remainingPeriodBalanceInWei += finalContributionAmountInWei;
        // lastPeriod.prizeForEachWinnerInWei =
        //     ((lastPeriod.contributionAmountInWei *
        //         lastPeriod.rounds[0].contributorCount) * prizePercentage) /
        //     100;

        Member storage sender = members[msg.sender];
        if (sender.isActiveVoter == false) {
            sender.isActiveVoter = true;
            activeVotersCount++;
        }
        sender.latestPeriodParticipation = periods.length - 1;
    }

    function startPeriod() external payable coordinatorOnly {
        require(
            periods.length == 0 || periods[periods.length - 1].endedAt > 0,
            "Periode terakhir belum berakhir"
        );
        // require(
        //     incompleteProposalIndexes.length() == 0,
        //     "Tidak boleh ada proposal yang belum selesai"
        // );

        // periods.push(
        //     Period({
        //         startedAt: block.timestamp,
        //         endedAt: 0,
        //         totalContributionInWei: 0,
        //         contributionAmountInWei: contributionAmountInWei,
        //         coordinatorCommissionPercentage: coordinatorCommissionPercentage,
        //         prizePercentage: prizePercentage,
        //         prizeForEachWinnerInWei: 0,
        //         rounds: new Round[](0),
        //         dueWinners: new address[](0)
        //     })
        // );

        periods.push();

        Period storage newPeriod = _getLastPeriod();

        newPeriod.startedAt = block.timestamp;
        newPeriod.contributionAmountInWei = contributionAmountInWei;
        newPeriod
            .coordinatorCommissionPercentage = coordinatorCommissionPercentage;
        newPeriod.prizePercentage = prizePercentage;
        newPeriod.rounds.push();

        contribute();
    }

    function drawWinner() external coordinatorOnly onlyDuringOngoingPeriod {
        Period storage lastPeriod = _getLastPeriod();
        address[] storage dueWinners = lastPeriod.dueWinners;

        require(
            dueWinners.length > 0,
            "Semua partisipan sudah mendapatkan giliran sebagai pemenang"
        );

        Round storage lastRound = _getLastRound(periods.length - 1);

        require(
            lastRound.contributorCount ==
                periodToParticipantToContributionCountMaps[periods.length - 1]
                    .length(),
            "Jumlah partisipan belum terpenuhi"
        );

        uint lastIndex = dueWinners.length - 1;
        uint winnerIndex = lastIndex > 0
            ? _generateRandomIndex(lastIndex)
            : lastIndex;

        lastRound.drawnAt = block.timestamp;
        lastRound.winner = dueWinners[winnerIndex];

        dueWinners[winnerIndex] = dueWinners[dueWinners.length - 1];
        dueWinners.pop();

        if (dueWinners.length > 0) {
            lastPeriod.rounds.push(Round(0, address(0), 0));
        } else {
            endPeriod();
        }

        uint winnerPrize = ((lastPeriod.contributionAmountInWei *
            lastPeriod.rounds[0].contributorCount) *
            lastPeriod.prizePercentage) / 100;

        uint coordinatorCommission = ((lastPeriod.contributionAmountInWei *
            lastPeriod.rounds[0].contributorCount) *
            lastPeriod.coordinatorCommissionPercentage) / 100;

        payable(lastRound.winner).transfer(winnerPrize);
        payable(coordinator).transfer(coordinatorCommission);

        lastPeriod.remainingPeriodBalanceInWei -= (winnerPrize +
            coordinatorCommission);

        emit WinnerDrawn(
            ExternalMember({
                walletAddress: lastRound.winner,
                telegramUsername: members[lastRound.winner].telegramUsername,
                isActiveVoter: members[lastRound.winner].isActiveVoter,
                latestPeriodParticipation: members[lastRound.winner]
                    .latestPeriodParticipation
            })
        );
    }

    function endPeriod() internal coordinatorOnly {
        require(
            incompleteProposalIndexes.length() == 0,
            "Tidak boleh ada usulan yang belum selesai sebelum periode berakhir"
        );
        _getLastPeriod().endedAt = block.timestamp;
        removeActiveVoter();
    }

    function removeActiveVoter() private {
        if (periods.length >= 2) {
            uint checkIndex = periods.length - 2;
            EnumerableMap.AddressToUintMap
                storage participantToContributionCount = periodToParticipantToContributionCountMaps[
                    checkIndex
                ];
            for (
                uint256 i = 0;
                i < participantToContributionCount.length();
                i++
            ) {
                (address key, ) = participantToContributionCount.at(i);
                Member storage member = members[key];
                if (
                    member.latestPeriodParticipation <= checkIndex &&
                    member.isActiveVoter
                ) {
                    member.isActiveVoter = false;
                    activeVotersCount--;
                }
            }
        } else {
            EnumerableMap.AddressToUintMap
                storage participantToContributionCount = periodToParticipantToContributionCountMaps[
                    0
                ];
            for (uint256 i = 0; i < memberAddresses.length; i++) {
                address memberAddress = memberAddresses[i];
                Member storage member = members[memberAddress];
                if (
                    participantToContributionCount.contains(memberAddress) ==
                    false &&
                    member.isActiveVoter
                ) {
                    member.isActiveVoter = false;
                    activeVotersCount--;
                }
            }
        }
    }

    function _propose(ProposalCategory category) private {
        proposals.push(
            Proposal({
                category: category,
                proposedAt: block.timestamp,
                proposer: msg.sender,
                completedAt: 0,
                isApproved: false,
                approvers: new address[](0)
            })
        );

        incompleteProposalIndexes.add(proposals.length - 1);
    }

    function _approveProposal(
        uint index
    ) private activeVoterOnly votableProposalOnly(index) returns (bool) {
        Proposal storage proposal = proposals[index];

        if (proposalsApprovals[index][msg.sender] == ApprovalStatus.unset) {
            proposalsApprovals[index][msg.sender] = ApprovalStatus.approved;
            proposal.approvers.push(msg.sender);
        }

        if (proposal.approvers.length >= activeVotersCount) {
            proposal.completedAt = block.timestamp;
            proposal.isApproved = true;
            return true;
        }

        return false;
    }

    function _rejectProposal(
        uint index
    ) private activeVoterOnly votableProposalOnly(index) {
        Proposal storage proposal = proposals[index];
        proposalsApprovals[index][msg.sender] = ApprovalStatus.rejected;
        proposal.completedAt = block.timestamp;
        incompleteProposalIndexes.remove(index);
    }

    function proposeNewString(
        string calldata newValue,
        ProposalCategory category
    ) external activeVoterOnly {
        require(
            category == ProposalCategory.title ||
                category == ProposalCategory.telegramGroupUrl,
            "Kategori usulan bukan judul / url grup telegram"
        );

        _propose(category);

        stringProposalValues[proposals.length - 1] = newValue;
    }

    // function proposeNewTitle(
    //     string calldata newTitle
    // ) external activeVoterOnly {
    //     _propose(ProposalCategory.title);
    //     stringProposalValues[proposals.length - 1] = newTitle;
    // }

    // function proposeNewTelegramGroupUrl(
    //     string calldata newTelegramGroupUrl
    // ) external activeVoterOnly {
    //     _propose(ProposalCategory.telegramGroupUrl);
    //     stringProposalValues[proposals.length - 1] = newTelegramGroupUrl;
    // }

    function approveNewTitleProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.title,
            "Kategori usulan bukan judul"
        );

        if (_approveProposal(index)) {
            title = stringProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete stringProposalValues[index];
        }
    }

    function approveNewTelegramGroupUrlProposal(
        uint index
    ) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.telegramGroupUrl,
            "Kategori usulan bukan url grup telegram"
        );

        if (_approveProposal(index)) {
            telegramGroupUrl = stringProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete stringProposalValues[index];
        }
    }

    function rejectStringProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.title ||
                proposal.category == ProposalCategory.telegramGroupUrl,
            "Kategori usulan bukan judul / url grup telegram"
        );

        _rejectProposal(index);
        delete stringProposalValues[index];
    }

    function proposeNewMember(
        address memberAddress,
        string calldata telegramUsername
    ) external {
        require(
            isSenderWaitingForJoinApproval() == false,
            "Anda sedang menunggu persetujuan bergabung"
        );

        require(
            memberIndices[msg.sender] == 0,
            "Anda sudah bergabung sebagai anggota"
        );

        _propose(ProposalCategory.newMember);

        newMemberProposalValues[proposals.length - 1] = NewMemberVal({
            memberAddress: memberAddress,
            telegramUsername: telegramUsername
        });
    }

    function approveNewMemberProposal(uint index) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.newMember,
            "Kategori usulan bukan anggota baru"
        );

        if (_approveProposal(index)) {
            memberAddresses.push(newMemberProposalValues[index].memberAddress);
            memberIndices[
                newMemberProposalValues[index].memberAddress
            ] = memberAddresses.length;
            bool isPeriodsEmpty = periods.length == 0;
            members[newMemberProposalValues[index].memberAddress] = Member({
                telegramUsername: newMemberProposalValues[index]
                    .telegramUsername,
                isActiveVoter: isPeriodsEmpty,
                latestPeriodParticipation: 0
            });
            if (isPeriodsEmpty) {
                activeVotersCount++;
            }
            incompleteProposalIndexes.remove(index);
            delete newMemberProposalValues[index];
        }
    }

    function rejectNewMemberProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.newMember,
            "Kategori usulan bukan anggota baru"
        );

        _rejectProposal(index);
        delete newMemberProposalValues[index];
    }

    function proposeNewContributionAmountInWei(
        uint newContributionAmountInWei
    ) external activeVoterOnly {
        require(
            newContributionAmountInWei > 0,
            "Syarat jumlah kontribusi tidak boleh 0"
        );
        _propose(ProposalCategory.contributionAmount);

        uintProposalValues[proposals.length - 1] = newContributionAmountInWei;
    }

    function approveContributionAmountProposal(
        uint index
    ) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.contributionAmount,
            "Kategori usulan bukan jumlah kontribusi"
        );

        if (_approveProposal(index)) {
            contributionAmountInWei = uintProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete uintProposalValues[index];
        }
    }

    function proposeNewPrizePercentage(
        uint newPrizePercentage
    ) external activeVoterOnly {
        uint limit = 100 - coordinatorCommissionPercentage;
        require(
            newPrizePercentage <= limit && newPrizePercentage >= 0,
            string.concat(
                "Jumlah persentase hadiah tidak boleh lebih dari ",
                Strings.toString(limit),
                " dan tidak boleh lebih kecil dari 0"
            )
        );
        _propose(ProposalCategory.prizePercentage);
        uintProposalValues[proposals.length - 1] = newPrizePercentage;
    }

    function approvePrizePercentageProposal(
        uint index
    ) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.prizePercentage,
            "Kategori usulan bukan persentase hadiah"
        );

        if (_approveProposal(index)) {
            prizePercentage = uintProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete uintProposalValues[index];
        }
    }

    function proposeNewCoordinatorCommissionPercentage(
        uint newCoordinatorCommissionPercentage
    ) external activeVoterOnly {
        uint limit = 100 - prizePercentage;
        require(
            newCoordinatorCommissionPercentage <= limit &&
                newCoordinatorCommissionPercentage >= 0,
            string.concat(
                "Jumlah persentase komisi koordinator tidak boleh lebih dari ",
                Strings.toString(limit),
                " dan tidak boleh lebih kecil dari 0"
            )
        );
        _propose(ProposalCategory.coordinatorCommissionPercentage);
        uintProposalValues[
            proposals.length - 1
        ] = newCoordinatorCommissionPercentage;
    }

    function approveNewCoordinatorCommissionPercentageProposal(
        uint index
    ) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category ==
                ProposalCategory.coordinatorCommissionPercentage,
            "Kategori usulan bukan persentase komisi koordinator"
        );

        if (_approveProposal(index)) {
            coordinatorCommissionPercentage = uintProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete uintProposalValues[index];
        }
    }

    function rejectUintProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.contributionAmount ||
                proposal.category == ProposalCategory.prizePercentage ||
                proposal.category ==
                ProposalCategory.coordinatorCommissionPercentage,
            "Kategori usulan bukan jumlah kontribusi / persentase hadiah / persentase komisi koordinator"
        );

        _rejectProposal(index);
        delete uintProposalValues[index];
    }

    function proposeNewCoordinator(address newValue) external activeVoterOnly {
        _propose(ProposalCategory.coordinator);
        coordinatorProposalValues[proposals.length - 1] = newValue;
    }

    function approveNewCoordinatorProposal(
        uint index
    ) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.coordinator,
            "Kategori usulan bukan koordinator baru"
        );

        if (_approveProposal(index)) {
            coordinator = coordinatorProposalValues[index];
            incompleteProposalIndexes.remove(index);
            delete coordinatorProposalValues[index];
        }
    }

    function rejectNewCoordinatorProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.coordinator,
            "Kategori usulan bukan koordinator baru"
        );

        _rejectProposal(index);
        delete coordinatorProposalValues[index];
    }

    function proposeTransfer(
        address recipient,
        uint transferAmount
    ) external activeVoterOnly {
        Period storage lastPeriod = _getLastPeriod();
        uint lockedBalance = lastPeriod.endedAt == 0
            ? lastPeriod.remainingPeriodBalanceInWei
            : 0;
        require(
            address(this).balance - lockedBalance >= transferAmount,
            "Saldo kelompok tidak cukup"
        );
        _propose(ProposalCategory.transfer);

        transferProposalValues[proposals.length - 1] = TransferVal({
            transferAmount: transferAmount,
            recipient: payable(recipient)
        });
    }

    function approveTransferProposal(uint index) external activeVoterOnly {
        Proposal storage proposal = proposals[index];
        Period storage lastPeriod = _getLastPeriod();
        uint lockedBalance = lastPeriod.endedAt == 0
            ? lastPeriod.remainingPeriodBalanceInWei
            : 0;

        require(
            address(this).balance - lockedBalance >=
                transferProposalValues[index].transferAmount,
            "Saldo kelompok tidak cukup, tunggu sampai saldo cukup untuk melanjutkan voting"
        );

        require(
            proposal.category == ProposalCategory.transfer,
            "Kategori usulan bukan transfer"
        );

        if (_approveProposal(index)) {
            transferProposalValues[index].recipient.transfer(
                transferProposalValues[index].transferAmount
            );
            incompleteProposalIndexes.remove(index);
            delete transferProposalValues[index];
        }
    }

    function rejectTransferProposal(uint index) external {
        Proposal storage proposal = proposals[index];
        require(
            proposal.category == ProposalCategory.transfer,
            "Kategori usulan bukan transfer"
        );

        _rejectProposal(index);
        delete transferProposalValues[index];
    }
}

enum JoinStatus {
    joined,
    waitingApproval,
    notjoined,
    unknown
}

enum ApprovalStatus {
    unset,
    approved,
    rejected
}

enum ProposalCategory {
    title,
    telegramGroupUrl,
    coordinatorCommissionPercentage,
    contributionAmount,
    prizePercentage,
    newMember,
    coordinator,
    transfer
}

struct GroupData {
    address groupAddress;
    string title;
    string telegramGroupUrl;
    uint membersCount;
    address[] memberAddresses;
    JoinStatus joinStatus;
    // address senderAddress;
    // string senderTgUsername;
}

struct GroupSettings {
    string title;
    string telegramGroupUrl;
    ExternalMember coordinator;
    uint coordinatorCommissionPercentage;
    uint contributionAmountInWei;
    uint prizePercentage;
}

struct GroupProposals {
    uint incompleteProposalsCount;
    ExternalProposal[] proposals;
}

struct Member {
    string telegramUsername;
    bool isActiveVoter;
    // bool hasJoinedPeriod;
    uint latestPeriodParticipation;
}

struct ExternalMember {
    address walletAddress;
    string telegramUsername;
    bool isActiveVoter;
    // bool hasJoinedPeriod;
    uint latestPeriodParticipation;
}

struct Period {
    // uint id;
    uint startedAt;
    uint endedAt;
    uint remainingPeriodBalanceInWei;
    uint contributionAmountInWei;
    uint coordinatorCommissionPercentage;
    uint prizePercentage;
    // uint prizeForEachWinnerInWei;
    Round[] rounds;
    address[] dueWinners;
}

struct ExternalPeriod {
    // uint id;
    uint startedAt;
    uint endedAt;
    uint remainingPeriodBalanceInWei;
    uint contributionAmountInWei;
    uint coordinatorCommissionPercentage;
    uint prizePercentage;
    // uint prizeForEachWinnerInWei;
    uint roundsCount;
    uint dueWinnersCount;
}

struct Round {
    uint drawnAt;
    address winner;
    uint contributorCount;
}

struct ExternalRound {
    uint drawnAt;
    ExternalMember winner;
    uint contributorCount;
}

struct Proposal {
    ProposalCategory category;
    uint proposedAt;
    address proposer;
    uint completedAt;
    bool isApproved;
    address[] approvers;
}

struct IncompleteProposal {
    uint proposalIndex;
    Proposal proposal;
}

struct ExternalProposal {
    uint index;
    ProposalCategory category;
    uint proposedAt;
    ExternalMember proposer;
    uint completedAt;
    bool isApproved;
    uint approversCount;
    string stringProposalValue;
    uint uintProposalValue;
    ExternalMember coordinatorProposalValue;
    NewMemberVal newMemberProposalValue;
    TransferVal transferProposalValue;
}

struct NewMemberVal {
    address memberAddress;
    string telegramUsername;
}

struct TransferVal {
    address payable recipient;
    uint transferAmount;
}
