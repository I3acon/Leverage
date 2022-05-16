import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import {
  Box,
  Center,
  Text,
  Container,
  Button,
  Flex,
  Spacer,
  Divider,
  SkeletonText,
} from "@chakra-ui/react";
import Head from "next/head";

import useAccount from "../hooks/useAccount";
import { useLeverage, useChainlink } from "../hooks/useContracts";

const Position = () => {
  const account = useAccount();
  const Leverage = useLeverage();
  const Chainlink = useChainlink();

  const [depositAmount, setDepositAmount] = useState(0);
  const [borrowBalance, setBorrowBalance] = useState(0);
  const [swapBalance, setSwapBalance] = useState(0);
  const [ETHprice, setETHprice] = useState(0);

  const getDepositAmount = useCallback(async () => {
    const _depositAmount = await Leverage.methods
      .returnMintBalance()
      .call({ from: account });
    setDepositAmount(parseFloat(Web3.utils.fromWei(_depositAmount, "ether")));
  }, [Leverage.methods, account]);

  const getBorrowBalance = useCallback(async () => {
    const _borrowBalance = await Leverage.methods
      .returnBorrowBalance()
      .call({ from: account });
    setBorrowBalance(_borrowBalance);
  }, [Leverage.methods, account]);

  const getSwapBalance = useCallback(async () => {
    const _swapBalance = await Leverage.methods
      .returnSwapBalance()
      .call({ from: account });
    setSwapBalance(parseFloat(Web3.utils.fromWei(_swapBalance, "ether")));
  }, [Leverage.methods, account]);

  const getETHprice = useCallback(async () => {
    const _roundData = await Chainlink.methods.latestRoundData().call();
    const _decimal = await Chainlink.methods.decimals().call();
    const _price = 1 / (_roundData.answer.toString() / Math.pow(10, _decimal));
    setETHprice(parseFloat(_price));
  }, [Chainlink.methods]);

  useEffect(() => {
    if (Leverage.methods) {
      getDepositAmount();
      getBorrowBalance();
      getSwapBalance();
    }
  }, [Leverage.methods, getBorrowBalance, getDepositAmount, getSwapBalance]);

  useEffect(() => {
    Chainlink.methods && getETHprice();
  }, [Chainlink.methods, getETHprice]);

  const handleclosePosition = async () => {
    await Leverage.methods.closePosition().send({ from: account });
  };
  return (
    <>
      <Head>
        <title>Dev10X | My Position</title>
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
                <b>My Position</b>
              </h1>
              <SkeletonText
                p="4"
                noOfLines={4}
                spacing="4"
                isLoaded={!(account == "0x0")}
              >
                <Flex pt={3}>
                  <Text fontSize="sm">Deposit Amount</Text>
                  <Spacer />
                  <Text color="blue.500">
                    <small>
                      <b>{depositAmount} ETH</b>
                    </small>
                  </Text>
                </Flex>

                <Flex pt={3}>
                  <Text fontSize="sm">Borrow Amount</Text>
                  <Spacer />
                  <Text color="blue.500">
                    {" "}
                    <small>
                      <b>{borrowBalance} DAI</b>
                    </small>
                  </Text>
                </Flex>

                <Divider style={{ backgroundColor: "#fff" }} mt={3} mb={3} />
                <h1 style={{ fontSize: "16px" }}>
                  <b>
                    <Flex>
                      <Text>Swap</Text>
                      <Text pl={1} color="blue.500">
                        {borrowBalance} DAI
                      </Text>
                      <Text pl={1}>to</Text>
                      <Text pl={1} color="blue.500">
                        {swapBalance.toFixed(1)} ETH
                      </Text>
                    </Flex>
                  </b>
                </h1>

                <Flex pt={3}>
                  <Text fontSize="sm">Total ETH</Text>
                  <Spacer />
                  <Text color="blue.500">
                    <small>
                      <b>
                        {parseFloat(depositAmount + swapBalance).toFixed(1)} ETH
                      </b>
                    </small>
                  </Text>
                </Flex>

                <Flex pt={3}>
                  <Text fontSize="sm">Current ETH Price</Text>
                  <Spacer />
                  <Text color="blue.500">
                    <small>
                      <b>{parseFloat(ETHprice).toFixed(2)} DAI</b>
                    </small>
                  </Text>
                </Flex>

                <Flex pt={3}>
                  <Text fontSize="sm">PNL</Text>
                  <Spacer />
                  <Text color="blue.500">
                    <small>
                      <b>
                        {parseFloat(
                          borrowBalance - swapBalance * ETHprice
                        ).toFixed(2)}{" "}
                        DAI
                      </b>
                    </small>
                  </Text>
                </Flex>
              </SkeletonText>
              {account == "0x0" ? (
                <Button
                  style={{ backgroundColor: "#200de2" }}
                  w="100%"
                  mt={5}
                  borderRadius="18px"
                  disabled={account == "0x0"}
                >
                  {account == "0x0" ? "Please Connect Wallet" : "Leverage 1.3x"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleclosePosition();
                  }}
                  colorScheme="red"
                  w="100%"
                  mt={3}
                  borderRadius="18px"
                >
                  Close Position
                </Button>
              )}
            </Box>
          </Center>
        </Box>
      </Container>
    </>
  );
};

export default Position;
