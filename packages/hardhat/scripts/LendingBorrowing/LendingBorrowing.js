async function main() {
    const [deployer] = await ethers.getSigners();
 
    console.log("Deploying contracts with the account:", deployer.address);
 
    const ContractFactory = await ethers.getContractFactory("LendingBorrowing");
    let depositTokenAddress = '0xC659B2633Ed725e5346396a609d8f31794d6ac50';
    depositTokenAddress = depositTokenAddress.toLowerCase();
    let borrowTokenAddress = '0xAA24A5A5E273EFAa64a960B28de6E27B87FfDFfc';
    borrowTokenAddress = borrowTokenAddress.toLowerCase();
    const contract = await ContractFactory.deploy();
 
    console.log("Protocol address:", contract.address);
    }
 
    main().catch((error) => {
    console.error(error);
       process.exitCode = 1;
    });