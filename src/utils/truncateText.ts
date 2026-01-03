/**
 * Truncates text to a specified maximum length and appends ellipsis if truncated
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters (default: 50)
 * @param ellipsis - The ellipsis string to append (default: '...')
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * truncateText('This is a very long text', 10) // Returns: 'This is a ...'
 * truncateText('Short', 10) // Returns: 'Short'
 * truncateText(null, 10) // Returns: ''
 * truncateText(undefined, 10) // Returns: ''
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50,
  ellipsis: string = '...'
): string {
  if (!text) return '';
  
  const textString = String(text);
  
  if (textString.length <= maxLength) {
    return textString;
  }
  
  return textString.substring(0, maxLength) + ellipsis;
}

