import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("linkedin:create-profile", "Create a new LinkedIn profile")
  .addParam("name", "The user's name")
  .addParam("bio", "The user's bio")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { name, bio, contract } = taskArgs;
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    
    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Creating profile for ${signer.address}...`);
    console.log(`Name: ${name}`);
    console.log(`Bio: ${bio}`);
    
    const tx = await linkedinProfile.createProfile(name, bio);
    await tx.wait();
    
    console.log(`Profile created successfully! Transaction: ${tx.hash}`);
  });

task("linkedin:add-experience", "Add work experience to profile")
  .addParam("company", "The company name")
  .addParam("position", "The job position")
  .addParam("start", "Start date (e.g., 2020-01)")
  .addParam("end", "End date (e.g., 2022-12)")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { company, position, start, end, contract } = taskArgs;
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    
    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Adding work experience for ${signer.address}...`);
    console.log(`Company: ${company}`);
    console.log(`Position: ${position}`);
    console.log(`Period: ${start} - ${end}`);
    
    const tx = await linkedinProfile.addWorkExperience(company, position, start, end);
    await tx.wait();
    
    console.log(`Work experience added successfully! Transaction: ${tx.hash}`);
  });

task("linkedin:set-salary", "Set encrypted salary")
  .addParam("salary", "The salary amount")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { salary, contract } = taskArgs;
    const { ethers, fhevm } = hre;

    const [signer] = await ethers.getSigners();
    
    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Setting encrypted salary for ${signer.address}...`);
    console.log(`Salary: ${salary}`);
    
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signer.address)
      .add32(parseInt(salary))
      .encrypt();
    
    const tx = await linkedinProfile.setSalary(encryptedInput.handles[0], encryptedInput.inputProof);
    await tx.wait();
    
    console.log(`Encrypted salary set successfully! Transaction: ${tx.hash}`);
  });

task("linkedin:authorize-viewer", "Authorize someone to view your salary")
  .addParam("viewer", "The address of the viewer to authorize")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { viewer, contract } = taskArgs;
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    
    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Authorizing ${viewer} to view salary of ${signer.address}...`);
    
    const tx = await linkedinProfile.authorizeSalaryViewer(viewer);
    await tx.wait();
    
    console.log(`Viewer authorized successfully! Transaction: ${tx.hash}`);
  });

task("linkedin:view-profile", "View a user's profile")
  .addParam("user", "The user's address")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { user, contract } = taskArgs;
    const { ethers } = hre;

    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Viewing profile for ${user}...`);
    
    try {
      const profile = await linkedinProfile.getProfile(user);
      
      console.log(`Name: ${profile.name}`);
      console.log(`Bio: ${profile.bio}`);
      console.log(`Work Experiences:`);
      
      for (let i = 0; i < profile.experiences.length; i++) {
        const exp = profile.experiences[i];
        console.log(`  ${i + 1}. ${exp.company} - ${exp.position} (${exp.startTime} to ${exp.endTime})`);
      }
      
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  });

task("linkedin:view-salary", "View a user's salary (if authorized)")
  .addParam("user", "The user's address")
  .addOptionalParam("contract", "The LinkedinProfile contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { user, contract } = taskArgs;
    const { ethers, fhevm } = hre;

    const [signer] = await ethers.getSigners();
    
    let contractAddress = contract;
    if (!contractAddress) {
      const deployments = await hre.deployments.all();
      contractAddress = deployments.LinkedinProfile?.address;
      if (!contractAddress) {
        throw new Error("LinkedinProfile contract not found. Deploy first or provide contract address.");
      }
    }

    const linkedinProfile = await ethers.getContractAt("LinkedinProfile", contractAddress);
    
    console.log(`Attempting to view salary of ${user} by ${signer.address}...`);
    
    try {
      const encryptedSalary = await linkedinProfile.getSalary(user);
      
      // Note: This would only work in mock environment for testing
      // In real deployment, you'd need to use the relayer SDK for decryption
      if (fhevm.isMock) {
        const decryptedSalary = await fhevm.userDecryptEuint(
          "euint32" as any,
          encryptedSalary,
          contractAddress,
          signer
        );
        console.log(`Salary: $${decryptedSalary}`);
      } else {
        console.log(`Encrypted salary handle: ${encryptedSalary}`);
        console.log(`Use the relayer SDK to decrypt this value`);
      }
      
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  });