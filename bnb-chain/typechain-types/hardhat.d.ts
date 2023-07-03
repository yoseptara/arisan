/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "ArisanGroupFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ArisanGroupFactory__factory>;
    getContractFactory(
      name: "Group",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Group__factory>;

    getContractAt(
      name: "ArisanGroupFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ArisanGroupFactory>;
    getContractAt(
      name: "Group",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Group>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}