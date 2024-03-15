import BUY_TYPE_PUBLIC from '../assets/img/BUY_TYPE_PUBLIC.png';
import BUY_TYPE_FRIENDS from '../assets/img/BUY_TYPE_FRIENDS.png';
import BUY_TYPE_INVITE from '../assets/img/BUY_TYPE_INVITE.png';
import BUY_TYPE_NEGOTIATION from '../assets/img/BUY_TYPE_NEGOTIATION.png';
import pharmacy from '../assets/img/pharmacy.png';

import ENTER_NEED from '../assets/new_icon/enter_need.png';
import PREPARE_ORDER from '../assets/new_icon/prepare_order.png';
import RECEIVE_MERCHANDISE from '../assets/new_icon/receive_merchandise.png';
import RECEIVE_MERCHANDISE_SENT_TO_FRIEND from '../assets/new_icon/receive_merchandise_send_to_friend.png';
import SEND_ORDER_TO_SALLER from '../assets/new_icon/send_order_to_saller.png';
import SUCCESSFULLY_RECEIVE_ORDER from '../assets/new_icon/successfully_receive.png';
import SOMETHING_WENT_WRONG from '../assets/new_icon/something_went_wrong.png';

// New Blue Icon
import B_NEEDS from '../assets/blue/1B.png';
import B_ORDERS from '../assets/blue/2B.png';
import B_SEND from '../assets/blue/3B.png';
import B_RECEIVE from '../assets/blue/4B.png';
import B_DISTRIBUT from '../assets/blue/5B.png';
import B_PH_RECEIVE from '../assets/blue/6B.png';
import OPEN from '../assets/blue/B_open.png';
import CLOSED from '../assets/blue/B_end.png';
import B_OK from '../assets/blue/BS_OK.png';
import B_WARNING from '../assets/blue/BS_warning.png';

// Red Icon
import R_NEEDS from '../assets/red/1R.png';
import R_ORDERS from '../assets/red/2R.png';
import R_SEND from '../assets/red/3R.png';
import R_RECEIVE from '../assets/red/4R.png';
import R_DISTRIBUT from '../assets/red/5R.png';
import R_PH_RECEIVE from '../assets/red/6R.png';


// Green Icon
import G_NEEDS from '../assets/green/1G.png';
import G_ORDERS from '../assets/green/2G.png';
import G_SEND from '../assets/green/3G.png';
import G_RECEIVE from '../assets/green/4G.png';
import G_DISTRIBUT from '../assets/green/5G.png';
import G_PH_RECEIVE from '../assets/green/6G.png';


// Orange Icon
import O_NEEDS from '../assets/orange/1O.png';
import O_ORDERS from '../assets/orange/2O.png';
import O_SEND from '../assets/orange/3O.png';
import O_RECEIVE from '../assets/orange/4O.png';
import O_DISTRIBUT from '../assets/orange/5O.png';
import O_PH_RECEIVE from '../assets/orange/6O.png';


import BLANK_CIRCLE from '../assets/blue/blank_circle.png';

export const OPENING_TIME_SLOT = [
  { value: 8, label: '8 Hours' },
  { value: 12, label: '12 Hours' },
  { value: 24, label: '24 Hours' },
];

export const SYSTEM_TYPES = [
  { value: 'FARMANAGER', label: 'Farmanager' },
  { value: 'FARMATIC', label: 'Farmatic' },
  { value: 'NIXFARMA', label: 'Nixfarma' },
  { value: 'UNICOP', label: 'Unicop' },
  { value: 'OTROS', label: 'Otros' },
  // { value: 'ERP', label: 'ERP' },
  // { value: 'OTHER', label: 'Other' },
];

export const IVA = {
  N: 0.21, // 21 / 100
  R: 0.1, // 10 / 100
  S: 0.04, // 4 / 100
};

export const RECARGO = {
  N: 0.052, // 5.2 / 100
  R: 0.014, // 1.4 / 100
  S: 0.005, // 0.5 / 100
};

// ----------------------------------------------------------------------
export const BLUE_BUY_STATUS = {
  B_NEEDS,
  B_ORDERS,
  B_SEND,
  B_RECEIVE,
  B_DISTRIBUT,
  B_PH_RECEIVE,
  BLANK_CIRCLE,
  OPEN,
  CLOSED,
  B_OK,
  B_WARNING
}

