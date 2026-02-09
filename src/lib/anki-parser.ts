export interface ParsedCard {
  front: string;
  back: string;
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  cards: ParsedCard[];
  errors: ParseError[];
  skippedLines: number;
}

/**
 * Parses Anki TSV export format (tab-separated, with CSV-style quoting)
 * Properly handles multiline quoted fields and escaped quotes
 */
export function parseAnkiTSV(content: string): ParseResult {
  const cards: ParsedCard[] = [];
  const errors: ParseError[] = [];
  let skippedLines = 0;

  let pos = 0;
  let lineNumber = 1;
  const length = content.length;

  function parseField(): string {
    let field = '';

    // Check if field starts with a quote
    if (pos < length && content[pos] === '"') {
      pos++; // Skip opening quote

      // Read until closing quote (handling escaped quotes)
      while (pos < length) {
        if (content[pos] === '"') {
          // Check if it's an escaped quote (doubled)
          if (pos + 1 < length && content[pos + 1] === '"') {
            field += '"';
            pos += 2;
          } else {
            // End of quoted field
            pos++; // Skip closing quote
            break;
          }
        } else {
          field += content[pos];
          if (content[pos] === '\n') lineNumber++;
          pos++;
        }
      }
    } else {
      // Unquoted field - read until tab or newline
      while (pos < length && content[pos] !== '\t' && content[pos] !== '\n' && content[pos] !== '\r') {
        field += content[pos];
        pos++;
      }
    }

    return field.trim();
  }

  function skipWhitespace() {
    while (pos < length && (content[pos] === ' ' || content[pos] === '\r')) {
      pos++;
    }
  }

  while (pos < length) {
    const recordStartLine = lineNumber;
    skipWhitespace();

    // Skip empty lines
    if (pos < length && content[pos] === '\n') {
      pos++;
      lineNumber++;
      skippedLines++;
      continue;
    }

    if (pos >= length) break;

    // Check for header lines starting with #
    if (content[pos] === '#') {
      // Skip until end of line
      while (pos < length && content[pos] !== '\n') {
        pos++;
      }
      if (pos < length && content[pos] === '\n') {
        pos++;
        lineNumber++;
      }
      skippedLines++;
      continue;
    }

    // Parse front field
    const front = parseField();
    skipWhitespace();

    // Expect tab separator
    if (pos >= length || content[pos] !== '\t') {
      if (front.trim()) {
        errors.push({
          line: recordStartLine,
          message: 'Line must have at least 2 tab-separated values (front and back)',
        });
      } else {
        skippedLines++;
      }
      // Skip to next line
      while (pos < length && content[pos] !== '\n') {
        pos++;
      }
      if (pos < length) {
        pos++;
        lineNumber++;
      }
      continue;
    }

    pos++; // Skip tab
    skipWhitespace();

    // Parse back field
    const back = parseField();
    skipWhitespace();

    // Skip remaining columns if any (e.g., card number, tags)
    while (pos < length && content[pos] === '\t') {
      pos++; // Skip tab
      skipWhitespace();
      // Skip this field
      parseField();
      skipWhitespace();
    }

    // Skip to end of line
    while (pos < length && content[pos] !== '\n') {
      if (content[pos] === '\r') {
        pos++;
      } else {
        pos++;
      }
    }
    if (pos < length && content[pos] === '\n') {
      pos++;
      lineNumber++;
    }

    // Validate
    if (!front) {
      errors.push({
        line: recordStartLine,
        message: 'Card front cannot be empty',
      });
      continue;
    }

    if (!back) {
      errors.push({
        line: recordStartLine,
        message: 'Card back cannot be empty',
      });
      continue;
    }

    // Add valid card
    cards.push({ front, back });
  }

  return { cards, errors, skippedLines };
}
