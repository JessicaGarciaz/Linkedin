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
        euint32 encryptedSalary;
    }
    
    struct UserProfile {
        string name;
        string bio;
        WorkExperience[] experiences;
        bool profileExists;
    }
    
    mapping(address => UserProfile) private profiles;
    mapping(address => mapping(uint256 => address[])) private experienceSalaryViewers;
    mapping(address => mapping(uint256 => mapping(address => bool))) private experienceSalaryViewerPermissions;
    
    event ProfileCreated(address indexed user);
    event ProfileUpdated(address indexed user);
    event WorkExperienceAdded(address indexed user, uint256 indexed experienceIndex, string company, string position);
    event ExperienceSalaryUpdated(address indexed user, uint256 indexed experienceIndex);
    event ExperienceSalaryViewerAuthorized(address indexed profileOwner, uint256 indexed experienceIndex, address indexed viewer);
    event ExperienceSalaryViewerRevoked(address indexed profileOwner, uint256 indexed experienceIndex, address indexed viewer);
    
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
        string memory _endTime,
        externalEuint32 _encryptedSalary,
        bytes calldata inputProof
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        euint32 salary = FHE.fromExternal(_encryptedSalary, inputProof);

        uint256 experienceIndex = profile.experiences.length;

        profile.experiences.push(WorkExperience({
            company: _company,
            position: _position,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            encryptedSalary: salary
        }));

        FHE.allowThis(salary);
        FHE.allow(salary, msg.sender);

        emit WorkExperienceAdded(msg.sender, experienceIndex, _company, _position);
        emit ExperienceSalaryUpdated(msg.sender, experienceIndex);
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
    
    function setExperienceSalary(
        uint256 _experienceIndex,
        externalEuint32 _encryptedSalary,
        bytes calldata inputProof
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        require(_experienceIndex < profile.experiences.length, "Invalid experience index");

        euint32 salary = FHE.fromExternal(_encryptedSalary, inputProof);
        profile.experiences[_experienceIndex].encryptedSalary = salary;

        FHE.allowThis(salary);
        FHE.allow(salary, msg.sender);

        emit ExperienceSalaryUpdated(msg.sender, _experienceIndex);
    }
    
    function authorizeExperienceSalaryViewer(
        uint256 _experienceIndex,
        address _viewer
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        require(_experienceIndex < profile.experiences.length, "Invalid experience index");
        require(_viewer != msg.sender, "Cannot authorize yourself");
        require(
            !experienceSalaryViewerPermissions[msg.sender][_experienceIndex][_viewer],
            "Viewer already authorized"
        );

        experienceSalaryViewerPermissions[msg.sender][_experienceIndex][_viewer] = true;
        experienceSalaryViewers[msg.sender][_experienceIndex].push(_viewer);

        FHE.allow(profile.experiences[_experienceIndex].encryptedSalary, _viewer);

        emit ExperienceSalaryViewerAuthorized(msg.sender, _experienceIndex, _viewer);
    }
    
    function revokeExperienceSalaryViewer(
        uint256 _experienceIndex,
        address _viewer
    ) external profileExists(msg.sender) {
        UserProfile storage profile = profiles[msg.sender];
        require(_experienceIndex < profile.experiences.length, "Invalid experience index");
        require(
            experienceSalaryViewerPermissions[msg.sender][_experienceIndex][_viewer],
            "Viewer not authorized"
        );

        experienceSalaryViewerPermissions[msg.sender][_experienceIndex][_viewer] = false;

        address[] storage viewers = experienceSalaryViewers[msg.sender][_experienceIndex];
        for (uint i = 0; i < viewers.length; i++) {
            if (viewers[i] == _viewer) {
                viewers[i] = viewers[viewers.length - 1];
                viewers.pop();
                break;
            }
        }

        emit ExperienceSalaryViewerRevoked(msg.sender, _experienceIndex, _viewer);
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
    
    function getExperienceSalary(
        address _user,
        uint256 _experienceIndex
    ) external view profileExists(_user) returns (euint32) {
        UserProfile storage profile = profiles[_user];
        require(_experienceIndex < profile.experiences.length, "Invalid experience index");
        require(
            _user == msg.sender ||
                experienceSalaryViewerPermissions[_user][_experienceIndex][msg.sender],
            "Not authorized to view salary"
        );
        return profile.experiences[_experienceIndex].encryptedSalary;
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
    
    function getExperienceSalaryViewers(
        address _user,
        uint256 _experienceIndex
    ) external view profileExists(_user) returns (address[] memory) {
        require(msg.sender == _user, "Only profile owner can view authorized viewers");
        UserProfile storage profile = profiles[_user];
        require(_experienceIndex < profile.experiences.length, "Invalid experience index");
        return experienceSalaryViewers[_user][_experienceIndex];
    }

    function isExperienceSalaryViewerAuthorized(
        address _user,
        uint256 _experienceIndex,
        address _viewer
    ) external view returns (bool) {
        if (_experienceIndex >= profiles[_user].experiences.length) {
            return false;
        }
        return experienceSalaryViewerPermissions[_user][_experienceIndex][_viewer];
    }
}