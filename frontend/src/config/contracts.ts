// LinkedinProfile contract deployed on Sepolia
export const CONTRACT_ADDRESS = '0x1b025551810bc957C2a51193DafFae33073BA5b0';

// Generated ABI from contract artifacts - Auto-synced from LinkedinProfile.json
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "experienceIndex",
        "type": "uint256"
      }
    ],
    "name": "ExperienceSalaryUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "experienceIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "viewer",
        "type": "address"
      }
    ],
    "name": "ExperienceSalaryViewerAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "experienceIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "viewer",
        "type": "address"
      }
    ],
    "name": "ExperienceSalaryViewerRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "experienceIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "company",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "position",
        "type": "string"
      }
    ],
    "name": "WorkExperienceAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_company",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_position",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_startTime",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_endTime",
        "type": "string"
      },
      {
        "internalType": "externalEuint32",
        "name": "_encryptedSalary",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "addWorkExperience",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_viewer",
        "type": "address"
      }
    ],
    "name": "authorizeExperienceSalaryViewer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bio",
        "type": "string"
      }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      }
    ],
    "name": "getExperienceSalary",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      }
    ],
    "name": "getExperienceSalaryViewers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "bio",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "company",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "position",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "startTime",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "endTime",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "euint32",
            "name": "encryptedSalary",
            "type": "bytes32"
          }
        ],
        "internalType": "struct LinkedinProfile.WorkExperience[]",
        "name": "experiences",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getWorkExperience",
    "outputs": [
      {
        "internalType": "string",
        "name": "company",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "position",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "startTime",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "endTime",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getWorkExperienceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_viewer",
        "type": "address"
      }
    ],
    "name": "isExperienceSalaryViewerAuthorized",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_viewer",
        "type": "address"
      }
    ],
    "name": "revokeExperienceSalaryViewer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_experienceIndex",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "_encryptedSalary",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "setExperienceSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bio",
        "type": "string"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_company",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_position",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_startTime",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_endTime",
        "type": "string"
      }
    ],
    "name": "updateWorkExperience",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
