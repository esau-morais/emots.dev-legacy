import { differenceInYears } from "date-fns";

const birthdayDate = new Date("2005-03-03T00:00:00-03:00");
export const currentAge = differenceInYears(new Date(), birthdayDate);
