import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LinkedIn OnChain',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
  ssr: false,
});

export const LINKEDIN_CONTRACT_ADDRESS = '0x...'; // Will be updated after deployment