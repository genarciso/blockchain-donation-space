pragma solidity >=0.7.0 <0.9.0;

contract Owned {
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner {
        require(payable(msg.sender) == owner, "Account is not owner from contract.");
        _;
    }
    
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}

pragma experimental ABIEncoderV2;

contract DonatationSpace is Owned {
    mapping(uint256 => Donation) donations;
    Donation[] allDonations;
    Donation[] newAllDonations;

    struct User {
        address addressUser;
        string name;
    }

    struct Donation {
        uint256 id;
        string title;
        string description;
        User user;
        uint256 goal;
        uint256 collected;
    }

    event Created(address user, uint256 id, uint256 goal);
    event Donated(address user, uint256 value);

    function getDonation(uint256 id) public view returns (Donation memory) {
        return donations[id];
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return allDonations;
    }

    function createDonation(
        uint256 id,
        string memory title,
        string memory description,
        uint256 goal,
        string memory userName
    ) public {
        require(goal > 0, "Invalid goal");
        require(donations[id].id != id, "Donation id is not valid");

        User memory user = User(msg.sender, userName);
        Donation memory donated = Donation(id, title, description, user, goal, 0);

        donations[id] = donated;
        allDonations.push(donated);

        emit Created(msg.sender, id, goal);
    }

    function donate(uint256 id) public payable {
        Donation memory donation = donations[id];

        donation.collected += msg.value;
        donations[id] = donation;

        for (uint256 i = 0; i < allDonations.length; i++) {
            if (allDonations[i].id == id) {
                allDonations[i].collected += msg.value;
            }
        }

        emit Donated(msg.sender, msg.value);
    }

    function isOwner(uint256 donationId) public view returns (bool) {
        if (donations[donationId].user.addressUser == msg.sender) {
            return true;
        }

        return false;
    }

    function finishDonation(uint256 donationId) public payable {
        require(donations[donationId].user.addressUser == msg.sender, "Just to owner.");

        uint256 value = donations[donationId].collected;
        delete donations[donationId];

        for (uint256 i = 0; i < allDonations.length; i++) {
            if (allDonations[i].id != donationId) {
                newAllDonations.push(allDonations[i]);
            }
        }

        allDonations = newAllDonations;
    
        address payable owner = payable(address(uint160(msg.sender)));

        owner.transfer(value);
    }
}
