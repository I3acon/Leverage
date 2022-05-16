import useContract from "../useContract";
import config from "../../../config.json";
import Leverage_ABI from "../../../artifacts/contracts/Leverage.sol/Leverage.json";
import { useState, useEffect } from "react";

const useLaverage = () => {
  const abi = Leverage_ABI.abi;
  const contract = useContract(abi, config.contracts.leverage.address);
  const [methods, setMethods] = useState(null);
  const address = config.contracts.leverage.address;

  useEffect(() => {
    if (contract) {
      setMethods(contract.methods);
    }
  }, [contract]);

  return { contract, methods, address };
};

export default useLaverage;
