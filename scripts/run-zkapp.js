"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZKAPP_ADDRESS = void 0;
exports.runZkapp = runZkapp;
const o1js_1 = require("o1js");
const Add_js_1 = require("../build/src/Add.js");
exports.ZKAPP_ADDRESS = 'B62qndLnsHkBtggoG1d9tutYdVasyjQh8wd5xu6uqaWC7CuQo6VFPU6';
const ZK_ACC_ADDRESS = 'B62qqmSsY9ZtZV7Ug2dQAowDs9xxYTUsQLqEPEXSV7236Z75kCHwfQJ';
let feePayer = o1js_1.PrivateKey.fromBase58(process.env.PRIVATE_KEY);
const state = {
    AddInstance: null,
};
async function runZkapp() {
    try {
        // const mina = Mina.Network('https://devnet.zeko.io/graphql');
        const mina = o1js_1.Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
        o1js_1.Mina.setActiveInstance(mina);
        const publicKey = o1js_1.PublicKey.fromBase58(ZK_ACC_ADDRESS);
        const account = await (0, o1js_1.fetchAccount)({ publicKey });
        console.log('Zkapp account:', account.account?.balance.toString());
        // Create proof
        // zkapp account
        // let zkAppPrivateKey = PrivateKey.random();
        // let zkAppAddress = zkAppPrivateKey.toPublicKey();
        state.AddInstance = Add_js_1.Add;
        console.log('Compiling zkApp...', feePayer);
        await state.AddInstance.compile();
        const zkAppPubKey = o1js_1.PublicKey.fromBase58(exports.ZKAPP_ADDRESS);
        let zkAppInstance = new state.AddInstance(zkAppPubKey);
        await (0, o1js_1.fetchAccount)({ publicKey: zkAppPubKey });
        // get apps state
        const currentNumber = await zkAppInstance.num.get();
        console.log('Current zkApp state:', currentNumber.toString());
        // // deploy zkapp
        let txn = await o1js_1.Mina.transaction(feePayer.toPublicKey(), async () => {
            o1js_1.AccountUpdate.fundNewAccount(feePayer.toPublicKey());
            await zkAppInstance.update();
        });
        console.time('Proving time');
        await txn.prove();
        console.timeEnd('Proving time');
        await txn.sign([feePayer]).send();
        const newNumber = await zkAppInstance.num.get();
        console.log('New zkApp state:', newNumber.toString());
    }
    catch (error) {
        console.log('Error:', error.message);
    }
}
runZkapp();
//# sourceMappingURL=run-zkapp.js.map