import _ from 'lodash';
import { IVA, RECARGO } from '../constants/AppEnums';

export const calculateTax = (amount, taxType, ownerPharmacy, receiverPharmacy) => {
  /*
   * amount: int
   * taxType: str/int : (N, R, S) or it's value
   * ownerPharmacy: boolean : (0: pharmacy, 1: para_pharmacy)
   * receiverPharmacy: boolean : (0: pharmacy, 1: para_pharmacy)
   */
  const result = {
    tax_amount: 0,
    amount_with_tax: 0,
    iva: {
      tax_amount: 0,
      tax_per: 0,
    },
    recargo: {
      tax_amount: 0,
      tax_per: 0,
    },
  };

  if (!Number.isNaN(parseFloat(taxType))) taxType = getTaxType(taxType);

  if (!taxType || !amount) {
    result.amount_with_tax = amount || 0;
    return result;
  }
  amount = parseFloat(amount);

  if (
    (ownerPharmacy === 0 && receiverPharmacy === 0) ||
    (ownerPharmacy === 0 && receiverPharmacy === 1) ||
    (ownerPharmacy === 1 && receiverPharmacy === 0)
  ) {
    result.tax_amount = amount * ((IVA[taxType] || 0) + (RECARGO[taxType] || 0));
    result.recargo.tax_amount = amount * (RECARGO[taxType] || 0);
    result.recargo.amount_with_tax = amount + result.recargo.tax_amount;
    result.recargo.tax_per = (RECARGO[taxType] || 0) * 100;
  } else {
    result.tax_amount = amount * (IVA[taxType] || 0);
  }
  result.amount_with_tax = amount + result.tax_amount;
  result.iva.tax_amount = amount * (IVA[taxType] || 0);
  result.iva.amount_with_tax = amount + result.iva.tax_amount;
  result.iva.tax_per = (IVA[taxType] || 0) * 100;

  return result;
};

export const calculateRecargoTax = (amount, taxType) => {
  /*
   * amount: int
   * taxType: str/int : (N, R, S) or it's value
   */
  if (!Number.isNaN(parseFloat(taxType))) taxType = getTaxType(taxType);
  if (!taxType || !amount) return amount || 0;

  return (amount * (RECARGO[taxType] || 0)).toFixed(2);
};

export const getTaxType = (tax) => {
  if (parseFloat(tax) === parseFloat(IVA.N)) return 'N';
  if (parseFloat(tax) === parseFloat(IVA.R)) return 'R';
  if (parseFloat(tax) === parseFloat(IVA.S)) return 'S';
  if (parseFloat(tax) === parseFloat(RECARGO.N)) return 'N';
  if (parseFloat(tax) === parseFloat(RECARGO.R)) return 'R';
  if (parseFloat(tax) === parseFloat(RECARGO.S)) return 'S';
  return false;
};

export const calculateDiscount = (catalogCondition, netAmount, units, familyTotalUnits) => {
  if (!catalogCondition || !catalogCondition.id || (!units && !familyTotalUnits)) return;

  netAmount = parseFloat(netAmount);
  const discounts = [];

  // family condition
  if (catalogCondition.condition_1) {
    const matchedCondition = _.maxBy(
      catalogCondition.condition_1.split(' ').map((condition) => {
        const x = condition.split('-').map((x) => +x);
        if (x[0] <= (+familyTotalUnits || +units)) {
          return x;
        }
        return null;
      }),
      (o) => o && o[0]
    );
    if (matchedCondition)
      discounts.push({
        condition_str: catalogCondition.condition_1,
        discount: matchedCondition[1],
        amount_after_discount: netAmount - (netAmount * matchedCondition[1]) / 100,
        is_family_condition: true,
      });
  }

  if (catalogCondition.anual)
    discounts.push({
      condition_str: catalogCondition.anual,
      discount: catalogCondition.anual,
      amount_after_discount: netAmount - (netAmount * catalogCondition.anual) / 100,
    });

  // individual condition
  if (catalogCondition.condition_2) {
    const matchedCondition = _.maxBy(
      catalogCondition.condition_2.split(' ').map((i) => {
        const x = i.split('-').map((x) => +x);
        if (x[0] <= +units) return x;
        return null;
      }),
      (o) => o && o[0]
    );
    if (matchedCondition)
      discounts.push({
        condition_str: catalogCondition.condition_2,
        discount: matchedCondition[1],
        amount_after_discount: netAmount - (netAmount * matchedCondition[1]) / 100,
      });
  }

  const now = new Date();
  if (
    catalogCondition.campaign_start_date &&
    catalogCondition.campaign_end_date &&
    catalogCondition.campaign_condition &&
    now >= new Date(catalogCondition.campaign_start_date) &&
    now <= new Date(catalogCondition.campaign_end_date)
  ) {
    const matchedCondition = _.maxBy(
      catalogCondition.condition_2.split(' ').map((i) => {
        const x = i.split('-').map((x) => +x);
        if (x[0] <= +units) return x;
        return null;
      }),
      (o) => o && o[0]
    );
    if (matchedCondition)
      discounts.push({
        condition_str: catalogCondition.campain_condition,
        discount: matchedCondition[1],
        amount_after_discount: netAmount - (netAmount * matchedCondition[1]) / 100,
      });
  }

  return _.minBy(discounts, 'amount_after_discount');
};

export const getMaximumDiscount = (catalogCondition) => {
  if (!catalogCondition) return;

  const discounts = [];
  if (catalogCondition.annual){ 
    discounts.push(...catalogCondition.annual.split(' ').map((i) => i.split('-')[1]));
  };

  if (catalogCondition.condition_1) {
    discounts.push(...catalogCondition.condition_1.split(' ').map((i) => i.split('-')[1]));
  }

  if (catalogCondition.condition_2) {
    discounts.push(...catalogCondition.condition_2.split(' ').map((i) => i.split('-')[1]));
  }

  const campaignStart = catalogCondition.campaign_start_date;
  const campaignEnds = catalogCondition.campaign_end_date;
  const now = new Date();
  if (
    campaignStart &&
    campaignEnds &&
    catalogCondition.campaign_condition &&
    now >= new Date(campaignStart) &&
    now <= new Date(campaignEnds)
  ) {
    discounts.push(...catalogCondition.campaign_condition.split(' ').map((i) => i.split('-')[1]));
  }

  const intDiscount = discounts.map((item) => (item && parseInt(item, 10) !== 'NaN' ? parseInt(item, 10) : 0));
  return Math.max(...intDiscount);
};
