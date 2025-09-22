import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import './App.css'
import ProfileForm from './components/ProfileForm'
import ProfileView from './components/ProfileView'
import SalaryManager from './components/SalaryManager'

function App() {
  const { isConnected, address } = useAccount()
  const [activeTab, setActiveTab] = useState<'profile' | 'view' | 'salary'>('profile')

  return (
    <div className="app">
      <header className="header">
        <h1>LinkedIn OnChain</h1>
        <div className="nav">
          <ConnectButton />
        </div>
      </header>

      {isConnected ? (
        <main className="main">
          <div className="tabs">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
            <button 
              className={activeTab === 'view' ? 'active' : ''}
              onClick={() => setActiveTab('view')}
            >
              View Profiles
            </button>
            <button 
              className={activeTab === 'salary' ? 'active' : ''}
              onClick={() => setActiveTab('salary')}
            >
              Salary Manager
            </button>
          </div>

          <div className="content">
            {activeTab === 'profile' && <ProfileForm userAddress={address!} />}
            {activeTab === 'view' && <ProfileView />}
            {activeTab === 'salary' && <SalaryManager userAddress={address!} />}
          </div>
        </main>
      ) : (
        <div className="connect-prompt">
          <h2>Welcome to LinkedIn OnChain</h2>
          <p>Connect your wallet to get started</p>
        </div>
      )}
    </div>
  )
}

export default App
