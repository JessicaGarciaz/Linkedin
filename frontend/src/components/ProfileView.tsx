import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { LINKEDIN_PROFILE_ABI } from '../contracts/LinkedinProfile';

const LINKEDIN_CONTRACT_ADDRESS = '0x...'; // This will be updated after deployment

interface WorkExperience {
  company: string;
  position: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function ProfileView() {
  const [searchAddress, setSearchAddress] = useState('');
  const [targetAddress, setTargetAddress] = useState<string | null>(null);

  const { data: profileData, isLoading, error } = useReadContract({
    address: LINKEDIN_CONTRACT_ADDRESS as `0x${string}`,
    abi: LINKEDIN_PROFILE_ABI,
    functionName: 'getProfile',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
  });

  const handleSearch = () => {
    if (searchAddress.trim()) {
      setTargetAddress(searchAddress.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="profile-view">
      <h2>View Profiles</h2>
      
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter wallet address (0x...)"
            className="address-input"
          />
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {targetAddress && (
        <div className="search-results">
          <h3>Profile for: {targetAddress}</h3>
          
          {isLoading && <p>Loading profile...</p>}
          
          {error && (
            <div className="error-message">
              <p>Error loading profile. This address might not have a profile yet.</p>
            </div>
          )}
          
          {profileData && !isLoading && (
            <div className="profile-card">
              <div className="profile-header">
                <h4>{profileData[0]}</h4>
                <p className="address-text">{targetAddress}</p>
              </div>
              
              <div className="profile-content">
                <div className="bio-section">
                  <h5>About</h5>
                  <p>{profileData[1]}</p>
                </div>
                
                <div className="experience-section">
                  <h5>Work Experience</h5>
                  {profileData[2] && profileData[2].length > 0 ? (
                    <div className="experiences-list">
                      {profileData[2].map((exp: WorkExperience, index: number) => (
                        <div key={index} className="experience-card">
                          <div className="experience-header">
                            <h6>{exp.position}</h6>
                            <p className="company-name">{exp.company}</p>
                          </div>
                          <p className="date-range">{exp.startTime} - {exp.endTime}</p>
                          {exp.isActive && <span className="active-badge">Active</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No work experience listed</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="instructions">
        <h3>How to use:</h3>
        <ul>
          <li>Enter a wallet address to view someone's public profile information</li>
          <li>Public information includes name, bio, and work experience</li>
          <li>Salary information is encrypted and only visible to authorized users</li>
        </ul>
      </div>
    </div>
  );
}