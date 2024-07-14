async function main() {
    const [deployer] = await ethers.getSigners();
 
    console.log("Deploying contracts with the account:", deployer.address);
 
    const ContractFactory = await ethers.getContractFactory("USDTToken");
    const contract = await ContractFactory.deploy(50 * 10**60);
 
    console.log("Token address:", contract.address);
    }
 
    main().catch((error) => {
    console.error(error);
       process.exitCode = 1;
    });