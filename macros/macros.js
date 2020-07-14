// SERVER INFO
const IPADDRESS = '34.69.233.245';
const HTTPS = 'http';
const PORT = '9876';

// ORDER POSITIVE STATUS CODE
const BEFORE_PLACING_ORDER = 0;
const ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE = 1;
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 2;
const PLACE_THE_CUP = 3;
const DISPENSING = 4;
const ORDER_DISPENSED = 5;

// ORDER ERROR STATUS CODE
const SOMETHING_WENT_WRONG = 6;
const TIMEOUT_EXPIRED = 7;
const MACHINE_NOT_READY = 8;

const orderStatus = {
  0: 'Order your Beverage',
  1: 'Please wait !',
  2: 'Order received\n  Please wait !',
  3: '     Click dispense\nafter placing the cup',
  4: 'Dispensing !',
  5: 'Beverage dispensed !',
  6: '     Something went wrong\nPlease check the connection',
  7: 'Timeout Expired',
  8: 'Machine not ready',
};

export {
  IPADDRESS,
  HTTPS,
  PORT,
  BEFORE_PLACING_ORDER,
  ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE,
  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
  DISPENSING,
  PLACE_THE_CUP,
  ORDER_DISPENSED,
  SOMETHING_WENT_WRONG,
  TIMEOUT_EXPIRED,
  MACHINE_NOT_READY,
  orderStatus,
};