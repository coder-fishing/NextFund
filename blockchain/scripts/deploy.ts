import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("NextFundDonate");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("NextFundDonate deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});