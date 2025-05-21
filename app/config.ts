export const sleep = (millis: number) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

export const wallets = [
  {
    address1: "0x2E44f42a1EfA47d332D2bF3be6d9c1F266133333",
    private1:
      "cc62d4d55c1218e8385b9737cea68bc1160a76eb6fe36b3309bf162ee2da7810",
    proxy: "", // bỏ trống nếu không có proxy
  },
  {
    address1: "0xA3E9fbfF456273A760976f369E7e31D3BA533333",
    private1:
      "e7be2bf487fc2c1c49fda12de803d222861a01abd9e8305b156713d53adb6713",
    proxy: "http://username:passs@host:port", // thêm proxy nếu có
  },
];
