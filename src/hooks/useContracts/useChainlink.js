import useContract from "../useContract";
import config from "../../../config.json";
import Chainlink_ABI from "../../../constants/AggregatorV3Interface.json";
import { useState, useEffect } from "react";

const useChainlink = () => {
  const abi = Chainlink_ABI;
  const contract = useContract(abi, config.contracts.chainlink.address);
  const [methods, setMethods] = useState(null);
  const address = config.contracts.chainlink.address;

  useEffect(() => {
    if (contract) {
      setMethods(contract.methods);
    }
  }, [contract]);

  return { contract, methods, address };
};

export default useChainlink;
