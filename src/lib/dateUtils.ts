import { format, formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';

const TIMEZONE = 'America/Sao_Paulo';

export const formatDateToBR = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { timeZone: TIMEZONE });
};

export const formatDateTimeToBR = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { timeZone: TIMEZONE });
};

export const getCurrentDateTime = (): string => {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
};