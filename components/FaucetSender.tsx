import { ChangeEvent, Component, MouseEvent } from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { SigningStargateClient } from "@cosmjs/stargate";

declare global {
  interface Window extends KeplrWindow {}
}

import styles from "../styles/Home.module.css";

interface FaucetSenderState {
  denom: string;
  faucetBalance: string;
  myAddress: string;
  myBalance: string;
  toSend: string;
}

export interface FaucetSenderProps {
  faucetAddress: string;
  rpcUrl: string;
}

export class FaucetSender extends Component<FaucetSenderProps, FaucetSenderState> {
  // Set the initial state
  constructor(props: FaucetSenderProps) {
    super(props);
    this.state = {
      denom: "stake",
      faucetBalance: "Loading...",
      myAddress: "Click first",
      myBalance: "Click first",
      toSend: "0",
    };
  }

  getTestnetChainInfo = (): ChainInfo => ({
    chainId: "sim_20191205-1",
    chainName: "sim_20191205-1",
    rpc: "http://127.0.0.1:26657",
    rest: "http://127.0.0.1:1317",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmos" + "pub",
      bech32PrefixValAddr: "cosmos" + "valoper",
      bech32PrefixValPub: "cosmos" + "valoperpub",
      bech32PrefixConsAddr: "cosmos" + "valcons",
      bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [
      {
        coinDenom: "stake",
        coinMinimalDenom: "stake",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
      {
        coinDenom: "THETA",
        coinMinimalDenom: "theta",
        coinDecimals: 0,
      },
      {
        coinDenom: "LAMBDA",
        coinMinimalDenom: "lambda",
        coinDecimals: 0,
      },
      {
        coinDenom: "RHO",
        coinMinimalDenom: "rho",
        coinDecimals: 0,
      },
      {
        coinDenom: "EPSILON",
        coinMinimalDenom: "epsilon",
        coinDecimals: 0,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "stake",
        coinMinimalDenom: "stake",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    stakeCurrency: {
      coinDenom: "stake",
      coinMinimalDenom: "stake",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 1,
      high: 1,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
  });

  // Store changed token amount to state
  onToSendChanged = (e: ChangeEvent<HTMLInputElement>) =>
    this.setState({
      toSend: e.currentTarget.value,
    });

  // When the user clicks the "send to faucet button"
  onSendClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    // Detect Keplr
    const { keplr } = window;
    if (!keplr) {
      alert("You need to install Keplr");
      return;
    }
    // Get the current state and amount of tokens that we want to transfer
    const { denom, toSend } = this.state;
    const { faucetAddress, rpcUrl } = this.props;
    // Suggest the testnet chain to Keplr
    await keplr.experimentalSuggestChain(this.getTestnetChainInfo());
    // Create the signing client
    const offlineSigner: OfflineSigner = window.getOfflineSigner!("sim_20191205-1");
    const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, offlineSigner);
    // Get the address and balance of your user
    const account: AccountData = (await offlineSigner.getAccounts())[0];
    this.setState({
      myAddress: account.address,
      myBalance: (await signingClient.getBalance(account.address, denom)).amount,
    });
    // Submit the transaction to send tokens to the faucet
    const sendResult = await signingClient.sendTokens(
      account.address,
      faucetAddress,
      [
        {
          denom: denom,
          amount: toSend,
        },
      ],
      {
        amount: [{ denom: "stake", amount: "500" }],
        gas: "200000",
      }
    );
    // Print the result to the console
    console.log(sendResult);
    // Update the balance in the user interface
    this.setState({
      myBalance: (await signingClient.getBalance(account.address, denom)).amount,
      faucetBalance: (await signingClient.getBalance(faucetAddress, denom)).amount,
    });
  };

  // The render function that draws the component at init and at state change
  render() {
    const { denom, faucetBalance, myAddress, myBalance, toSend } = this.state;
    const { faucetAddress } = this.props;
    console.log(toSend);
    // The web page structure itself
    return (
      <div>
        <fieldset className={styles.card}>
          <legend>Faucet</legend>
          <p>Address: {faucetAddress}</p>
          <p>Balance: {faucetBalance}</p>
        </fieldset>
        <fieldset className={styles.card}>
          <legend>You</legend>
          <p>Address: {myAddress}</p>
          <p>Balance: {myBalance}</p>
        </fieldset>
        <fieldset className={styles.card}>
          <legend>Send</legend>
          <p>To faucet:</p>
          <input value={toSend} type="number" onChange={this.onToSendChanged} /> {denom}
          <button onClick={this.onSendClicked}>Send to faucet</button>
        </fieldset>
      </div>
    );
  }
}
