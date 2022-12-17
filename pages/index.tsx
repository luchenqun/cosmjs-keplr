import type { NextPage } from "next";
import { FaucetSender } from "../components/FaucetSender";

const Home: NextPage = () => {
  return <FaucetSender faucetAddress="cosmos14jcgsf4fulm8phpy37lp35cup3cdx50vpaagdd" rpcUrl="http://127.0.0.1:26657" />;
};

export default Home;
