import { Button, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { IoWallet } from "react-icons/io5";
import Web3 from "web3";

import { setAccountData, setBalance, setAuth } from "../slices/account";
import useAppDispatch from "../hooks/useAppDispatch";

export default function ConnectButton() {
  const [account, setAccount] = useState();
  const dispatch = useAppDispatch();
  const Toast = useToast();

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      dispatch(setAccountData({ account: accounts[0] }));
      const balance = await web3.eth.getBalance(accounts[0]);
      dispatch(setBalance({ balance: balance }));
      dispatch(setAuth({ auth: true }));
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      dispatch(setAccountData({ account: accounts[0] }));
      const balance = await web3.eth.getBalance(accounts[0]);
      dispatch(setBalance({ balance: balance }));
      dispatch(setAuth({ auth: true }));
    } else {
      Toast({
        title: "Non-Ethereum browser detected",
        description: "You should consider trying MetaMask!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const displayAccount = (acc) => {
    return acc.substring(0, 6) + "..." + acc.substring(38, 42);
  };

  return account ? (
    <>
      <Button
        style={{ backgroundColor: "#200de2", borderRadius: "18px" }}
        display={{ base: "none", md: "flex" }}
        ml={2}
      >
        <IoWallet style={{ marginRight: 10 }} /> {displayAccount(account)}
      </Button>

      <Button
        style={{ backgroundColor: "#200de2" }}
        display={{ base: "flex", md: "none", sm: "flex" }}
        ml={10}
        p={7}
        position="fixed"
        right={0}
        bottom={0}
        w="100%"
      >
        <IoWallet style={{ marginRight: 10 }} />
        {displayAccount(account)}
      </Button>
    </>
  ) : (
    <>
      <Button
        style={{ backgroundColor: "#200de2", borderRadius: "18px" }}
        display={{ base: "none", md: "flex" }}
        ml={10}
        onClick={loadWeb3}
      >
        <IoWallet style={{ marginRight: 10 }} />
        Connect wallet
      </Button>

      <Button
        style={{ backgroundColor: "#200de2" }}
        display={{ base: "flex", md: "none", sm: "flex" }}
        ml={10}
        p={7}
        position="fixed"
        right={0}
        bottom={0}
        w="100%"
        onClick={loadWeb3}
      >
        <IoWallet style={{ marginRight: 10 }} />
        Connect wallet
      </Button>
    </>
  );
}
