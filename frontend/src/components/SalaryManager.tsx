import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LINKEDIN_PROFILE_ABI } from '../contracts/LinkedinProfile';

const LINKEDIN_CONTRACT_ADDRESS = '0x...'; // This will be updated after deployment

interface SalaryManagerProps {
  userAddress: string;
}

export default function SalaryManager({}: SalaryManagerProps) {
  const [salaryAmount, setSalaryAmount] = useState('');
  const [viewerAddress, setViewerAddress] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const { writeContract: setSalary, data: salaryHash } = useWriteContract();
  const { writeContract: authorizeViewer, data: authHash } = useWriteContract();
  const { writeContract: revokeViewer, data: revokeHash } = useWriteContract();

  const { isLoading: isSalaryLoading } = useWaitForTransactionReceipt({
    hash: salaryHash,
  });

  const { isLoading: isAuthLoading } = useWaitForTransactionReceipt({
    hash: authHash,
  });

  const { isLoading: isRevokeLoading } = useWaitForTransactionReceipt({
    hash: revokeHash,
  });

  // Initialize FHEVM SDK
  useEffect(() => {
    const initFHEVM = async () => {
      try {
        // This would need to be properly initialized with the bundle version
        // const instance = await createInstance(SepoliaConfig);
        // setFhevmInstance(instance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize FHEVM:', error);
      }
    };

    initFHEVM();
  }, []);

  const handleSetSalary = async () => {
    if (!salaryAmount || !isInitialized) return;

    try {
      // In a real implementation, you would encrypt the salary using FHEVM
      // const encryptedInput = await fhevmInstance.createEncryptedInput(
      //   LINKEDIN_CONTRACT_ADDRESS,
      //   userAddress
      // ).add32(parseInt(salaryAmount)).encrypt();

      // For now, we'll use a placeholder
      const mockEncryptedSalary = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const mockProof = '0x';

      setSalary({
        address: LINKEDIN_CONTRACT_ADDRESS as `0x${string}`,
        abi: LINKEDIN_PROFILE_ABI,
        functionName: 'setSalary',
        args: [mockEncryptedSalary, mockProof],
      });
    } catch (error) {
      console.error('Error setting salary:', error);
    }
  };

  const handleAuthorizeViewer = async () => {
    if (!viewerAddress) return;

    authorizeViewer({
      address: LINKEDIN_CONTRACT_ADDRESS as `0x${string}`,
      abi: LINKEDIN_PROFILE_ABI,
      functionName: 'authorizeSalaryViewer',
      args: [viewerAddress as `0x${string}`],
    });
  };

  const handleRevokeViewer = async () => {
    if (!viewerAddress) return;

    revokeViewer({
      address: LINKEDIN_CONTRACT_ADDRESS as `0x${string}`,
      abi: LINKEDIN_PROFILE_ABI,
      functionName: 'revokeSalaryViewer',
      args: [viewerAddress as `0x${string}`],
    });
  };

  return (
    <div className="salary-manager">
      <h2>Salary Manager</h2>
      
      <div className="warning-box">
        <h4>⚠️ Privacy Notice</h4>
        <p>
          Your salary information is encrypted using Fully Homomorphic Encryption (FHE) 
          and stored securely on-chain. Only you and authorized viewers can decrypt it.
        </p>
      </div>

      <div className="form-section">
        <h3>Set Your Encrypted Salary</h3>
        <div className="form-group">
          <label>Annual Salary (USD):</label>
          <input
            type="number"
            value={salaryAmount}
            onChange={(e) => setSalaryAmount(e.target.value)}
            placeholder="e.g., 120000"
            className="salary-input"
          />
        </div>
        <button
          onClick={handleSetSalary}
          disabled={isSalaryLoading || !isInitialized}
          className="btn-primary"
        >
          {isSalaryLoading ? 'Encrypting & Setting...' : 'Set Encrypted Salary'}
        </button>
        {!isInitialized && (
          <p className="info-text">Initializing encryption system...</p>
        )}
      </div>

      <div className="form-section">
        <h3>Manage Salary Viewers</h3>
        <p className="section-description">
          Authorize specific addresses to view your encrypted salary information.
        </p>
        
        <div className="form-group">
          <label>Wallet Address:</label>
          <input
            type="text"
            value={viewerAddress}
            onChange={(e) => setViewerAddress(e.target.value)}
            placeholder="0x..."
            className="address-input"
          />
        </div>
        
        <div className="button-group">
          <button
            onClick={handleAuthorizeViewer}
            disabled={isAuthLoading}
            className="btn-success"
          >
            {isAuthLoading ? 'Authorizing...' : 'Authorize Viewer'}
          </button>
          <button
            onClick={handleRevokeViewer}
            disabled={isRevokeLoading}
            className="btn-danger"
          >
            {isRevokeLoading ? 'Revoking...' : 'Revoke Access'}
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>How It Works</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>🔐 Encryption</h4>
            <p>
              Your salary is encrypted using Zama's FHE technology before being 
              stored on the blockchain. Even the blockchain itself cannot see the value.
            </p>
          </div>
          <div className="info-card">
            <h4>🔑 Authorization</h4>
            <p>
              You control exactly who can decrypt and view your salary information. 
              Authorization can be granted or revoked at any time.
            </p>
          </div>
          <div className="info-card">
            <h4>🛡️ Privacy</h4>
            <p>
              Only authorized parties with proper decryption keys can view your 
              actual salary amount. Others only see encrypted data.
            </p>
          </div>
        </div>
      </div>

      <div className="technical-note">
        <h4>Technical Implementation Note</h4>
        <p>
          In the current demo version, FHE encryption is simulated. In production, 
          this would use Zama's FHEVM SDK to properly encrypt salary data before 
          sending it to the smart contract.
        </p>
      </div>
    </div>
  );
}