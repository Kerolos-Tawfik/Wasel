export const arabCountries = [
  {
    code: "SA",
    name: "Saudi Arabia",
    dial_code: "+966",
    flag: "🇸🇦",
    regex: /^(05)(?:\d{8})$/,
    placeholder: "05xxxxxxxx",
  },
  {
    code: "EG",
    name: "Egypt",
    dial_code: "+20",
    flag: "🇪🇬",
    regex: /^(01)(0|1|2|5)(?:\d{8})$/,
    placeholder: "01xxxxxxxxx",
  },
  {
    code: "AE",
    name: "UAE",
    dial_code: "+971",
    flag: "🇦🇪",
    regex: /^(05)(?:\d{8})$/,
    placeholder: "05xxxxxxxx",
  },
  {
    code: "KW",
    name: "Kuwait",
    dial_code: "+965",
    flag: "🇰🇼",
    regex: /^(5|6|9)(?:\d{7})$/,
    placeholder: "5xxxxxxx",
  },
  {
    code: "BH",
    name: "Bahrain",
    dial_code: "+973",
    flag: "🇧🇭",
    regex: /^(3|6)(?:\d{7})$/,
    placeholder: "3xxxxxxx",
  },
  {
    code: "QA",
    name: "Qatar",
    dial_code: "+974",
    flag: "🇶🇦",
    regex: /^(3|5|6|7)(?:\d{7})$/,
    placeholder: "3xxxxxxx",
  },
  {
    code: "OM",
    name: "Oman",
    dial_code: "+968",
    flag: "🇴🇲",
    regex: /^(7|9)(?:\d{7})$/,
    placeholder: "7xxxxxxx",
  },
  {
    code: "JO",
    name: "Jordan",
    dial_code: "+962",
    flag: "🇯🇴",
    regex: /^(07)(7|8|9)(?:\d{7})$/,
    placeholder: "077xxxxxxx",
  },
  {
    code: "LB",
    name: "Lebanon",
    dial_code: "+961",
    flag: "🇱🇧",
    regex: /^(03|70|71|76|78|79|81)(?:\d{6})$/,
    placeholder: "03xxxxxx",
  },
  {
    code: "IQ",
    name: "Iraq",
    dial_code: "+964",
    flag: "🇮🇶",
    regex: /^(07)(?:\d{9})$/,
    placeholder: "07xxxxxxxxx",
  },
];

export const validatePhone = (phone, countryCode) => {
  const country = arabCountries.find((c) => c.code === countryCode);
  if (!country) return false;
  return country.regex.test(phone);
};

export const getCountryByCode = (code) => {
  return arabCountries.find((c) => c.code === code) || arabCountries[0];
};
