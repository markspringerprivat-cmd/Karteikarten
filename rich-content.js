'use strict';

(function exposeRichContent(global) {
  const MAX_TEXT_LENGTH = 12000;
  const MAX_ITEM_LENGTH = 4000;
  const MAX_CELL_LENGTH = 3000;

  function decodeLineBreaks(value) {
    return String(value ?? '')
      .replace(/\r\n?/g, '\n')
      .replace(/(?:\\)+r(?:\\)+n/gi, '\n')
      .replace(/(?:\\)+(?:n|r)/gi, '\n')
      .replace(/[\u2028\u2029]/g, '\n');
  }

  function normalize(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.blocks)
      ? value.blocks
      : value;

    if (Array.isArray(source)) {
      const blocks = source.map(normalizeBlock).filter(Boolean);
      if (blocks.length) return blocks;
    }

    if (source && typeof source === 'object' && source.type) {
      const block = normalizeBlock(source);
      return block ? [block] : [];
    }

    return parseLegacyText(source);
  }

  function normalizeBlock(block) {
    if (typeof block === 'string') {
      const text = cleanText(block, MAX_TEXT_LENGTH);
      return text ? { type: 'paragraph', text } : null;
    }
    if (!block || typeof block !== 'object') return null;

    const rawType = String(block.type || '').toLowerCase().trim();
    const type = rawType === 'bullets' || rawType === 'unordered-list' ? 'list'
      : rawType === 'numbered' || rawType === 'ordered-list' ? 'list'
        : rawType;

    if (type === 'paragraph' || type === 'text' || type === 'heading') {
      const text = cleanText(block.text ?? block.content ?? block.value, MAX_TEXT_LENGTH);
      return text ? { type: type === 'heading' ? 'heading' : 'paragraph', text } : null;
    }

    if (type === 'list') {
      const items = (Array.isArray(block.items) ? block.items : [])
        .map((item) => cleanText(typeof item === 'object' ? item?.text : item, MAX_ITEM_LENGTH))
        .filter(Boolean);
      if (!items.length) return null;
      const style = block.style === 'ordered' || rawType === 'numbered' || rawType === 'ordered-list'
        ? 'ordered'
        : 'unordered';
      return { type: 'list', style, items };
    }

    if (type === 'table') {
      const headers = Array.isArray(block.headers) ? block.headers.map(cleanCell) : [];
      const rows = (Array.isArray(block.rows) ? block.rows : [])
        .filter(Array.isArray)
        .map((row) => row.map(cleanCell));
      const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 0);
      if (!columnCount || (!headers.some(Boolean) && !rows.some((row) => row.some(Boolean)))) return null;
      return {
        type: 'table',
        headers: headers.length ? padRow(headers, columnCount) : [],
        rows: rows.map((row) => padRow(row, columnCount))
      };
    }

    const fallbackText = cleanText(block.text ?? block.content ?? block.value, MAX_TEXT_LENGTH);
    return fallbackText ? { type: 'paragraph', text: fallbackText } : null;
  }

  function parseLegacyText(value) {
    const text = decodeLineBreaks(value).trim();
    if (!text) return [];

    const lines = [];
    let pendingMarker = '';

    text.split('\n').forEach((rawLine) => {
      const trimmed = rawLine.trim();
      if (/^[-•*–—▪▫‣◦▸▹▤]$/.test(trimmed) || /^\d+[.)]$/.test(trimmed)) {
        pendingMarker = trimmed;
        return;
      }
      if (pendingMarker && trimmed) {
        lines.push(`${pendingMarker} ${trimmed}`);
        pendingMarker = '';
        return;
      }
      if (!trimmed && pendingMarker) return;
      lines.push(rawLine);
    });

    const blocks = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line) {
        index += 1;
        continue;
      }

      if (looksLikeTableHeader(lines, index)) {
        const headers = splitTableRow(lines[index]);
        const rows = [];
        index += 2;
        while (index < lines.length) {
          const candidate = lines[index].trim();
          if (!candidate || !candidate.includes('|')) break;
          rows.push(splitTableRow(candidate));
          index += 1;
        }
        const table = normalizeBlock({ type: 'table', headers, rows });
        if (table) blocks.push(table);
        continue;
      }

      const bullet = matchBullet(line);
      if (bullet) {
        const items = [];
        while (index < lines.length) {
          const item = matchBullet(lines[index].trim());
          if (!item) break;
          items.push(item);
          index += 1;
        }
        blocks.push({ type: 'list', style: 'unordered', items });
        continue;
      }

      const numbered = matchNumbered(line);
      if (numbered) {
        const items = [];
        while (index < lines.length) {
          const item = matchNumbered(lines[index].trim());
          if (!item) break;
          items.push(item);
          index += 1;
        }
        blocks.push({ type: 'list', style: 'ordered', items });
        continue;
      }

      const paragraphLines = [line];
      index += 1;
      while (index < lines.length) {
        const candidate = lines[index].trim();
        if (!candidate || matchBullet(candidate) || matchNumbered(candidate) || looksLikeTableHeader(lines, index)) break;
        paragraphLines.push(candidate);
        index += 1;
      }
      const paragraph = cleanText(paragraphLines.join(' '), MAX_TEXT_LENGTH);
      if (paragraph) blocks.push({ type: 'paragraph', text: paragraph });
    }

    return blocks;
  }

  function render(value) {
    const blocks = normalize(value);
    if (!blocks.length) return '<p>Keine Erklärung vorhanden.</p>';
    return blocks.map(renderBlock).join('');
  }

  function renderBlock(block) {
    if (block.type === 'heading') return `<h3 class="rich-heading">${escapeHTML(block.text)}</h3>`;
    if (block.type === 'paragraph') return `<p>${escapeHTML(block.text).replace(/\n/g, '<br>')}</p>`;
    if (block.type === 'list') {
      const tag = block.style === 'ordered' ? 'ol' : 'ul';
      return `<${tag} class="rich-list">${block.items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</${tag}>`;
    }
    if (block.type === 'table') {
      const head = block.headers.length
        ? `<thead><tr>${block.headers.map((cell) => `<th scope="col">${escapeHTML(cell)}</th>`).join('')}</tr></thead>`
        : '';
      const body = `<tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return `<div class="rich-table-scroll" role="region" aria-label="Tabelle – horizontal wischbar"><table class="rich-table">${head}${body}</table></div>`;
    }
    return '';
  }

  function hasContent(value) {
    return normalize(value).length > 0;
  }

  function looksLikeTableHeader(lines, index) {
    const current = String(lines[index] || '').trim();
    const next = String(lines[index + 1] || '').trim();
    return current.includes('|') && isTableSeparator(next);
  }

  function isTableSeparator(line) {
    if (!line.includes('|')) return false;
    const cells = splitTableRow(line);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
  }

  function splitTableRow(line) {
    let value = String(line || '').trim();
    if (value.startsWith('|')) value = value.slice(1);
    if (value.endsWith('|')) value = value.slice(0, -1);
    return value.split('|').map(cleanCell);
  }

  function matchBullet(line) {
    const match = String(line || '').match(/^[-•*–—▪▫‣◦▸▹▤]\s+(.+)$/);
    return match ? cleanText(match[1], MAX_ITEM_LENGTH) : '';
  }

  function matchNumbered(line) {
    const match = String(line || '').match(/^\d+[.)]\s+(.+)$/);
    return match ? cleanText(match[1], MAX_ITEM_LENGTH) : '';
  }

  function cleanText(value, limit) {
    return decodeLineBreaks(value)
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, limit);
  }

  function cleanCell(value) {
    return cleanText(value, MAX_CELL_LENGTH).replace(/\n+/g, ' ');
  }

  function padRow(row, count) {
    return Array.from({ length: count }, (_, index) => row[index] ?? '');
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  global.KartenWerkRichText = Object.freeze({ decodeLineBreaks, normalize, render, hasContent });
}(window));
