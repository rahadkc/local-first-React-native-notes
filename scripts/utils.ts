export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  };

  // Format the date and time using 'en-GB' locale
  const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

  // Split the formatted date into day, month, and year
  const [day, month, year] = formattedDate.split(' ');

  // Convert month to uppercase
  return `${day}-${month.toUpperCase()}-${year} ${formattedTime}`;
}
