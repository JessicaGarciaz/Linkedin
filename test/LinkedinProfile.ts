import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { LinkedinProfile, LinkedinProfile__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("LinkedinProfile")) as LinkedinProfile__factory;
  const linkedinContract = (await factory.deploy()) as LinkedinProfile;
  const linkedinContractAddress = await linkedinContract.getAddress();

  return { linkedinContract, linkedinContractAddress };
}

describe("LinkedinProfile", function () {
  let signers: Signers;
  let linkedinContract: LinkedinProfile;
  let linkedinContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      deployer: ethSigners[0], 
      alice: ethSigners[1], 
      bob: ethSigners[2], 
      carol: ethSigners[3] 
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ linkedinContract, linkedinContractAddress } = await deployFixture());
  });

  describe("Profile Management", function () {
    it("should create a new profile", async function () {
      const tx = await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer passionate about blockchain");
      
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const profile = await linkedinContract.getProfile(signers.alice.address);
      expect(profile.name).to.equal("Alice Smith");
      expect(profile.bio).to.equal("Software Engineer passionate about blockchain");
    });

    it("should not allow creating duplicate profiles", async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");

      await expect(
        linkedinContract
          .connect(signers.alice)
          .createProfile("Alice Updated", "Updated bio")
      ).to.be.revertedWith("Profile already exists");
    });

    it("should update an existing profile", async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");

      await linkedinContract
        .connect(signers.alice)
        .updateProfile("Alice Johnson", "Senior Software Engineer");

      const profile = await linkedinContract.getProfile(signers.alice.address);
      expect(profile.name).to.equal("Alice Johnson");
      expect(profile.bio).to.equal("Senior Software Engineer");
    });

    it("should not allow updating non-existent profile", async function () {
      await expect(
        linkedinContract
          .connect(signers.alice)
          .updateProfile("Alice Johnson", "Senior Software Engineer")
      ).to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Work Experience Management", function () {
    beforeEach(async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");
    });

    it("should add work experience", async function () {
      const tx = await linkedinContract
        .connect(signers.alice)
        .addWorkExperience("Google", "Software Engineer", "2020-01", "2022-12");
      
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const experienceCount = await linkedinContract.getWorkExperienceCount(signers.alice.address);
      expect(experienceCount).to.equal(1);

      const experience = await linkedinContract.getWorkExperience(signers.alice.address, 0);
      expect(experience.company).to.equal("Google");
      expect(experience.position).to.equal("Software Engineer");
      expect(experience.startTime).to.equal("2020-01");
      expect(experience.endTime).to.equal("2022-12");
      expect(experience.isActive).to.be.true;
    });

    it("should update work experience", async function () {
      await linkedinContract
        .connect(signers.alice)
        .addWorkExperience("Google", "Software Engineer", "2020-01", "2022-12");

      await linkedinContract
        .connect(signers.alice)
        .updateWorkExperience(0, "Google", "Senior Software Engineer", "2020-01", "2023-12");

      const experience = await linkedinContract.getWorkExperience(signers.alice.address, 0);
      expect(experience.company).to.equal("Google");
      expect(experience.position).to.equal("Senior Software Engineer");
      expect(experience.endTime).to.equal("2023-12");
    });

    it("should not allow adding experience to non-existent profile", async function () {
      await expect(
        linkedinContract
          .connect(signers.bob)
          .addWorkExperience("Google", "Software Engineer", "2020-01", "2022-12")
      ).to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Salary Management", function () {
    beforeEach(async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");
    });

    it("should set encrypted salary", async function () {
      const clearSalary = 150000;
      const encryptedSalary = await fhevm
        .createEncryptedInput(linkedinContractAddress, signers.alice.address)
        .add32(clearSalary)
        .encrypt();

      const tx = await linkedinContract
        .connect(signers.alice)
        .setSalary(encryptedSalary.handles[0], encryptedSalary.inputProof);
      
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);
    });

    it("should allow owner to view their own salary", async function () {
      const clearSalary = 150000;
      const encryptedSalary = await fhevm
        .createEncryptedInput(linkedinContractAddress, signers.alice.address)
        .add32(clearSalary)
        .encrypt();

      await linkedinContract
        .connect(signers.alice)
        .setSalary(encryptedSalary.handles[0], encryptedSalary.inputProof);

      const encryptedSalaryResult = await linkedinContract
        .connect(signers.alice)
        .getSalary(signers.alice.address);

      const decryptedSalary = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSalaryResult,
        linkedinContractAddress,
        signers.alice
      );

      expect(decryptedSalary).to.equal(clearSalary);
    });

    it("should not allow unauthorized users to view salary", async function () {
      const clearSalary = 150000;
      const encryptedSalary = await fhevm
        .createEncryptedInput(linkedinContractAddress, signers.alice.address)
        .add32(clearSalary)
        .encrypt();

      await linkedinContract
        .connect(signers.alice)
        .setSalary(encryptedSalary.handles[0], encryptedSalary.inputProof);

      await expect(
        linkedinContract
          .connect(signers.bob)
          .getSalary(signers.alice.address)
      ).to.be.revertedWith("Not authorized to view salary");
    });
  });

  describe("Salary Authorization", function () {
    beforeEach(async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");

      const clearSalary = 150000;
      const encryptedSalary = await fhevm
        .createEncryptedInput(linkedinContractAddress, signers.alice.address)
        .add32(clearSalary)
        .encrypt();

      await linkedinContract
        .connect(signers.alice)
        .setSalary(encryptedSalary.handles[0], encryptedSalary.inputProof);
    });

    it("should authorize salary viewer", async function () {
      const tx = await linkedinContract
        .connect(signers.alice)
        .authorizeSalaryViewer(signers.bob.address);
      
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const isAuthorized = await linkedinContract.isSalaryViewerAuthorized(
        signers.alice.address, 
        signers.bob.address
      );
      expect(isAuthorized).to.be.true;
    });

    it("should allow authorized viewer to see salary", async function () {
      const clearSalary = 150000;
      
      await linkedinContract
        .connect(signers.alice)
        .authorizeSalaryViewer(signers.bob.address);

      const encryptedSalaryResult = await linkedinContract
        .connect(signers.bob)
        .getSalary(signers.alice.address);

      const decryptedSalary = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedSalaryResult,
        linkedinContractAddress,
        signers.bob
      );

      expect(decryptedSalary).to.equal(clearSalary);
    });

    it("should revoke salary viewer authorization", async function () {
      await linkedinContract
        .connect(signers.alice)
        .authorizeSalaryViewer(signers.bob.address);

      let isAuthorized = await linkedinContract.isSalaryViewerAuthorized(
        signers.alice.address, 
        signers.bob.address
      );
      expect(isAuthorized).to.be.true;

      await linkedinContract
        .connect(signers.alice)
        .revokeSalaryViewer(signers.bob.address);

      isAuthorized = await linkedinContract.isSalaryViewerAuthorized(
        signers.alice.address, 
        signers.bob.address
      );
      expect(isAuthorized).to.be.false;
    });

    it("should not allow self-authorization", async function () {
      await expect(
        linkedinContract
          .connect(signers.alice)
          .authorizeSalaryViewer(signers.alice.address)
      ).to.be.revertedWith("Cannot authorize yourself");
    });

    it("should get authorized viewers list", async function () {
      await linkedinContract
        .connect(signers.alice)
        .authorizeSalaryViewer(signers.bob.address);
      
      await linkedinContract
        .connect(signers.alice)
        .authorizeSalaryViewer(signers.carol.address);

      const viewers = await linkedinContract
        .connect(signers.alice)
        .getAuthorizedViewers(signers.alice.address);

      expect(viewers.length).to.equal(2);
      expect(viewers).to.include(signers.bob.address);
      expect(viewers).to.include(signers.carol.address);
    });
  });

  describe("Access Control", function () {
    it("should not allow viewing non-existent profile", async function () {
      await expect(
        linkedinContract.getProfile(signers.bob.address)
      ).to.be.revertedWith("Profile does not exist");
    });

    it("should only allow profile owner to view authorized viewers", async function () {
      await linkedinContract
        .connect(signers.alice)
        .createProfile("Alice Smith", "Software Engineer");

      await expect(
        linkedinContract
          .connect(signers.bob)
          .getAuthorizedViewers(signers.alice.address)
      ).to.be.revertedWith("Only profile owner can view authorized viewers");
    });
  });
});