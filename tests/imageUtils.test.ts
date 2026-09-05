import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ensureBase64Prefix } from '../src/utils/imageUtils.ts';

describe('imageUtils - ensureBase64Prefix', () => {
  describe('Physical paths (/images/...)', () => {
    it('preserves /images/products WebP paths without prefixing', () => {
      const path = '/images/products/c1d2e3f4a5b6.webp';
      assert.equal(ensureBase64Prefix(path), path);
    });

    it('preserves general /images/ paths', () => {
      const path = '/images/banners/hero.jpg';
      assert.equal(ensureBase64Prefix(path), path);
    });

    it('preserves nested /images paths', () => {
      const path = '/images/categories/electronics/phone.png';
      assert.equal(ensureBase64Prefix(path), path);
    });
  });

  describe('Relative root paths (/...)', () => {
    it('preserves root-relative paths like /uploads/', () => {
      const path = '/uploads/item-123.jpg';
      assert.equal(ensureBase64Prefix(path), path);
    });

    it('preserves static media paths', () => {
      const path = '/static/media/logo.svg';
      assert.equal(ensureBase64Prefix(path), path);
    });

    it('preserves single root slash /', () => {
      assert.equal(ensureBase64Prefix('/'), '/');
    });
  });

  describe('Data URIs (data:image/...)', () => {
    it('preserves data:image/jpeg;base64,... without double prefixing', () => {
      const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/';
      assert.equal(ensureBase64Prefix(dataUri), dataUri);
    });

    it('preserves data:image/png;base64,...', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      assert.equal(ensureBase64Prefix(dataUri), dataUri);
    });

    it('preserves data:image/webp;base64,...', () => {
      const dataUri = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAA/v6v9gAAAA==';
      assert.equal(ensureBase64Prefix(dataUri), dataUri);
    });

    it('preserves data:image/svg+xml;base64,...', () => {
      const dataUri = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
      assert.equal(ensureBase64Prefix(dataUri), dataUri);
    });
  });

  describe('HTTP / HTTPS URLs', () => {
    it('preserves http URLs', () => {
      const url = 'http://example.com/images/prod1.jpg';
      assert.equal(ensureBase64Prefix(url), url);
    });

    it('preserves https CDN URLs', () => {
      const url = 'https://cdn.altavix.com/products/item.webp';
      assert.equal(ensureBase64Prefix(url), url);
    });

    it('preserves https URLs with query parameters and fragments', () => {
      const url = 'https://s3.amazonaws.com/bucket/image.png?v=123#fragment';
      assert.equal(ensureBase64Prefix(url), url);
    });
  });

  describe('Blob URLs (blob:...)', () => {
    it('preserves local blob URLs', () => {
      const blobUrl = 'blob:http://localhost:5173/a1b2-c3d4-e5f6-7890';
      assert.equal(ensureBase64Prefix(blobUrl), blobUrl);
    });

    it('preserves secure blob URLs', () => {
      const blobUrl = 'blob:https://altavix.com/9876-5432-10fe-dcba';
      assert.equal(ensureBase64Prefix(blobUrl), blobUrl);
    });
  });

  describe('Raw Base64 strings', () => {
    it('prepends data:image/jpeg;base64, to raw PNG base64 string', () => {
      const rawBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const expected = `data:image/jpeg;base64,${rawBase64}`;
      assert.equal(ensureBase64Prefix(rawBase64), expected);
    });

    it('prepends data:image/jpeg;base64, to raw WebP base64 string', () => {
      const rawBase64 = 'UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAA/v6v9gAAAA==';
      const expected = `data:image/jpeg;base64,${rawBase64}`;
      assert.equal(ensureBase64Prefix(rawBase64), expected);
    });

    it('prepends data:image/jpeg;base64, to generic base64 string', () => {
      const rawBase64 = 'AQIDBAUGBwgJCgsMDQ4PEA==';
      const expected = `data:image/jpeg;base64,${rawBase64}`;
      assert.equal(ensureBase64Prefix(rawBase64), expected);
    });
    it('prepends data:image/jpeg;base64, to raw JPEG base64 string starting with /9j/', () => {
      const rawJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBAPEBQYHBwcHBwcHBwcH';
      const expected = `data:image/jpeg;base64,${rawJpegBase64}`;
      assert.equal(ensureBase64Prefix(rawJpegBase64), expected);
    });
  });

  describe('Uppercase protocol strings', () => {
    it('preserves uppercase HTTP:// URLs without prefixing', () => {
      const url = 'HTTP://example.com/images/prod1.jpg';
      assert.equal(ensureBase64Prefix(url), url);
    });

    it('preserves uppercase HTTPS:// URLs without prefixing', () => {
      const url = 'HTTPS://cdn.altavix.com/products/item.webp';
      assert.equal(ensureBase64Prefix(url), url);
    });

    it('preserves uppercase DATA:IMAGE/PNG;BASE64,... without double prefixing', () => {
      const dataUri = 'DATA:IMAGE/PNG;BASE64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      assert.equal(ensureBase64Prefix(dataUri), dataUri);
    });

    it('preserves uppercase BLOB: URLs without prefixing', () => {
      const blobUrl = 'BLOB:HTTP://localhost:5173/a1b2-c3d4-e5f6-7890';
      assert.equal(ensureBase64Prefix(blobUrl), blobUrl);
    });

    it('preserves uppercase BLOB:HTTPS:// URLs without prefixing', () => {
      const blobUrl = 'BLOB:HTTPS://altavix.com/9876-5432-10fe-dcba';
      assert.equal(ensureBase64Prefix(blobUrl), blobUrl);
    });
  });

  describe('Whitespace padded strings', () => {
    it('trims and preserves whitespace padded /images/ paths', () => {
      const path = '  /images/products/foo.webp  ';
      assert.equal(ensureBase64Prefix(path), '/images/products/foo.webp');
    });

    it('trims and preserves whitespace padded HTTP URLs', () => {
      const url = '  http://example.com/pic.jpg  ';
      assert.equal(ensureBase64Prefix(url), 'http://example.com/pic.jpg');
    });

    it('trims and preserves whitespace padded HTTPS URLs', () => {
      const url = '  https://cdn.altavix.com/products/item.webp  ';
      assert.equal(ensureBase64Prefix(url), 'https://cdn.altavix.com/products/item.webp');
    });

    it('trims and preserves whitespace padded data URIs', () => {
      const dataUri = '  data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==  ';
      assert.equal(ensureBase64Prefix(dataUri), 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==');
    });

    it('trims and preserves whitespace padded root-relative paths', () => {
      const path = ' \t/uploads/sample.png \n';
      assert.equal(ensureBase64Prefix(path), '/uploads/sample.png');
    });

    it('trims and prefixes whitespace padded raw base64 strings', () => {
      const rawBase64 = '  iVBORw0KGgoAAAANSUhEUg==  ';
      assert.equal(ensureBase64Prefix(rawBase64), 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUg==');
    });

    it('trims and prefixes whitespace padded raw JPEG base64 strings', () => {
      const rawJpeg = '  /9j/4AAQSkZJRgABAQEASABIAAD/  ';
      assert.equal(ensureBase64Prefix(rawJpeg), 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/');
    });

    it('returns empty string for whitespace-only strings', () => {
      assert.equal(ensureBase64Prefix('   '), '');
      assert.equal(ensureBase64Prefix('\t \n '), '');
    });
  });

  describe('Falsy and empty inputs', () => {
    it('returns empty string for empty string', () => {
      assert.equal(ensureBase64Prefix(''), '');
    });

    it('returns empty string for null', () => {
      assert.equal(ensureBase64Prefix(null as unknown as string), '');
    });

    it('returns empty string for undefined', () => {
      assert.equal(ensureBase64Prefix(undefined as unknown as string), '');
    });
  });
});
