import { useEffect, useState } from "react";
import Web3 from "web3";
import useAccount from "./useAccount";

const useContract = (abi, address) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const account = useAccount();

  useEffect(() => {
    if (web3 && account != "0x0") {
      setContract(new web3.eth.Contract(abi, address));
      console.log("Init Contract => \n" + address + " \n successfully");
    }
  }, [abi, address, web3, account]);

  useEffect(() => {
    if (account != "0x0") {
      const _web3 = new Web3(window.web3);
      if (_web3.eth && !web3) {
        setWeb3(_web3);
      }
    }
  }, [account, web3]);

  return contract;
};

export default useContract;
