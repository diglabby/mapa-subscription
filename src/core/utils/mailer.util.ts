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
  todayDate.setMonth(todayDate.getMonth() - 1);
  const maxLastTimestamp = new Date().getTime() / 1000;
  const minLastTimestamp = todayDate.getTime() / 1000;

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

            if (entry){
              arrayListByEntries = [...arrayListByEntries, entry];
            }
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

        //This function wraps entries in array into html code, and then ads new entry "title" to the beginning of array, and returns a chunk of html code instead of array
        function wrapArrayList (arrayList, title) {

          //checking if the array is not empty
          if (arrayList.length !== 0) {

            //wrapping entries in the array
            const wrappedArrayList =  arrayList.map(
              entry =>
                `
                  <tr class="organization-block" bgcolor="#214478">
                      <td style="padding:16px 20px">
                          <table class="organization-block__name" cellpadding="0" cellspacing="0" width="100%" style="padding-bottom: 10px;">
                              <tr>
                                  <td align="left" valign="top" width="230px" style="font: bold 18px/30px PT Sans, Roboto, Arial, sans-serif;">
                                      ${entry.title}
                                  </td>
                                  <td style="font-size: 0; line-height: 0;" width="232px">
                                      &nbsp;
                                  </td>
                                  <td valign="top" width="134px">
                                      <table class="organization-block__button">
                                          <tr>
                                              <td align="center" width="134px" height="18px" bgcolor="#00D400" style="border-radius: 20px; font: bold 14px/20px PT Sans, Roboto, Arial, sans-serif;">
                                                  <a style="color: #ffffff;" href="https://mapa.falanster.by/#/?entry=${entry.id}">
                                                      Перайсці
                                                  </a>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="organization-block__info" cellpadding="0" cellspacing="0" style="padding-bottom: 10px;">
                              <tr>
                                  <td width="364px" style="font: 16px PT Sans, Roboto, Arial, sans-serif;">
                                      ${entry.description}
                                  </td>
                                  <td style="font-size: 0; line-height: 0;" width="97px">
                                      &nbsp;
                                  </td>
                                  <td valign="top" width="134px">
                                      <table class="organization-block__button">
                                          <tr>
                                              <td align="center" width="134px" height="18px" bgcolor="#FF7F2A" style="color: #ffffff; border-radius: 20px; font: bold 14px/20px PT Sans, Roboto, Arial, sans-serif;">
                                                  <a style="color: #ffffff;" href="">
                                                      Адпісацца
                                                  </a>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="organization-block__tags" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td align="center" bgcolor="#00D400" style="padding: 0 20px 0 20px; border-radius: 20px; font-family: PT Sans, Roboto, Arial, sans-serif;">
                                      #${entry.tags.join(' #')}
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
  
                  <tr>
                      <td height="20px"></td>
                  </tr>
              `
            );

            //adding title to the beginning of the array
            wrappedArrayList.unshift(
              `
                <tr>
                    <td bgcolor="#FF7F2A" style="padding-left: 20px; font: bold 18px/30px PT Sans, Roboto, Arial, sans-serif;" align="center">
                            ${title}
                    </td>
                </tr>
           `
            );

            //returning the result as a chunk of html code
            return wrappedArrayList.join('');

            //if array is empty returning empty array
          } else return []
        }

        //using function wrapArrayList to convert the following arrays into html code:
        const initiativesBlock = wrapArrayList(arrayListByEntries, "Абнаўленні вашых iнiцыятыў:");

        const tagsBlock = wrapArrayList(arrayListByTag, "Падыходзяць пад вашы тэгi:");

        const geoTagsBlock = wrapArrayList(arrayListByCoordinates, "Блiзка да вас:");

        //TODO: change adress of images from my repository (https://artyomkr.github.io/mail-template/images/) to https://mapa.falanster.by/mapa/src/img/template
        //TODO: change adress of fonts from my repository (https://artyomkr.github.io/mail-template/fonts/) to https://mapa.falanster.by/mapa/src/img/template/fonts
        if (initiativesBlock.length !== 0 || tagsBlock.length !== 0 || geoTagsBlock.length !== 0 ){
          emailer.sendMail({
            from: 'tyomik.krasnitsky@gmail.com',
            to: email,
            html:  `
              <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml">
                  <head>
                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                      <title>Mapa mail</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                      <style type="text/css">
                          @font-face {
                              font-family: 'PT Sans';
                              font-style: normal;
                              font-weight: 400;
                              src: url('https://fonts.googleapis.com/css2?family=PT+Sans&display=swap');
                              src: local('PT Sans'), local('PTSans-Regular'),
                              url('https://artyomkr.github.io/mail-template/fonts/PT Sans/pt-sans-v11-latin-ext_latin_cyrillic-ext_cyrillic-regular.eot?#iefix') format('embedded-opentype'),
                              url('https://artyomkr.github.io/mail-template/fonts/PT Sans/pt-sans-v11-latin-ext_latin_cyrillic-ext_cyrillic-regular.woff2') format('woff2'),
                              url('https://artyomkr.github.io/mail-template/fonts/PT Sans/pt-sans-v11-latin-ext_latin_cyrillic-ext_cyrillic-regular.woff') format('woff'),
                              url('https://artyomkr.github.io/mail-template/fonts/PT Sans/pt-sans-v11-latin-ext_latin_cyrillic-ext_cyrillic-regular.ttf') format('truetype'),
                              url('https://artyomkr.github.io/mail-template/fonts/PT Sans/pt-sans-v11-latin-ext_latin_cyrillic-ext_cyrillic-regular.svg#PTSans') format('svg');
                          }
                          @font-face {
                              font-family: 'Hangyaboly';
                              font-weight: 400;
                              font-style: normal;
                              src: url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.eot');
                              src: url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.eot?#iefix') format('embedded-opentype'),
                              url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.woff2') format('woff2'),
                              url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.woff') format('woff'),
                              url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.ttf') format('truetype'),
                              url('https://artyomkr.github.io/mail-template/fonts/Hangyaboly/hangyaboly.svg#hangyaboly') format('svg');
                          }
                          @font-face {
                              font-family: 'Roboto';
                              font-style: normal;
                              font-weight: 400;
                              src: url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.eot');
                              src: local('Roboto'), local('Roboto-Regular'),
                              url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.eot?#iefix') format('embedded-opentype'),
                              url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.woff2') format('woff2'),
                              url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.woff') format('woff'),
                              url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.ttf') format('truetype'),
                              url('https://artyomkr.github.io/mail-template/fonts/Roboto/roboto-v20-latin-ext_latin_cyrillic-ext_cyrillic-regular.svg#Roboto') format('svg');
                          }
                          td {
                              font-family: PT Sans, Roboto, Arial, sans-serif;
                              color: #FBFCFF;
                          }
                          a{
                              text-decoration: none;
                              color: #FBFCFF;
                          }
                      </style>
                  </head>
                  <body style="margin: 0; padding: 0;">
                      <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#162D50">
                          <tr>
                              <td>
                                  <table class="mail-content" align="center" cellpadding="0" cellspacing="0" width="636" style="border-collapse: collapse;">
                                      <tr class="mail-header">
                                          <td style="padding-top: 33px;">
                                              <table cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td align="right" style="color: #FF7F2A; font: 12px/14px PT Sans, Arial, sans-serif;">
                                                          <a href="" style="color: #FF7F2A;">
                                                              Дасляць сябру
                                                          </a>
                                                          |
                                                          <a href="" style="color: #FF7F2A;">
                                                              Чытаць онлайн
                                                          </a>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td style="background-image:url(https://artyomkr.github.io/mail-template/images/cover.png)">
                                                          <a href="https://mapa.falanster.by/" style="display: block; margin: 29px 461px 30px 21px;">
                                                              <img src="https://artyomkr.github.io/mail-template/images/mapa_logo.png" alt="Mapa logo" style="display:block;"/>
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                  
                                      <tr class="mail-body">
                                          <td bgcolor="#1A1A1A">
                                              <table cellpadding="0" cellspacing="0" width="100%">
                                                  <tr >
                                                      <td style="padding:23px 152px 21px 152px; color: #FBFCFF; font: 24px/40px Hangyaboly, PT Sans, Roboto, Arial, sans-serif;" align="center">
                                                          Абнаўленні Мапа заўтрашняга дня 01.10.2019
                                                      </td>
                                                  </tr>
                                                  
                                                  ${initiativesBlock}
                                                  
                                                  ${tagsBlock}
                                                  
                                                  ${geoTagsBlock}
                  
                                              </table>
                                          </td>
                                      </tr>
                                      <tr class="mail-footer">
                                          <td style="padding:31px 21px 10px 21px;">
                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                  <tr>
                                                      <td>
                                                          <a href="https://falanster.by/" style="display: block;">
                                                              <img src="https://artyomkr.github.io/mail-template/images/falanster.png" alt="Falanster logo" style="display:block;"/>
                                                          </a>
                                                      </td>
                                                      <td align="right" style="padding-left:100px; font-family: PT Sans, Roboto, Arial, sans-serif;">
                                                          Далучайцеся да нас
                                                      </td>
                                                      <td align="right">
                                                          <a href="https://vk.com/falanster_by">
                                                              <img src="https://artyomkr.github.io/mail-template/images/Vk_logo.png" alt="Vk logo"/>
                                                          </a>
                                                          <a href="https://www.facebook.com/falanster.by/">
                                                              <img src="https://artyomkr.github.io/mail-template/images/Fb_logo.png" alt="Fb logo"/>
                                                          </a>
                                                          <a href="https://www.instagram.com/falanster.by/">
                                                              <img src="https://artyomkr.github.io/mail-template/images/Inst_logo.png" alt="Inst logo"/>
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                      <tr class="unsubscribe-button">
                                          <td align="center" style="padding-bottom: 36px; font-size: 11px; line-height: 13px; font-family: PT Sans, Roboto Arial, sans-serif;">
                                              <a href="" style="text-decoration: underline;">Unsubscribe</a> from our email notifications
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </body>
              </html>
          `
          });
        }
      }
    });
};