export const RED_BUY_STATUS = {
  R_NEEDS,
  R_ORDERS,
  R_SEND,
  R_RECEIVE,
  R_DISTRIBUT,
  R_PH_RECEIVE
}


export const GREEN_BUY_STATUS = {
  G_NEEDS,
  G_ORDERS,
  G_SEND,
  G_RECEIVE,
  G_DISTRIBUT,
  G_PH_RECEIVE
}


export const ORANGE_BUY_STATUS = {
  O_NEEDS,
  O_ORDERS,
  O_SEND,
  O_RECEIVE,
  O_DISTRIBUT,
  O_PH_RECEIVE
}

export const BUY_TYPE_IMAGES = {
  'no pharmacy': pharmacy,
  'FARMACIAS AMIGAS': BUY_TYPE_FRIENDS,
  'OPEN': ENTER_NEED,
  'CLOSED': CLOSED,
  'PREPARING': PREPARE_ORDER,
  'SENT': RECEIVE_MERCHANDISE_SENT_TO_FRIEND,
  'RECEIVED': RECEIVE_MERCHANDISE,
  'DISTRIBUTING': SEND_ORDER_TO_SALLER,
  'FINISHED': SUCCESSFULLY_RECEIVE_ORDER,
  'CANCELLED': SOMETHING_WENT_WRONG,
  PUBLICA: BUY_TYPE_PUBLIC,
  INVITATION: BUY_TYPE_INVITE,
  NEGOCIADA: BUY_TYPE_NEGOTIATION,
};


export const BUY_STATUS = {
  ENTER_NEEDS: "ENTER NEEDS",
  CREATE_ORDER: "CREATE ORDER",
  SENT: "SENT",
  RECEIVE: "RECEIVE",
  DISTRIBUTE: "DISTRIBUTE",
  PHARMACY_RECEIVE: "PHARMACY RECEIVE"
}

export const BUY_STATE = {
  NONE: "0",
  RED: "1",
  GREEN: "2",
  BLUE: "3",
  DONE: "4",
  INCIDENCE: "5",
  ORANGE: "6"
}

export const BUY_STATUS_TO_INDEX_MAP = {
  [BUY_STATUS.ENTER_NEEDS]: 0,
  [BUY_STATUS.CREATE_ORDER]: 1,
  [BUY_STATUS.SENT]: 2,
  [BUY_STATUS.RECEIVE]: 3,
  [BUY_STATUS.DISTRIBUTE]: 4,
  [BUY_STATUS.PHARMACY_RECEIVE]: 5,
}

export const CURRENT_BUY_STATUS_IMAGES = {
  [BUY_STATUS.ENTER_NEEDS]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_NEEDS,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_NEEDS,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_NEEDS,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_NEEDS,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
  [BUY_STATUS.CREATE_ORDER]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_ORDERS,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_ORDERS,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_ORDERS,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_ORDERS,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
  [BUY_STATUS.SENT]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_SEND,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_SEND,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_SEND,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_SEND,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
  [BUY_STATUS.RECEIVE]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_RECEIVE,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_RECEIVE,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_RECEIVE,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_RECEIVE,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
  [BUY_STATUS.DISTRIBUTE]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_DISTRIBUT,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_DISTRIBUT,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_DISTRIBUT,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_DISTRIBUT,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
  [BUY_STATUS.PHARMACY_RECEIVE]: {
    [BUY_STATE.NONE]: BLUE_BUY_STATUS.BLANK_CIRCLE,
    [BUY_STATE.RED]: RED_BUY_STATUS.R_PH_RECEIVE,
    [BUY_STATE.GREEN]: GREEN_BUY_STATUS.G_PH_RECEIVE,
    [BUY_STATE.BLUE]: BLUE_BUY_STATUS.B_PH_RECEIVE,
    [BUY_STATE.ORANGE]: ORANGE_BUY_STATUS.O_PH_RECEIVE,
    [BUY_STATE.DONE]: BLUE_BUY_STATUS.B_OK,
    [BUY_STATE.INCIDENCE]: BLUE_BUY_STATUS.B_WARNING,
  },
}


export const BUY_STATUS_ORDER = [
  BUY_STATUS.ENTER_NEEDS,
  BUY_STATUS.CREATE_ORDER,
  BUY_STATUS.SENT,
  BUY_STATUS.RECEIVE,
  BUY_STATUS.DISTRIBUTE,
  BUY_STATUS.PHARMACY_RECEIVE
];
