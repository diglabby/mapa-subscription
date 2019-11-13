import * as Bluebird from 'bluebird';

import { db } from '../../db';
import { emailer } from '../utils/email.util';
import { getEntries } from './get-entries.util';
import { now } from 'sequelize/types/lib/utils';

export const determineCoordinatesInRectange = (
  lat,
  lng,
  latNE,
  lngNE,
  latSW,
  lngSW
) => {
  if (latSW < lat < latNE && lngNE < lng < lngSW) {
    return true;
  }

  return;
};

export const createMail = async () => {
  const todayDate = new Date();
  todayDate.setMonth(todayDate.getMonth() - 1)
  const maxLastTimestamp = new Date().getTime()/1000;
  const minLastTimestamp = todayDate.getTime()/1000;

  const entries = await getEntries(minLastTimestamp, maxLastTimestamp);

  const subscriptions = db.SubscriptionModel.findAll({
    Attributes: ['email'],
    group: ['email'],
    raw: 'plain'
  });

  Bluebird.map(subscriptions, x => Promise.resolve(x))
    .then(subscriptions => subscriptions.map((x: any) => x.email))
    .then(async emails => {
      for (const email of emails) {
        let subscriptionByTag = [];
        let subscriptionByEntries = [];
        let subscriptionByLocation = [];

        const subscription = await db.SubscriptionModel.findAll({
          where: {
            email
          },
          raw: 'plain'
        });

        subscription.map(x => {
          switch (x.type_id) {
            case 1:
              subscriptionByEntries = [...subscriptionByEntries, x];
              break;
            case 2:
              subscriptionByLocation = [...subscriptionByLocation, x];
              break;
            case 3:
              subscriptionByTag = [...subscriptionByTag, x];
              break;
          }

          return x;
        });

        let arrayListByEntries = [];
        let arrayListByCoordinates = [];
        let arrayListByTag = [];

        if (subscriptionByEntries.length) {
          subscriptionByEntries.forEach(x => {
            const { id } = JSON.parse(x.subs_params);
            const entry = entries.find(x => x.id === id);

            arrayListByEntries = [...arrayListByEntries, entry];
          });
        }

        if (subscriptionByLocation.length) {
          subscriptionByLocation.forEach(x => {
            const { latNE, lngNE, latSW, lngSW } = JSON.parse(x.subs_params);

            const entry = entries.find(x => {
              return determineCoordinatesInRectange(
                x.lat,
                x.lng,
                latNE,
                lngNE,
                latSW,
                lngSW
              );
            });

            arrayListByCoordinates = [...arrayListByCoordinates, entry];
          });
        }

        if (subscriptionByTag.length) {
          subscriptionByTag.forEach(x => {
            const { latNE, lngNE, latSW, lngSW, tag } = JSON.parse(
              x.subs_params
            );

            const entry = entries.find(x => {
              return (
                determineCoordinatesInRectange(
                  x.lat,
                  x.lng,
                  latNE,
                  lngNE,
                  latSW,
                  lngSW
                ) && x.tags.includes(tag)
              );
            });

            arrayListByTag = [...arrayListByTag, entry];
          });
        }

        emailer.sendMail({
          to: email,
          html: `
            <h1>
              Hello ${email}!
            </h1>

            <h2>
              Initiatives:
            </h2>
            ${JSON.stringify(arrayListByEntries, null, 2)}
            ${JSON.stringify(subscriptionByEntries, null, 2)}

            <h2>
              Geo:
            </h2>
            ${JSON.stringify(arrayListByCoordinates, null, 2)}
            ${JSON.stringify(subscriptionByLocation, null, 2)}

            <h2>
              Tag:
            </h2>
            ${JSON.stringify(arrayListByTag, null, 2)}
            ${JSON.stringify(subscriptionByTag, null, 2)}
          `
        });
      }
    });
};
