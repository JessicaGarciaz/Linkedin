export const LINKEDIN_PROFILE_ABI = [
  {
    "inputs": [
      {"name": "_name", "type": "string"},
      {"name": "_bio", "type": "string"}
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_name", "type": "string"},
      {"name": "_bio", "type": "string"}
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_company", "type": "string"},
      {"name": "_position", "type": "string"},
      {"name": "_startTime", "type": "string"},
      {"name": "_endTime", "type": "string"}
    ],
    "name": "addWorkExperience",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_encryptedSalary", "type": "bytes32"},
      {"name": "inputProof", "type": "bytes"}
    ],
    "name": "setSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_viewer", "type": "address"}
    ],
    "name": "authorizeSalaryViewer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_viewer", "type": "address"}
    ],
    "name": "revokeSalaryViewer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_user", "type": "address"}
    ],
    "name": "getProfile",
    "outputs": [
      {"name": "name", "type": "string"},
      {"name": "bio", "type": "string"},
      {
        "name": "experiences",
        "type": "tuple[]",
        "components": [
          {"name": "company", "type": "string"},
          {"name": "position", "type": "string"},
          {"name": "startTime", "type": "string"},
          {"name": "endTime", "type": "string"},
          {"name": "isActive", "type": "bool"}
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_user", "type": "address"}
    ],
    "name": "getSalary",
    "outputs": [
      {"name": "", "type": "bytes32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_viewer", "type": "address"}
    ],
    "name": "isSalaryViewerAuthorized",
    "outputs": [
      {"name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"}
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"}
    ],
    "name": "ProfileUpdated",
    "type": "event"
  }
] as const;