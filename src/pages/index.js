import { useState } from "react";
import Web3 from "web3";
import Head from "next/head";

import {
  Box,
  Text,
  FormControl,
  InputGroup,
  Center,
  Input,
  Container,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";

import useAccount from "../hooks/useAccount";
import useBalance from "../hooks/useBalance";
import { useLeverage } from "../hooks/useContracts";

const Leverage = () => {
  const account = useAccount();
  const balance = useBalance();
  const Leverage = useLeverage();
  const Toast = useToast();

  const [leverageAmount, setLeverageAmount] = useState(0);

  const handleSetMaxETH = () => {
    setLeverageAmount(Web3.utils.fromWei(balance, "ether"));
  };

  const handleChanheLeverageAmount = (e) => {
    setLeverageAmount(e.target.value);
    if (
      parseFloat(e.target.value) >
      parseFloat(Web3.utils.fromWei(balance, "ether"))
    ) {
      Toast({
        title: "Warning",
        description: "Please enter a valid amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setLeverageAmount(0);
    }
  };

  const handleLeverage = async () => {
    const _value = Web3.utils.toWei(leverageAmount, "ether");
    await Leverage.methods
      .deposit(_value)
      .send({ from: account, value: _value });
  };

  return (
    <>
      <Head>
        <title>Dev10X | Leverage</title>
        <meta
          name="description"
          content="SCB10X Smart Contract Engineer Test"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW="container.xl">
        <Box paddingTop={{ base: "50px", md: "150px", lg: "150px" }}>
          <Center>
            <Box className="box" style={{ textAlign: "left" }}>
              <h1 style={{ fontSize: "22px" }}>
                <b>Leverage</b>
              </h1>
              <Text pt={3} fontSize="sm">
                Balance:{" "}
                {account != "0x0" && balance
                  ? Web3.utils.fromWei(balance, "ether") + " ETH"
                  : ""}
              </Text>
              <FormControl id="eth" pt={3}>
                <InputGroup size="md">
                  <Input
                    style={{ backgroundColor: "#fff", color: "#000" }}
                    type="number"
                    value={leverageAmount}
                    onChange={handleChanheLeverageAmount}
                    placeholder="0.00"
                    disabled={account == "0x0"}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      color="#000"
                      h="1.75rem"
                      disabled={account == "0x0"}
                      size="sm"
                      onClick={handleSetMaxETH}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>

                <Button
                  style={{ backgroundColor: "#200de2" }}
                  w="100%"
                  mt={3}
                  borderRadius="18px"
                  disabled={account == "0x0"}
                  onClick={handleLeverage}
                >
                  {account == "0x0" ? "Please Connect Wallet" : "Leverage 1.3x"}
                </Button>
              </FormControl>
            </Box>
          </Center>
        </Box>
      </Container>
    </>
  );
};

export default Leverage;
