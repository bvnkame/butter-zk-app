import { AccountUpdate, fetchAccount, Mina, PrivateKey, PublicKey } from 'o1js';
import { Add } from '../build/src/Add.js';

export const ZKAPP_ADDRESS = 'B62qndLnsHkBtggoG1d9tutYdVasyjQh8wd5xu6uqaWC7CuQo6VFPU6';
const ZK_ACC_ADDRESS = 'B62qqmSsY9ZtZV7Ug2dQAowDs9xxYTUsQLqEPEXSV7236Z75kCHwfQJ';
let feePayer = PrivateKey.fromBase58(process.env.PRIVATE_KEY);

const state = {
  AddInstance: null as null | typeof Add,
}

export async function runZkapp() {
    try {
        // const mina = Mina.Network('https://devnet.zeko.io/graphql');
        const mina = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');

        Mina.setActiveInstance(mina);

        const publicKey = PublicKey.fromBase58(ZK_ACC_ADDRESS);
        const account = await fetchAccount({publicKey});
        console.log('Zkapp account:', account.account?.balance.toString());

        // Create proof
        // zkapp account
        // let zkAppPrivateKey = PrivateKey.random();
        // let zkAppAddress = zkAppPrivateKey.toPublicKey();
        state.AddInstance = Add;

        console.log('Compiling zkApp...', feePayer);
        
        await state.AddInstance.compile();

        const zkAppPubKey = PublicKey.fromBase58(ZKAPP_ADDRESS);
        let zkAppInstance = new state.AddInstance(zkAppPubKey);

        await fetchAccount({publicKey: zkAppPubKey});
        // get apps state
        const currentNumber = await zkAppInstance.num.get();
        console.log('Current zkApp state:', currentNumber.toString());

        // // deploy zkapp
        let txn = await Mina.transaction(feePayer.toPublicKey(), async () => {
            AccountUpdate.fundNewAccount(feePayer.toPublicKey());
            await zkAppInstance.update();
        });

        console.time('Proving time');
        await txn.prove();
        console.timeEnd('Proving time');

        await txn.sign([feePayer]).send();

        const newNumber = await zkAppInstance.num.get();
        console.log('New zkApp state:', newNumber.toString());

    } catch (error: any) {
    console.log('Error:', error.message);
  }
}

runZkapp();