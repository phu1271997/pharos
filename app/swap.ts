import { sleep, wallets } from "./config";

const { Web3 } = require("web3");
const web3 = new Web3("https://testnet.dplabs-internal.com");
const SWAP_CONTRACT = "0x1a4de519154ae51200b0ad7c90f7fac75547888a";
const SWAP_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "collectionAndSelfcalls",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

function randomNumber() {
  //Random swap tối thiêu 0.001 $PHRS, tối đa 0.005 $PHRS
  const min = 0.001;
  const max = 0.005;
  const randomNum = min + Math.random() * (max - min);
  return Number(randomNum.toFixed(3));
}
function randomToken() {
  const tokens = [
    {
      tokenName: "USDT",
      ctr_address: "0xed59de2d7ad9c043442e381231ee3646fc3c2939",
    },
    {
      tokenName: "USDC",
      ctr_address: "0xAD902CF99C2dE2f1Ba5ec4D642Fd7E49cae9EE37",
    },
  ];
  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
  return randomToken;
}

async function claim() {
  for (let index = 0; index < wallets.length; index++) {
    const { address1, private1 } = wallets[index];
    console.log(`Bắt đầu ví ${index + 1}. 0x...${address1.slice(-4)}`);
    try {
      const contract = new web3.eth.Contract(SWAP_ABI, SWAP_CONTRACT);
      const _value = randomNumber();
      const { tokenName, ctr_address } = randomToken();
      const value = web3.utils.toWei(_value, "ether");
      const exactInputSingleData = web3.eth.abi.encodeFunctionCall(
        {
          name: "exactInputSingle",
          type: "function",
          inputs: [
            {
              type: "tuple",
              name: "params",
              components: [
                { name: "tokenIn", type: "address" },
                { name: "tokenOut", type: "address" },
                { name: "fee", type: "uint24" },
                { name: "recipient", type: "address" },
                { name: "amountIn", type: "uint256" },
                { name: "amountOutMinimum", type: "uint256" },
                { name: "sqrtPriceLimitX96", type: "uint160" },
              ],
            },
          ],
        },
        [
          {
            tokenIn: "0x76aaada469d23216be5f7c596fa25f282ff9b364",
            tokenOut: ctr_address,
            fee: "500",
            recipient: address1,
            amountIn: value,
            amountOutMinimum: "100000",
            sqrtPriceLimitX96: "0",
          },
        ]
      );

      const timestamp = Math.floor(Date.now() / 1000) + 60 * 20;
      const bytes = [exactInputSingleData];
      const data = contract.methods.multicall(timestamp, bytes).encodeABI();

      const gasPriceSupply = await web3.eth.getGasPrice();

      const gasEstimate = await web3.eth.estimateGas({
        from: address1,
        to: SWAP_CONTRACT,
        data,
        value,
      });

      const payload = {
        from: address1,
        to: SWAP_CONTRACT,
        data,
        value,
        gasLimit: gasEstimate * 2n,
        gasPrice: gasPriceSupply * 2n,
        nonce: await web3.eth.getTransactionCount(address1),
      };
      console.log(`Đang tiến hành swap ${_value} ${tokenName}...`);
      const supplyTx = await web3.eth.accounts.signTransaction(
        payload,
        private1
      );
      const supplyHash = await web3.eth.sendSignedTransaction(
        supplyTx.rawTransaction
      );
      console.log(
        `Swap thành công tx: 0x...${supplyHash.transactionHash.slice(-8)}`
      );
      console.log("DONE! LÀM VÍ TIẾP THEO\n\n");
      await sleep(Math.floor(Math.random() * (10000 - 5000) + 5000));
    } catch (error) {
      console.log(error);
    }
  }
  console.log("HOÀN THÀNH SWAP TOKEN, CHẠY LẠI NẾU MUỐN\n\n");
}
claim();
