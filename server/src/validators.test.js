import { describe, expect, it } from 'vitest';
import { checkoutSchema, productMutationSchema, registerSchema } from './validators.js';

describe('request validation', () => {
  it('normalizes registration email and enforces a strong minimum password length', () => {
    expect(registerSchema.parse({
      email: ' SHOP@example.com ',
      password: 'long-enough-password',
      name: 'Ada Shop',
    }).email).toBe('shop@example.com');
    expect(registerSchema.safeParse({
      email: 'shop@example.com',
      password: 'short',
      name: 'Ada Shop',
    }).success).toBe(false);
  });

  it('requires checkout quantity and address while accepting only client product identifiers', () => {
    const result = checkoutSchema.parse({
      idempotencyKey: 'b2ced7b6-b6e4-4a2c-9e61-4fda0df63e6c',
      items: [{ productId: 'product-1', quantity: 1 }],
      address: {
        recipient: 'Ada Lovelace',
        line1: 'Calle Mayor 1',
        city: 'Madrid',
        postalCode: '28001',
        country: 'es',
      },
    });
    expect(result.address.country).toBe('ES');
    expect(checkoutSchema.safeParse({
      ...result,
      items: [{ productId: 'product-1', quantity: 1.5 }],
    }).success).toBe(false);
  });

  it('rejects malformed product URLs and slugs', () => {
    expect(productMutationSchema.safeParse({
      name: 'Product name',
      slug: 'Bad Slug',
      description: 'A descriptive product description',
      imageUrl: 'not-a-url',
      priceCents: 1200,
      stock: 1,
      categoryId: 'category-1',
    }).success).toBe(false);
  });
});
