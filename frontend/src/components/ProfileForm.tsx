import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LINKEDIN_PROFILE_ABI, getLinkedinProfileAddress } from '../contracts/LinkedinProfile';

interface ProfileFormProps {
  userAddress: string;
}

interface WorkExperience {
  company: string;
  position: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function ProfileForm({ userAddress }: ProfileFormProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hasProfile, setHasProfile] = useState(false);

  const { writeContract: createProfile, data: createHash } = useWriteContract();
  const { writeContract: updateProfile, data: updateHash } = useWriteContract();
  const { writeContract: addExperience, data: expHash } = useWriteContract();

  const { isLoading: isCreateLoading } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { isLoading: isUpdateLoading } = useWaitForTransactionReceipt({
    hash: updateHash,
  });

  const { isLoading: isExpLoading } = useWaitForTransactionReceipt({
    hash: expHash,
  });

  // Check if user has a profile
  const { data: profileData, refetch } = useReadContract({
    address: getLinkedinProfileAddress() as `0x${string}`,
    abi: LINKEDIN_PROFILE_ABI,
    functionName: 'getProfile',
    args: [userAddress as `0x${string}`],
  });

  useEffect(() => {
    if (profileData) {
      const [profileName, profileBio] = profileData;
      setName(profileName);
      setBio(profileBio);
      setHasProfile(true);
    }
  }, [profileData]);

  const handleCreateProfile = async () => {
    if (!name || !bio) return;

    createProfile({
      address: getLinkedinProfileAddress() as `0x${string}`,
      abi: LINKEDIN_PROFILE_ABI,
      functionName: 'createProfile',
      args: [name, bio],
    });
  };

  const handleUpdateProfile = async () => {
    if (!name || !bio) return;

    updateProfile({
      address: getLinkedinProfileAddress() as `0x${string}`,
      abi: LINKEDIN_PROFILE_ABI,
      functionName: 'updateProfile',
      args: [name, bio],
    });
  };

  const handleAddExperience = async () => {
    if (!company || !position || !startTime || !endTime) return;

    addExperience({
      address: getLinkedinProfileAddress() as `0x${string}`,
      abi: LINKEDIN_PROFILE_ABI,
      functionName: 'addWorkExperience',
      args: [company, position, startTime, endTime],
    });

    // Clear form
    setCompany('');
    setPosition('');
    setStartTime('');
    setEndTime('');
  };

  useEffect(() => {
    if (createHash || updateHash || expHash) {
      // Refetch profile data after successful transaction
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [createHash, updateHash, expHash, refetch]);

  return (
    <div className="profile-form">
      <h2>{hasProfile ? 'Update Profile' : 'Create Profile'}</h2>
      
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group">
          <label>Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        <button
          onClick={hasProfile ? handleUpdateProfile : handleCreateProfile}
          disabled={isCreateLoading || isUpdateLoading}
          className="btn-primary"
        >
          {isCreateLoading || isUpdateLoading ? 'Processing...' : (hasProfile ? 'Update Profile' : 'Create Profile')}
        </button>
      </div>

      {hasProfile && (
        <div className="form-section">
          <h3>Add Work Experience</h3>
          <div className="form-group">
            <label>Company:</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="form-group">
            <label>Position:</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job title"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="2020-01"
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="2022-12"
              />
            </div>
          </div>
          <button
            onClick={handleAddExperience}
            disabled={isExpLoading}
            className="btn-secondary"
          >
            {isExpLoading ? 'Adding...' : 'Add Experience'}
          </button>
        </div>
      )}

      {profileData && (
        <div className="profile-preview">
          <h3>Current Profile</h3>
          <div className="profile-info">
            <p><strong>Name:</strong> {profileData[0]}</p>
            <p><strong>Bio:</strong> {profileData[1]}</p>
            <div className="experiences">
              <h4>Work Experience:</h4>
              {profileData[2] && profileData[2].length > 0 ? (
                profileData[2].map((exp: WorkExperience, index: number) => (
                  <div key={index} className="experience-item">
                    <p><strong>{exp.position}</strong> at <strong>{exp.company}</strong></p>
                    <p>{exp.startTime} - {exp.endTime}</p>
                  </div>
                ))
              ) : (
                <p>No work experience added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}