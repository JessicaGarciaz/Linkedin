import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedLinkedinProfile = await deploy("LinkedinProfile", {
    from: deployer,
    log: true,
  });

  console.log(`LinkedinProfile contract: `, deployedLinkedinProfile.address);

  // Keep the original FHECounter for reference if needed
  // const deployedFHECounter = await deploy("FHECounter", {
  //   from: deployer,
  //   log: true,
  // });

  // console.log(`FHECounter contract: `, deployedFHECounter.address);
};
export default func;
func.id = "deploy_contracts"; // id required to prevent reexecution
func.tags = ["LinkedinProfile", "FHECounter"];
