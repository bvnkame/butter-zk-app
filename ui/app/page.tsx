'use client';
import { Field } from 'o1js';
import { useEffect, useState } from 'react';
import GradientBG from '../components/GradientBG';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './ZkappWorkerClient';
import firebase from 'firebase/app';
import App from './App';

let transactionFee = 0.2;
const ZKAPP_ADDRESS = 'B62qkeutRVh2ALVy1LedMbrMnRnMJ7rWf41u2nxynYoTb5rqETZe8zG';

export default function Home() {
  const [zkappWorkerClient, setZkappWorkerClient] = useState<null | ZkappWorkerClient>(null);
  const [hasWallet, setHasWallet] = useState<null | boolean>(null);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState<null | Field>(null);
  const [publicKeyBase58, setPublicKeyBase58] = useState('');
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [transactionlink, setTransactionLink] = useState('');
  
  const displayStep = (step: string) => {
    setDisplayText(step)
    console.log(step)
  }

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    const setup = async () => {
      try {
        if (!hasBeenSetup) {
          displayStep('Loading web worker...')
          const zkappWorkerClient = new ZkappWorkerClient();
          setZkappWorkerClient(zkappWorkerClient);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          displayStep('Done loading web worker')

          await zkappWorkerClient.setActiveInstanceToDevnet();

          const mina = (window as any).mina;
          if (mina == null) {
            setHasWallet(false);
            displayStep('Wallet not found.');
            return;
          }

          const publicKeyBase58: string = (await mina.requestAccounts())[0];
          setPublicKeyBase58(publicKeyBase58);
          displayStep(`Using key:${publicKeyBase58}`);

          displayStep('Checking if fee payer account exists...');
          const res = await zkappWorkerClient.fetchAccount(
          publicKeyBase58,
          );
          const accountExists = res.error === null;
          setAccountExists(accountExists);

          await zkappWorkerClient.loadContract();


          setHasBeenSetup(true);
          setHasWallet(true);
          setDisplayText('');

          displayStep('Compiling zkApp...');
          await zkappWorkerClient.compileContract();
          displayStep('zkApp compiled');


          console.log('Initializing zkApp instance...', ZKAPP_ADDRESS);
          await zkappWorkerClient.initZkappInstance(ZKAPP_ADDRESS);

          displayStep('Getting zkApp state...');
          await zkappWorkerClient.fetchAccount(ZKAPP_ADDRESS);
          setHasBeenSetup(true);
          setHasWallet(true);
          setDisplayText('');

          // const currentNum = await zkappWorkerClient.getNum();
          // setCurrentNum(currentNum);
          // console.log(`Current state in zkApp: ${currentNum}`);
          
        }
      } catch (error: any) {
        displayStep(`Error during setup: ${error.message}`);
      }
    };

    setup();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  useEffect(() => {
    const checkAccountExists = async () => {
      if (hasBeenSetup && !accountExists) {
        try { 
          for (;;) {
            displayStep('Checking if fee payer account exists...');
            
            const res = await zkappWorkerClient!.fetchAccount(publicKeyBase58);
            const accountExists = res.error == null;
            if (accountExists) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } 
        } catch (error: any) {
          displayStep(`Error checking account: ${error.message}`);
        }

      }
      setAccountExists(true);
    };

    checkAccountExists();
  }, [zkappWorkerClient, hasBeenSetup, accountExists]);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    try {
      setCreatingTransaction(true);
      displayStep('Creating a transaction...');
    
      console.log('publicKeyBase58 sending to worker', publicKeyBase58);
      await zkappWorkerClient!.fetchAccount(publicKeyBase58);

      await zkappWorkerClient!.createUpdateTransaction();

      displayStep('Creating proof...');
      console.time('⏱️ Proving transaction...');
      await zkappWorkerClient!.proveUpdateTransaction();
      console.timeEnd('⏱️ Proving transaction...');

      displayStep('Requesting send transaction...');
      const transactionJSON = await zkappWorkerClient!.getTransactionJSON();

      displayStep('Getting transaction JSON...');
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: transactionFee,
          memo: '',
        },
      });

      // const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
      const transactionLink = `https://zekoscan.io/testnet/tx/${hash}`;
      setTransactionLink(transactionLink);
      setDisplayText(transactionLink);

      setCreatingTransaction(true);
    } catch (error: any) {
      displayStep(`Error sending transaction: ${error.message}`);
    } finally {
      setCreatingTransaction(false);
    }
  };

  // -------------------------------------------------------
  // Refresh the current state

  const onRefreshCurrentNum = async () => {
    try {
      displayStep('Getting zkApp state...');
      await zkappWorkerClient!.fetchAccount(ZKAPP_ADDRESS);
      const currentUpdate = await zkappWorkerClient!.getCurrentUpdate();
      setCurrentUpdate(currentUpdate);
      console.log(`Current state in zkApp: ${currentUpdate}`);
      setDisplayText('');
    } catch (error: any) {
      displayStep(`Error refreshing state: ${error.message}`);
    }
  };

  // -------------------------------------------------------
  // Create UI elements

  let auroLinkElem;
  if (hasWallet === false) {
    const auroLink = 'https://www.aurowallet.com/';
    auroLinkElem = (
      <div>
        Could not find a wallet.{' '}
        <a href="https://www.aurowallet.com/" target="_blank" rel="noreferrer">
          Install Auro wallet here
        </a>
      </div>
    );
  }

  const stepDisplay = transactionlink ? (
    <a
      href={transactionlink}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'underline' }}
    >
      View transaction
    </a>
  ) : (
    displayText
  );

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}
    >
      {stepDisplay}
      {auroLinkElem}
    </div>
  );

  let accountDoesNotExist;
  if (hasBeenSetup && !accountExists) {
    const faucetLink =
      `https://faucet.minaprotocol.com/?address='${publicKeyBase58}`;
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: '1rem' }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  }

  let mainContent;
  if (hasBeenSetup && accountExists) {
    mainContent = (
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.center} style={{ padding: 0 }}>
          Current state in zkApp: {currentUpdate?.toString()}{' '}
        </div>
        <button
          className={styles.card}
          onClick={onSendTransaction}
          disabled={creatingTransaction}
        >
          Send Transaction
        </button>
        <button className={styles.card} onClick={onRefreshCurrentNum}>
          Get Latest State
        </button>
      </div>
    );
  }

  return (
    <GradientBG>
      <div style={{position: 'fixed', bottom: 0, fontSize: 12, color: "white", zIndex: 10, textAlign: 'center', width: '100%'}}>
        {setup}
        {accountDoesNotExist}
      </div>
      <App />
    </GradientBG>
  );
}