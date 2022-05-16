import useAppSelector from "./useAppSelector";

const useBalance = () => {
  const { balance } = useAppSelector((state) => state.account);
  return balance;
};

export default useBalance;
