import { db } from '../../db';
import { getEntries } from './get-entries.util';

export const createMail = async () => {
  const minLastTimestamp = await db.SubscriptionModel.min('last_date');
  const minLastDate = new Date(minLastTimestamp * 1000);
  const maxLastTimestamp = minLastDate.setMonth(minLastDate.getMonth() + 1);

  const entries = await getEntries(minLastTimestamp, maxLastTimestamp);

  const distinctSubscriptions = await db.SubscriptionModel.findAll({
    Attributes: ['email'],
    group: ['email'],
    raw: 'plain'
  });
  const emails = distinctSubscriptions.map(x => x.email);

  console.log(entries, emails);
};
