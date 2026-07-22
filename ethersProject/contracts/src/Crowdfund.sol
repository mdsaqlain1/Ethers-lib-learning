// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Crowdfund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint id, address indexed caller, uint amount);

    struct Campaign {
        string title;
        string description;
        address creator;
        uint goal;
        uint pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
    }

    uint public count;
    // Map campaign ID to Campaign struct
    mapping(uint => Campaign) public campaigns;
    // Map campaign ID => backer address => amount pledged
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    // Create a new campaign
    function launch(
        string memory _title,
        string memory _description,
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Campaign({
            title: _title,
            description: _description,
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    // Cancel a campaign if it hasn't started yet
    function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }

    // Fund a campaign (requires sending ETH)
    function pledge(uint _id) external payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");
        require(msg.value > 0, "pledge amount must be greater than zero");

        campaign.pledged += msg.value;
        pledgedAmount[_id][msg.sender] += msg.value;

        emit Pledge(_id, msg.sender, msg.value);
    }

    // Withdraw your pledge if the campaign hasn't ended yet
    function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");
        require(pledgedAmount[_id][msg.sender] >= _amount, "insufficient pledge");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;

        // Send ETH back to the user
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        emit Unpledge(_id, msg.sender, _amount);
    }

    // Creator claims funds if goal is met and campaign has ended
    function claim(uint _id) external {
        Campaign storage campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        
        (bool success, ) = msg.sender.call{value: campaign.pledged}("");
        require(success, "Transfer failed");

        emit Claim(_id);
    }

    // Backers get refunds if campaign ended but goal wasn't met
    function refund(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        require(bal > 0, "no balance to refund");

        pledgedAmount[_id][msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "Transfer failed");

        emit Refund(_id, msg.sender, bal);
    }
}
