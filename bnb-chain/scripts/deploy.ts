import fs from "fs";
import path from "path";
import dotenv from "dotenv";
// import HDWalletProvider from "@truffle/hdwallet-provider";
import readline from "readline";
import { ethers } from "ethers";
import * as ArisanGroupFactoryJson from "../artifacts/contracts/Arisan.sol/ArisanGroupFactory.json";

const updateEnv = (key: string, value: string) => {
  const envFilePath = path.resolve(__dirname, "../../web/.env.local");

  // Read the .env file content
  fs.readFile(envFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading .env file:", err);
      return;
    }

    // Check if the key already exists
    const regex = new RegExp(`^${key}=`, "m");
    const keyExists = regex.test(data);

    if (keyExists) {
      // Replace the existing key-value pair with the new value
      const updatedContent = data.replace(
        new RegExp(`(${key}=)(.*)`, "m"),
        `$1${value}`
      );

      // Write the modified content back to the .env file
      fs.writeFile(envFilePath, updatedContent, "utf8", (err) => {
        if (err) {
          console.error("Error writing .env file:", err);
          return;
        }

        console.log(
          `Successfully updated the key-value pair "${key}=${value}" in the .env.local file.`
        );
      });
    } else {
      // Modify the content by adding a new key-value pair
      const newContent = data + `\n${key}=${value}\n`;

      // Write the modified content back to the .env file
      fs.writeFile(envFilePath, newContent, "utf8", (err) => {
        if (err) {
          console.error("Error writing .env file:", err);
          return;
        }

        console.log(
          `Successfully added the new key-value pair "${key}=${value}" to the .env file.`
        );
      });
    }
  });
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function waitForTransaction(
  provider: ethers.providers.JsonRpcProvider,
  tx: ethers.providers.TransactionResponse
) {
  let finished = false;
  const result = await Promise.race([
    tx.wait(),
    (async () => {
      while (!finished) {
        await delay(3000);
        const mempoolTx = await provider.getTransaction(tx.hash);
        if (!mempoolTx) {
          return null;
        }
      }
    })(),
  ]);
  finished = true;
  if (!result) {
    throw `Transaction ${tx.hash} failed`;
  }
  return result;
}

const deploy = async () => {
  dotenv.config({ path: "../.env" });

  const MNEMONIC_PHRASE = process.env.MNEMONIC_PHRASE;
  const RPC_ANKR_URL = process.env.RPC_ANKR_URL;

  if (!MNEMONIC_PHRASE || !RPC_ANKR_URL) {
    throw new Error(
      "MNEMONIC_PHRASE or RPC_ANKR_URL is not properly configured"
    );
  }

  try {
    // const provider = new HDWalletProvider(MNEMONIC_PHRASE, RPC_ANKR_URL);
    // const web3 = new Web3(provider as any);
    // const accounts = await web3.eth.getAccounts();

    // Create an instance of ethers.Wallet with the mnemonic
    const wallet = ethers.Wallet.fromMnemonic(MNEMONIC_PHRASE);

    // Create a provider instance for the desired network using the RPC URL
    const provider = new ethers.providers.JsonRpcProvider(RPC_ANKR_URL);

    // Connect the wallet to the provider
    const signer = wallet.connect(provider);
    const address = await signer.getAddress();

    // const gasPrice = await web3.eth.getGasPrice();
    // const increasedGasPrice = web3.utils
    //   .toBN(Math.floor(parseFloat(gasPrice) * 1.2))
    //   .toString();

    const factory = new ethers.ContractFactory(
      ArisanGroupFactoryJson.abi,
      ArisanGroupFactoryJson.bytecode,
      signer
    );

    console.log("Attempting to deploy from account", address);

    // const gasEstimation = await new web3.eth.Contract(
    //   ArisanGroupFactoryJson.abi as any
    // )
    //   .deploy({
    //     data: ArisanGroupFactoryJson.bytecode,
    //   })
    //   .estimateGas({ from: accounts[0] });

    const [gasEstimation, gasPrice] = await Promise.all([
      provider.estimateGas(factory.getDeployTransaction()),
      provider.getGasPrice(),
    ]);

    // const cost = web3.utils.toBN(gasEstimation).mul(web3.utils.toBN(gasPrice));
    const cost = gasEstimation.mul(gasPrice);

    // const costInBNB = web3.utils.fromWei(cost, "ether");
    const costInBNB = ethers.utils.formatEther(cost);

    console.log(`Estimated gas fee: ${gasEstimation} (cost: ${costInBNB} BNB)`);

    const confirm = await new Promise<boolean>((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Confirm deployment? (press enter to confirm, esc to cancel) ",
        (answer) => {
          rl.close();
          resolve(answer === "");
        }
      );

      rl.on("SIGINT", () => {
        rl.close();
        resolve(false);
      });
    });

    if (!confirm) {
      console.log("Deployment cancelled.");
      return;
    }

    console.log("Waiting for deployment");

    // const deployedGroupFactory = await new web3.eth.Contract(
    //   ArisanGroupFactoryJson.abi as any
    // )
    //   .deploy({
    //     data: ArisanGroupFactoryJson.bytecode,
    //   })
    //   .send({ gas: 30000000, from: accounts[0] });

    // let overrides = {
    //   gasLimit: 30000000, // custom gas limit
    // };
    const deployedGroupFactory = await factory.deploy();
    await deployedGroupFactory.deployTransaction.wait();
    // await deployedGroupFactory.deployed();
    // await waitForTransaction(provider, deployedGroupFactory.deployTransaction);

    console.log("Contract deployed to", deployedGroupFactory.address);
    updateEnv(
      "NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS",
      deployedGroupFactory.address
    );
  } catch (error) {
    console.error("Error when deploying : ", error);
    throw error;
  }
};

deploy();
