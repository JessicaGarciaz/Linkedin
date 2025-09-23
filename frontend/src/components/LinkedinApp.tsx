import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from './Header';
import { ProfileManager } from './ProfileManager';
import { ProfileView } from './ProfileView';
import '../styles/LinkedinApp.css';

export function LinkedinApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'profile' | 'view'>('profile');

  return (
    <div className="linkedin-app">
      <Header />

      <main className="main-content">
        {!isConnected ? (
          <div className="connect-wallet-container">
            <h2 className="connect-wallet-title">
              Connect Your Wallet
            </h2>
            <p className="connect-wallet-description">
              Please connect your wallet to access the LinkedIn platform
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div>
            <div className="tab-navigation">
              <nav className="tab-nav">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`tab-button ${activeTab === 'profile' ? 'active' : 'inactive'}`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('view')}
                  className={`tab-button ${activeTab === 'view' ? 'active' : 'inactive'}`}
                >
                  View Profiles
                </button>
              </nav>
            </div>

            {activeTab === 'profile' && <ProfileManager />}
            {activeTab === 'view' && <ProfileView />}
          </div>
        )}
      </main>
    </div>
  );
}