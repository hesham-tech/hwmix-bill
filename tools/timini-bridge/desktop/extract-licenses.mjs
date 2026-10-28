import { inflateSync } from 'node:zlib';

// Read only the bundled license text from the pinned PyInstaller executable.
// This avoids the executable's Windows stdout encoding bug in --licenses.
export function extractTiMiniLicenses(binary) {
  const magic = Buffer.from([0x4d, 0x45, 0x49, 0x0c, 0x0b, 0x0a, 0x0b, 0x0e]);
  const cookie = binary.lastIndexOf(magic);
  if (cookie < 0 || cookie + 88 > binary.length) throw new Error('Missing PyInstaller archive cookie.');
  const archiveLength = binary.readUInt32BE(cookie + 8);
  const archiveStart = cookie + 88 - archiveLength;
  const tableStart = archiveStart + binary.readUInt32BE(cookie + 12);
  const tableEnd = tableStart + binary.readUInt32BE(cookie + 16);
  if (archiveStart < 0 || tableStart < archiveStart || tableEnd > cookie) throw new Error('Invalid PyInstaller archive bounds.');
  for (let offset = tableStart; offset < tableEnd;) {
    const recordLength = binary.readUInt32BE(offset);
    if (recordLength < 19 || offset + recordLength > tableEnd) throw new Error('Invalid PyInstaller table record.');
    const name = binary.subarray(offset + 18, offset + recordLength).toString('utf8').replace(/\0.*$/, '').replaceAll('\\', '/');
    if (name.endsWith('/THIRD_PARTY_LICENSES.txt')) {
      const start = archiveStart + binary.readUInt32BE(offset + 4);
      const end = start + binary.readUInt32BE(offset + 8);
      if (start < archiveStart || end > tableStart) throw new Error('Invalid license resource bounds.');
      const bytes = binary[offset + 16] ? inflateSync(binary.subarray(start, end)) : binary.subarray(start, end);
      if (bytes.length !== binary.readUInt32BE(offset + 12)) throw new Error('License resource length mismatch.');
      const text = bytes.toString('utf8');
      if (!text.includes('TiMini-Print license information') || !text.includes('Apache License')) throw new Error('Incomplete TiMini license resource.');
      return text;
    }
    offset += recordLength;
  }
  throw new Error('The pinned binary has no bundled THIRD_PARTY_LICENSES.txt.');
}
