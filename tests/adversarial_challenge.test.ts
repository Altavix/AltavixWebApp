import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ensureBase64Prefix } from '../src/utils/imageUtils.ts';

describe('Adversarial Challenge - ensureBase64Prefix', () => {
  describe('1. Uppercase Protocols and Case-Sensitivity', () => {
    it('handles uppercase HTTP://', () => {
      const input = 'HTTP://example.com/images/prod1.jpg';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        input,
        'EMPIRICAL CONFIRMATION: ensureBase64Prefix preserves uppercase HTTP://'
      );
    });

    it('handles uppercase HTTPS://', () => {
      const input = 'HTTPS://cdn.altavix.com/prod.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        input,
        'EMPIRICAL CONFIRMATION: ensureBase64Prefix preserves uppercase HTTPS://'
      );
    });

    it('handles uppercase DATA:IMAGE/PNG;BASE64,...', () => {
      const input = 'DATA:IMAGE/PNG;BASE64,iVBORw0KGgoAAAANSUhEUg==';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        input,
        'EMPIRICAL CONFIRMATION: ensureBase64Prefix preserves uppercase DATA:IMAGE/'
      );
    });

    it('handles uppercase BLOB:HTTP://', () => {
      const input = 'BLOB:HTTP://localhost:5173/uuid-123';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        input,
        'EMPIRICAL CONFIRMATION: ensureBase64Prefix preserves uppercase BLOB:'
      );
    });
  });

  describe('2. Whitespace Padded Strings', () => {
    it('handles leading whitespace on physical paths', () => {
      const input = '  /images/products/c1d2e3.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        '/images/products/c1d2e3.webp',
        'EMPIRICAL CONFIRMATION: Leading whitespace is trimmed and physical path is preserved'
      );
    });

    it('handles tab and newline characters around paths', () => {
      const input = '\t/images/products/c1d2e3.webp\n';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        '/images/products/c1d2e3.webp',
        'EMPIRICAL CONFIRMATION: Whitespace escapes are trimmed'
      );
    });

    it('handles leading whitespace on http URLs', () => {
      const input = '  http://example.com/pic.jpg';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        'http://example.com/pic.jpg',
        'EMPIRICAL CONFIRMATION: Leading whitespace on http URL is trimmed'
      );
    });

    it('handles leading whitespace on data URIs', () => {
      const input = '  data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
        'EMPIRICAL CONFIRMATION: Leading whitespace on data URI is trimmed'
      );
    });

    it('handles whitespace-only strings', () => {
      const input = '   ';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        '',
        'EMPIRICAL CONFIRMATION: Whitespace-only string returns empty string'
      );
    });

    it('handles trailing-only whitespace on physical paths', () => {
      const input = '/images/products/c1d2e3.webp   ';
      const result = ensureBase64Prefix(input);
      assert.equal(
        result,
        '/images/products/c1d2e3.webp',
        'EMPIRICAL CONFIRMATION: Trailing whitespace is trimmed'
      );
    });
  });

  describe('3. URL Encodings and Encoded Characters', () => {
    it('preserves percent-encoded filenames under /images/', () => {
      const input = '/images/products/my%20photo%20(1).webp';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('preserves unicode characters in path under /images/', () => {
      const input = '/images/products/кава_чорна.webp';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('double prefixes fully URL-encoded path %2Fimages%2F...', () => {
      const input = '%2Fimages%2Fproducts%2F1.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(result, `data:image/jpeg;base64,${input}`);
    });
  });

  describe('4. Nested Paths and Relative Paths', () => {
    it('preserves deeply nested /images/... paths', () => {
      const input = '/images/products/2026/09/batch1/thumb/sample.webp';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('preserves root-relative nested paths', () => {
      const input = '/cdn-cgi/image/w=1000/images/products/item.webp';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('prefixes relative path without leading slash images/products/...', () => {
      const input = 'images/products/1.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(result, `data:image/jpeg;base64,${input}`);
    });

    it('prefixes dot-slash relative path ./images/products/...', () => {
      const input = './images/products/1.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(result, `data:image/jpeg;base64,${input}`);
    });

    it('prefixes dot-dot-slash relative path ../images/products/...', () => {
      const input = '../images/products/1.webp';
      const result = ensureBase64Prefix(input);
      assert.equal(result, `data:image/jpeg;base64,${input}`);
    });
  });

  describe('5. Weird and Extended MIME Types', () => {
    it('preserves data:image/webp;charset=utf-8;base64,...', () => {
      const input = 'data:image/webp;charset=utf-8;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AAA/v6v9gAAAA==';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('preserves data:image/avif;base64,...', () => {
      const input = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjE=';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('preserves data:image/x-icon;base64,...', () => {
      const input = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      assert.equal(ensureBase64Prefix(input), input);
    });

    it('prefixes non-image MIME types such as data:application/octet-stream;base64,...', () => {
      const input = 'data:application/octet-stream;base64,iVBORw0KGgoAAAANSUhEUg==';
      const result = ensureBase64Prefix(input);
      assert.equal(result, `data:image/jpeg;base64,${input}`);
    });
  });
});

describe('Adversarial Challenge - ProductForm Submission Lifecycle', () => {
  // Model mirroring ProductForm.tsx state transitions
  const createFormSession = (initialImages: string[] | undefined) => {
    let images: string[] = (initialImages || []).map(ensureBase64Prefix);
    let imagesModified = false;

    return {
      getImages: () => [...images],
      isModified: () => imagesModified,
      handleImagesChange: (newImagesBase64: string[]) => {
        images = [...images, ...newImagesBase64];
        imagesModified = true;
      },
      handleRemoveImage: (indexToRemove: number) => {
        images = images.filter((_, index) => index !== indexToRemove);
        imagesModified = true;
      },
      handleSubmit: () => {
        return {
          images: imagesModified ? images : undefined
        };
      }
    };
  };

  it('verifies canonical lifecycle: 3 existing images -> remove image 2 -> add new base64 image -> submit', () => {
    const existingImages = [
      '/images/products/1.webp',
      '/images/products/2.webp',
      '/images/products/3.webp'
    ];
    const newBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const session = createFormSession(existingImages);

    // Initial state check
    assert.deepEqual(session.getImages(), existingImages);
    assert.equal(session.isModified(), false);

    // Step 1: User removes image 2 (index 1)
    session.handleRemoveImage(1);
    assert.deepEqual(session.getImages(), [
      '/images/products/1.webp',
      '/images/products/3.webp'
    ]);
    assert.equal(session.isModified(), true);

    // Step 2: User adds new base64 image
    session.handleImagesChange([newBase64]);
    assert.deepEqual(session.getImages(), [
      '/images/products/1.webp',
      '/images/products/3.webp',
      newBase64
    ]);
    assert.equal(session.isModified(), true);

    // Step 3: User submits
    const payload = session.handleSubmit();
    assert.ok(payload.images !== undefined);
    assert.equal(payload.images.length, 3);
    assert.equal(payload.images[0], '/images/products/1.webp', 'Image 1 is preserved unmodified');
    assert.equal(payload.images[1], '/images/products/3.webp', 'Image 3 is preserved unmodified');
    assert.equal(payload.images[2], newBase64, 'New base64 image is appended');
    assert.ok(!payload.images.includes('/images/products/2.webp'), 'Image 2 is excluded');

    // Confirm no double prefixing happened
    for (const img of payload.images) {
      assert.ok(!img.startsWith('data:image/jpeg;base64,/images/'), `Double prefixing detected on: ${img}`);
      assert.ok(!img.startsWith('data:image/jpeg;base64,data:image/'), `Double prefixing detected on: ${img}`);
    }
  });

  it('verifies submission when images are untouched: images payload is undefined', () => {
    const existingImages = [
      '/images/products/1.webp',
      '/images/products/2.webp'
    ];
    const session = createFormSession(existingImages);
    const payload = session.handleSubmit();
    assert.equal(payload.images, undefined, 'Untouched images send undefined to preserve backend collection');
  });

  it('verifies submission when all images are removed: images payload is empty array []', () => {
    const existingImages = [
      '/images/products/1.webp',
      '/images/products/2.webp'
    ];
    const session = createFormSession(existingImages);
    session.handleRemoveImage(0);
    session.handleRemoveImage(0);
    const payload = session.handleSubmit();
    assert.deepEqual(payload.images, [], 'Removing all images submits empty array to signal clearing images');
  });

  it('demonstrates remediation: initial images containing leading whitespace are trimmed and preserved', () => {
    const initialImagesWithWhitespace = [
      ' /images/products/1.webp',
      '/images/products/2.webp'
    ];
    const session = createFormSession(initialImagesWithWhitespace);
    const images = session.getImages();
    assert.equal(
      images[0],
      '/images/products/1.webp',
      'EMPIRICAL CONFIRMATION: Leading whitespace in initialData is trimmed on form init and not corrupted'
    );
  });

  it('correctly prefixes raw JPEG Base64 starting with /9j/ instead of treating as root path', () => {
    const rawJpeg = '/9j/4AAQSkZJRgABAQEASABIAAD/';
    const result = ensureBase64Prefix(rawJpeg);
    assert.equal(
      result,
      `data:image/jpeg;base64,${rawJpeg}`,
      'EMPIRICAL CONFIRMATION: Raw JPEG Base64 starting with /9j/ is correctly prefixed with data:image/jpeg;base64,'
    );
  });
});
