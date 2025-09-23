import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { ethers } from 'ethers';
import '../styles/ProfileView.css';

interface Experience {
  company: string;
  position: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Profile {
  name: string;
  bio: string;
  experiences: Experience[];
}

export function ProfileView() {
  const { address } = useAccount();
  const { zamaInstance } = useZamaInstance();
  const signer = useEthersSigner();

  const [searchAddress, setSearchAddress] = useState('');
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [decryptedSalaries, setDecryptedSalaries] = useState<{[key: number]: string}>({});

  // Read profile data when search address changes
  const { data: profileData, isLoading: profileLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProfile',
    args: [searchAddress as `0x${string}`],
    query: {
      enabled: !!searchAddress && ethers.isAddress(searchAddress),
    }
  });

  useEffect(() => {
    if (profileData) {
      const [name, bio, experiences] = profileData as [string, string, any[]];
      setViewedProfile({
        name,
        bio,
        experiences: experiences.map(exp => ({
          company: exp.company,
          position: exp.position,
          startTime: exp.startTime,
          endTime: exp.endTime,
          isActive: exp.isActive
        }))
      });
      setError('');
    }
  }, [profileData]);

  const handleSearchProfile = () => {
    if (!ethers.isAddress(searchAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    setError('');
    setViewedProfile(null);
    setDecryptedSalaries({});
    refetch();
  };


  const handleDecryptSalary = async (experienceIndex: number) => {
    if (!signer || !searchAddress) return;

    if (!zamaInstance) {
      alert('Encryption service is initializing, please try again later...');
      return;
    }

    setIsLoading(true);
    try {
      // Get encrypted salary from contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const encryptedSalary = await contract.getExperienceSalary(searchAddress, experienceIndex);

      // Decrypt using Zama
      const keypair = zamaInstance.generateKeypair();
      const handleContractPairs = [{
        handle: encryptedSalary,
        contractAddress: CONTRACT_ADDRESS,
      }];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = zamaInstance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

      const signature = await signer!.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await zamaInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address!,
        startTimeStamp,
        durationDays,
      );

      const decryptedValue = result[encryptedSalary];
      setDecryptedSalaries(prev => ({ ...prev, [experienceIndex]: decryptedValue.toString() }));
    } catch (error) {
      console.error('Error decrypting salary:', error);
      alert('Error decrypting salary. Make sure you have permission to view this data.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="profile-view">
      <div className="search-section">
        <h2>Search Profiles</h2>
        <div className="search-form">
          <div className="form-group">
            <label htmlFor="searchAddress">User Address</label>
            <input
              id="searchAddress"
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="0x..."
              className="form-input"
            />
          </div>
          <button
            onClick={handleSearchProfile}
            disabled={!searchAddress || profileLoading}
            className="primary-button"
          >
            {profileLoading ? 'Searching...' : 'Search Profile'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      {viewedProfile && (
        <div className="profile-details">
          <div className="profile-info">
            <h2>{viewedProfile.name}</h2>
            <p className="bio">{viewedProfile.bio}</p>
          </div>

          <div className="experiences-section">
            <h3>Work Experience</h3>
            {viewedProfile.experiences.length === 0 ? (
              <p>No work experience added yet.</p>
            ) : (
              <div className="experiences-list">
                {viewedProfile.experiences.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-header">
                      <h4>{exp.company}</h4>
                      <span className="experience-period">{exp.startTime} - {exp.endTime}</span>
                    </div>
                    <p><strong>Position:</strong> {exp.position}</p>

                    <div className="salary-section">
                      <p><strong>Salary:</strong>
                        {decryptedSalaries[index] ? (
                          <span className="salary-amount">${parseInt(decryptedSalaries[index]).toLocaleString()}/year</span>
                        ) : (
                          <span className="salary-hidden"> [Encrypted]</span>
                        )}
                      </p>

                      {!decryptedSalaries[index] && (
                        <button
                          onClick={() => handleDecryptSalary(index)}
                          disabled={isLoading}
                          className="secondary-button"
                        >
                          {isLoading ? 'Decrypting...' : 'Decrypt Salary'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}