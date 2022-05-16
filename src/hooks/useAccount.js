import useAppSelector from "./useAppSelector";

const useAccount = () => {
  const { account } = useAppSelector((state) => state.account);
  return account;
};

export default useAccount;
