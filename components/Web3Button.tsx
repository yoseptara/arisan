import React from 'react';
import { useWeb3Context } from '../contexts/';

interface ConnectProps {
  connect: (() => Promise<void>) | null;
}
const ConnectButton = ({ connect }: ConnectProps) => {
  return connect ? (
    <button onClick={connect}>Connect</button>
  ) : (
    <button>Loading...</button>
  );
};

interface DisconnectProps {
  disconnect: (() => Promise<void>) | null;
}

const DisconnectButton = ({ disconnect }: DisconnectProps) => {
  return disconnect ? (
    <button onClick={disconnect}>Disconnect</button>
  ) : (
    <button>Loading...</button>
  );
};

export function Web3Button() {
  const { web3Provider, connect, disconnect } = useWeb3Context();

  // console.log('(Web3Button.tsx) value of web3Provider : ', web3Provider);
  // console.log('(Web3Button.tsx) value of connect : ', connect);

  return web3Provider ? (
    <DisconnectButton disconnect={disconnect} />
  ) : (
    <ConnectButton connect={connect} />
  );
}
