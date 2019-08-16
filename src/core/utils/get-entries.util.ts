import axios from 'axios';

export const getEntries = async (minDate: number, maxDate: number) => {
  let entries = [];
  let offset = 0;

  for (let i = 0; ; i++) {
    const { data } = await axios.get(
      `http://dev.ofdb.io/v0/entries/recently-changed?since=${minDate}&until=${maxDate}&offset=${offset}&limit=100`
    );

    if (!data.length) {
      break;
    }

    offset += 100;

    entries = [...entries, ...data];
  }

  return entries;
};
