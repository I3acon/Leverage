import useAppSelector from "./useAppSelector";

const useAuth = () => {
  const { auth } = useAppSelector((state) => state.account);
  return auth;
};

export default useAuth;
