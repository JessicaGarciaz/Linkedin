import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { ethers } from 'ethers';
import '../styles/ProfileManager.css';

interface WorkExperience {
  company: string;
  position: string;
  startTime: string;
  endTime: string;
  salary: string;
}

export function ProfileManager() {
  const { address } = useAccount();
  const { zamaInstance } = useZamaInstance();
  const signer = useEthersSigner();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [newExperience, setNewExperience] = useState<WorkExperience>({
    company: '',
    position: '',
    startTime: '',
    endTime: '',
    salary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [decryptedSalaries, setDecryptedSalaries] = useState<{[key: number]: string}>({});
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<number | null>(null);
  const [authorizeAddress, setAuthorizeAddress] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Check if user has a profile
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  useEffect(() => {
    if (profileData) {
      const [profileName, profileBio, profileExperiences] = profileData as [string, string, any[]];
      setName(profileName);
      setBio(profileBio);
      setHasProfile(true);

      // Convert experiences to display format (without encrypted salary)
      const formattedExperiences = profileExperiences.map(exp => ({
        company: exp.company,
        position: exp.position,
        startTime: exp.startTime,
        endTime: exp.endTime,
        salary: '***' // Hidden for display
      }));
      setExperiences(formattedExperiences);
    }
  }, [profileData]);

  const handleCreateProfile = async () => {
    if (!signer || !name || !bio) return;

    setIsSubmitting(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createProfile(name, bio);
      await tx.wait();

      setHasProfile(true);
      refetchProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleAddExperience = async () => {
    if (!signer || !newExperience.company || !newExperience.position || !newExperience.salary) return;

    if (!zamaInstance) {
      alert('Encryption service is initializing, please try again later...');
      return;
    }

    setIsSubmitting(true);
    try {
      // Encrypt salary using Zama
      const input = zamaInstance.createEncryptedInput(CONTRACT_ADDRESS, address!);
      input.add32(parseInt(newExperience.salary));
      const encryptedInput = await input.encrypt();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addWorkExperience(
        newExperience.company,
        newExperience.position,
        newExperience.startTime,
        newExperience.endTime,
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );
      await tx.wait();

      // Add to local state
      setExperiences([...experiences, { ...newExperience, salary: '***' }]);

      // Reset form
      setNewExperience({
        company: '',
        position: '',
        startTime: '',
        endTime: '',
        salary: ''
      });

      refetchProfile();
    } catch (error) {
      console.error('Error adding work experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecryptSalary = async (experienceIndex: number) => {
    if (!signer || !address) return;

    if (!zamaInstance) {
      alert('Encryption service is initializing, please try again later...');
      return;
    }

    setIsDecrypting(true);
    try {
      // Get encrypted salary from contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const encryptedSalary = await contract.getExperienceSalary(address, experienceIndex);

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

      const signature = await signer.signTypedData(
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
        address,
        startTimeStamp,
        durationDays,
      );

      const decryptedValue = result[encryptedSalary];
      setDecryptedSalaries(prev => ({ ...prev, [experienceIndex]: decryptedValue.toString() }));
    } catch (error) {
      console.error('Error decrypting salary:', error);
      alert('Failed to decrypt salary');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleAuthorizeViewer = async () => {
    if (!signer || selectedExperienceIndex === null || !authorizeAddress) return;

    setIsAuthorizing(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.authorizeExperienceSalaryViewer(selectedExperienceIndex, authorizeAddress as `0x${string}`);
      await tx.wait();

      setAuthorizeAddress('');
      setSelectedExperienceIndex(null);
      alert('Authorization successful!');
    } catch (error) {
      console.error('Error authorizing viewer:', error);
      alert('Authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };


  return (
    <div className="profile-manager">
      <div className="profile-section">
        <h2>Profile Information</h2>

        {!hasProfile ? (
          <>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="form-textarea"
                rows={4}
              />
            </div>

            <button
              onClick={handleCreateProfile}
              disabled={isSubmitting || !name || !bio}
              className="primary-button"
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </>
        ) : (
          <div className="profile-display">
            <div className="profile-field">
              <label>Name</label>
              <p className="profile-value">{name}</p>
            </div>
            <div className="profile-field">
              <label>Bio</label>
              <p className="profile-value">{bio}</p>
            </div>
          </div>
        )}
      </div>

      {hasProfile && (
        <div className="experiences-section">
          <h2>Work Experience</h2>

          {experiences.length > 0 && (
            <div className="experiences-list">
              {experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h3>{exp.company}</h3>
                  <p><strong>Position:</strong> {exp.position}</p>
                  <p><strong>Period:</strong> {exp.startTime} - {exp.endTime}</p>
                  <div className="salary-section">
                    <span><strong>Salary:</strong>
                      {decryptedSalaries[index] ?
                        `$${parseInt(decryptedSalaries[index]).toLocaleString()}/year` :
                        '[Encrypted]'
                      }
                    </span>
                    {!decryptedSalaries[index] && (
                      <button
                        onClick={() => handleDecryptSalary(index)}
                        disabled={isDecrypting}
                        className="decrypt-button"
                      >
                        {isDecrypting ? 'Decrypting...' : 'Decrypt Salary'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="add-experience">
            <h3>Add New Experience</h3>

            <div className="experience-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Company name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    id="position"
                    type="text"
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                    placeholder="Job title"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Date</label>
                  <input
                    id="startTime"
                    type="text"
                    value={newExperience.startTime}
                    onChange={(e) => setNewExperience({ ...newExperience, startTime: e.target.value })}
                    placeholder="e.g., January 2020"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">End Date</label>
                  <input
                    id="endTime"
                    type="text"
                    value={newExperience.endTime}
                    onChange={(e) => setNewExperience({ ...newExperience, endTime: e.target.value })}
                    placeholder="e.g., Present or December 2023"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary (USD per year)</label>
                <input
                  id="salary"
                  type="number"
                  value={newExperience.salary}
                  onChange={(e) => setNewExperience({ ...newExperience, salary: e.target.value })}
                  placeholder="Annual salary"
                  className="form-input"
                />
                <p className="help-text">This will be encrypted and stored securely on-chain</p>
              </div>

              <button
                onClick={handleAddExperience}
                disabled={isSubmitting || !newExperience.company || !newExperience.position || !newExperience.salary}
                className="primary-button"
              >
                {isSubmitting ? 'Adding...' : 'Add Experience'}
              </button>
            </div>
          </div>

          {experiences.length > 0 && (
            <div className="authorization-section">
              <h3>Manage Salary Permissions</h3>
              <p>You can authorize other users to view your work experience salary information.</p>

              <div className="authorize-form">
                <div className="form-group">
                  <label htmlFor="experienceSelect">Select Work Experience</label>
                  <select
                    id="experienceSelect"
                    value={selectedExperienceIndex ?? ''}
                    onChange={(e) => setSelectedExperienceIndex(e.target.value ? parseInt(e.target.value) : null)}
                    className="form-select"
                  >
                    <option value="">Select a work experience...</option>
                    {experiences.map((exp, index) => (
                      <option key={index} value={index}>
                        {exp.position} - {exp.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="authorizeAddress">Authorize Address</label>
                  <input
                    id="authorizeAddress"
                    type="text"
                    value={authorizeAddress}
                    onChange={(e) => setAuthorizeAddress(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                  />
                </div>

                <button
                  onClick={handleAuthorizeViewer}
                  disabled={isAuthorizing || selectedExperienceIndex === null || !authorizeAddress}
                  className="primary-button"
                >
                  {isAuthorizing ? 'Authorizing...' : 'Authorize Viewing'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}