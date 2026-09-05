import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ensureBase64Prefix } from '../src/utils/imageUtils.ts';

describe('Image Reordering & Drag-and-Drop Form Lifecycle', () => {
  const reorderArray = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
      return array;
    }
    if (fromIndex === toIndex) return array;
    const copy = [...array];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    return copy;
  };

  const moveToEnd = <T>(array: T[], fromIndex: number): T[] => {
    if (fromIndex < 0 || fromIndex >= array.length - 1) {
      return array;
    }
    const copy = [...array];
    const [item] = copy.splice(fromIndex, 1);
    copy.push(item);
    return copy;
  };

  describe('Array Reordering Operations', () => {
    it('moves first item to last position', () => {
      const original = ['img1.webp', 'img2.webp', 'img3.webp', 'img4.webp'];
      const result = reorderArray(original, 0, 3);
      assert.deepEqual(result, ['img2.webp', 'img3.webp', 'img4.webp', 'img1.webp']);
    });

    it('moves last item to first position (making it the cover image)', () => {
      const original = ['img1.webp', 'img2.webp', 'img3.webp'];
      const result = reorderArray(original, 2, 0);
      assert.deepEqual(result, ['img3.webp', 'img1.webp', 'img2.webp']);
    });

    it('moves middle item forward', () => {
      const original = ['A', 'B', 'C', 'D', 'E'];
      const result = reorderArray(original, 1, 3);
      assert.deepEqual(result, ['A', 'C', 'D', 'B', 'E']);
    });

    it('moves middle item backward', () => {
      const original = ['A', 'B', 'C', 'D', 'E'];
      const result = reorderArray(original, 3, 1);
      assert.deepEqual(result, ['A', 'D', 'B', 'C', 'E']);
    });

    it('handles dropping item onto "add more placeholder" (moves to end)', () => {
      const original = ['A', 'B', 'C', 'D'];
      const result = moveToEnd(original, 0);
      assert.deepEqual(result, ['B', 'C', 'D', 'A']);
    });

    it('dropping last item onto "add more" is a no-op', () => {
      const original = ['A', 'B', 'C'];
      const result = moveToEnd(original, 2);
      assert.deepEqual(result, ['A', 'B', 'C']);
    });

    it('noop when dropped on itself', () => {
      const original = ['img1', 'img2'];
      assert.deepEqual(reorderArray(original, 0, 0), original);
      assert.deepEqual(reorderArray(original, 1, 1), original);
    });

    it('noop on empty array', () => {
      const original: string[] = [];
      assert.deepEqual(reorderArray(original, 0, 1), []);
    });

    it('noop on single item array', () => {
      const original = ['only_one.webp'];
      assert.deepEqual(reorderArray(original, 0, 0), original);
    });

    it('noop on out of range indices', () => {
      const original = ['A', 'B'];
      assert.deepEqual(reorderArray(original, -1, 0), original);
      assert.deepEqual(reorderArray(original, 0, 5), original);
      assert.deepEqual(reorderArray(original, 5, 0), original);
    });
  });

  describe('ProductForm Lifecycle with Reordering', () => {
    // Mirroring ProductForm.tsx state management
    const createProductFormSession = (initialImages: string[] | undefined) => {
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
        handleReorderImages: (reorderedImages: string[]) => {
          images = [...reorderedImages];
          imagesModified = true;
        },
        handleSubmit: () => {
          return {
            images: imagesModified ? images : undefined
          };
        }
      };
    };

    it('when images are untouched, payload has images: undefined', () => {
      const session = createProductFormSession(['/images/products/1.webp', '/images/products/2.webp']);
      assert.equal(session.isModified(), false);
      const payload = session.handleSubmit();
      assert.equal(payload.images, undefined);
    });

    it('when images are reordered, imagesModified becomes true and reordered array is submitted', () => {
      const initial = ['/images/products/1.webp', '/images/products/2.webp', '/images/products/3.webp'];
      const session = createProductFormSession(initial);

      // Reorder: Move product 3 to the front
      const reordered = reorderArray(session.getImages(), 2, 0);
      session.handleReorderImages(reordered);

      assert.equal(session.isModified(), true);
      assert.deepEqual(session.getImages(), [
        '/images/products/3.webp',
        '/images/products/1.webp',
        '/images/products/2.webp'
      ]);

      const payload = session.handleSubmit();
      assert.deepEqual(payload.images, [
        '/images/products/3.webp',
        '/images/products/1.webp',
        '/images/products/2.webp'
      ]);
    });

    it('supports reordering then uploading new images', () => {
      const initial = ['/images/products/1.webp', '/images/products/2.webp'];
      const session = createProductFormSession(initial);

      // Reorder 1 and 2
      session.handleReorderImages(['/images/products/2.webp', '/images/products/1.webp']);

      // Upload new image
      const newImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      session.handleImagesChange([newImg]);

      // Then reorder again, moving the newly uploaded image to the first position
      session.handleReorderImages(reorderArray(session.getImages(), 2, 0));

      const payload = session.handleSubmit();
      assert.deepEqual(payload.images, [
        newImg,
        '/images/products/2.webp',
        '/images/products/1.webp'
      ]);
    });

    it('supports reordering then removing an image', () => {
      const initial = ['/images/products/1.webp', '/images/products/2.webp', '/images/products/3.webp'];
      const session = createProductFormSession(initial);

      // Swap 0 and 2
      session.handleReorderImages(['/images/products/3.webp', '/images/products/2.webp', '/images/products/1.webp']);

      // Remove the middle one (index 1: /images/products/2.webp)
      session.handleRemoveImage(1);

      const payload = session.handleSubmit();
      assert.deepEqual(payload.images, [
        '/images/products/3.webp',
        '/images/products/1.webp'
      ]);
    });

    it('new product creation: adding images and reordering them before submission', () => {
      const session = createProductFormSession(undefined);
      assert.deepEqual(session.getImages(), []);

      // Add two images
      const imgA = 'data:image/jpeg;base64,AAAA';
      const imgB = 'data:image/jpeg;base64,BBBB';
      session.handleImagesChange([imgA, imgB]);

      // Reorder them: [B, A]
      session.handleReorderImages([imgB, imgA]);

      const payload = session.handleSubmit();
      assert.deepEqual(payload.images, [imgB, imgA]);
    });
  });
});
