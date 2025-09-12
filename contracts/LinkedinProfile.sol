// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract LinkedinProfile is SepoliaConfig {
    struct WorkExperience {
        string company;
        string position;
        string startTime;
        string endTime;
        bool isActive;
    }
    
    struct UserProfile {
        string name;
        string bio;
        WorkExperience[] experiences;
        euint32 encryptedSalary;
        mapping(address => bool) salaryViewers;
        bool profileExists;
    }
    
    mapping(address => UserProfile) private profiles;
    mapping(address => address[]) private authorizedViewers;
    
    event ProfileCreated(address indexed user);
    event ProfileUpdated(address indexed user);
    event WorkExperienceAdded(address indexed user, string company, string position);
    event SalaryUpdated(address indexed user);
    event ViewerAuthorized(address indexed profileOwner, address indexed viewer);
    event ViewerRevoked(address indexed profileOwner, address indexed viewer);
    
    modifier profileExists(address user) {
        require(profiles[user].profileExists, "Profile does not exist");
        _;
    }
    
    function createProfile(
        string memory _name,
        string memory _bio
    ) external {
        require(!profiles[msg.sender].profileExists, "Profile already exists");
        
        UserProfile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.bio = _bio;
        profile.profileExists = true;
        
        emit ProfileCreated(msg.sender);
    }
    
    function updateProfile(
        string memory _name,
        string memory _bio
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.bio = _bio;
        
        emit ProfileUpdated(msg.sender);
    }
    
    function addWorkExperience(
        string memory _company,
        string memory _position,
        string memory _startTime,
        string memory _endTime
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        
        profile.experiences.push(WorkExperience({
            company: _company,
            position: _position,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true
        }));
        
        emit WorkExperienceAdded(msg.sender, _company, _position);
    }
    
    function updateWorkExperience(
        uint256 _index,
        string memory _company,
        string memory _position,
        string memory _startTime,
        string memory _endTime
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        require(_index < profile.experiences.length, "Invalid experience index");
        
        WorkExperience storage experience = profile.experiences[_index];
        experience.company = _company;
        experience.position = _position;
        experience.startTime = _startTime;
        experience.endTime = _endTime;
        
        emit ProfileUpdated(msg.sender);
    }
    
    function setSalary(
        externalEuint32 _encryptedSalary,
        bytes calldata inputProof
    ) external profileExists(msg.sender) {
        euint32 salary = FHE.fromExternal(_encryptedSalary, inputProof);
        
        profiles[msg.sender].encryptedSalary = salary;
        
        FHE.allowThis(salary);
        FHE.allow(salary, msg.sender);
        
        emit SalaryUpdated(msg.sender);
    }
    
    function authorizeSalaryViewer(address _viewer) external profileExists(msg.sender) {
        require(_viewer != msg.sender, "Cannot authorize yourself");
        require(!profiles[msg.sender].salaryViewers[_viewer], "Viewer already authorized");
        
        profiles[msg.sender].salaryViewers[_viewer] = true;
        authorizedViewers[msg.sender].push(_viewer);
        
        FHE.allow(profiles[msg.sender].encryptedSalary, _viewer);
        
        emit ViewerAuthorized(msg.sender, _viewer);
    }
    
    function revokeSalaryViewer(address _viewer) external profileExists(msg.sender) {
        require(profiles[msg.sender].salaryViewers[_viewer], "Viewer not authorized");
        
        profiles[msg.sender].salaryViewers[_viewer] = false;
        
        address[] storage viewers = authorizedViewers[msg.sender];
        for (uint i = 0; i < viewers.length; i++) {
            if (viewers[i] == _viewer) {
                viewers[i] = viewers[viewers.length - 1];
                viewers.pop();
                break;
            }
        }
        
        emit ViewerRevoked(msg.sender, _viewer);
    }
    
    function getProfile(address _user) external view returns (
        string memory name,
        string memory bio,
        WorkExperience[] memory experiences
    ) {
        require(profiles[_user].profileExists, "Profile does not exist");
        UserProfile storage profile = profiles[_user];
        return (profile.name, profile.bio, profile.experiences);
    }
    
    function getSalary(address _user) external view profileExists(_user) returns (euint32) {
        require(
            _user == msg.sender || profiles[_user].salaryViewers[msg.sender],
            "Not authorized to view salary"
        );
        return profiles[_user].encryptedSalary;
    }
    
    function getWorkExperienceCount(address _user) external view returns (uint256) {
        require(profiles[_user].profileExists, "Profile does not exist");
        return profiles[_user].experiences.length;
    }
    
    function getWorkExperience(address _user, uint256 _index) external view returns (
        string memory company,
        string memory position,
        string memory startTime,
        string memory endTime,
        bool isActive
    ) {
        require(profiles[_user].profileExists, "Profile does not exist");
        require(_index < profiles[_user].experiences.length, "Invalid experience index");
        
        WorkExperience memory experience = profiles[_user].experiences[_index];
        return (
            experience.company,
            experience.position,
            experience.startTime,
            experience.endTime,
            experience.isActive
        );
    }
    
    function getAuthorizedViewers(address _user) external view profileExists(_user) returns (address[] memory) {
        require(msg.sender == _user, "Only profile owner can view authorized viewers");
        return authorizedViewers[_user];
    }
    
    function isSalaryViewerAuthorized(address _user, address _viewer) external view returns (bool) {
        return profiles[_user].salaryViewers[_viewer];
    }
}