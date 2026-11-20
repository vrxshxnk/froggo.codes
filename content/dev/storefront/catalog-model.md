---
id: catalog-model
project: storefront
title: "Model the catalog: products, variants, inventory"
summary: >-
  Design the tables behind your shop so that the variant, not the product, owns the price, SKU and stock, then seed about 30 realistic products so every later feature is tested against believable data.
time: 4-5 hours
doneWhen:
  - The products table has no price or stock column; price, SKU and stock live only on variants
  - Prices are stored as whole numbers in the smallest currency unit (paise or cents), never as decimals or floats
  - Running your seed command twice in a row leaves exactly the same catalog, with no duplicates
  - The seeded catalog has about 30 products, some out-of-stock variants and at least one product with a single variant
  - Trying to set a variant's stock to -1 or reuse an existing SKU in psql fails with a constraint error
docs:
  - label: "Drizzle: schema declaration"
    url: https://orm.drizzle.team/docs/sql-schema-declaration
  - label: "Drizzle: migrations"
    url: https://orm.drizzle.team/docs/migrations
  - label: "PostgreSQL: constraints"
    url: https://www.postgresql.org/docs/current/ddl-constraints.html
  - label: "PostgreSQL: JSON types"
    url: https://www.postgresql.org/docs/current/datatype-json.html
  - label: "Stripe: supported currencies and minor units"
    url: https://docs.stripe.com/currencies
---

## What you're building

There's no UI yet, just a database that already describes a believable shop. A "Pond Hoodie" exists as a product with a name, a description, a category and photos. Under it sit nine variants, one for each colour and size, and each variant has its own SKU like `HOOD-BLK-M`, its own price and its own stock count. Some are sold out. A sticker pack has exactly one variant, because not everything comes in sizes.

You'll also have one command, `npm run db:seed`, that reloads the catalog from a data file. Every later milestone is built and tested against this data.

## Why it matters

"What owns the price?" is the first question in any commerce codebase, and a wrong answer is expensive to undo. Once orders exist, changing it means migrating real purchase history. Putting price and stock on the variant shows an interviewer that you model the thing a customer actually buys, not the thing a marketing page shows. It also sets up their follow-ups: how do you stop stock going negative, and why integers for money?

## Before you start

- **Product vs variant.** A product is a grouping: a name, a description, photos and a category. A variant is one buyable combination of options, such as Black and M. A SKU (stock keeping unit) is the variant's unique code.
- **Money as integers.** Floating-point numbers can't represent most decimals exactly: in JavaScript, `0.1 + 0.2` is `0.30000000000000004`. Store ₹1,499.00 as `149900` paise in an `integer` column, and format it only when you display it. Stripe expects amounts in the same smallest unit.
- **Constraints.** A constraint is a rule the database enforces no matter which code path writes the row. `CHECK (stock >= 0)` and `UNIQUE (sku)` catch bugs that your application code will one day let through.
- **`jsonb`.** A Postgres column type for JSON you can still query and index. It suits variant options: a hoodie has size and colour, a sticker pack has none.
- **Migrations.** Versioned files that change the schema step by step, so every database ends up identical. You used them in Project 3.

## Build it step by step

### Step 1: Write the queries before the tables

Write down the five questions your shop will ask the database most often, such as "all products in a category with their lowest price", "one product by slug with all its variants", "is variant X in stock?", "lower variant X's stock by 2, but only if there's enough", and "all variants with fewer than 5 left". If one is awkward against your design, fix the design now.

Check it: every query on your list can be answered by joining at most two or three tables.

### Step 2: Sketch the tables

You need `categories`, `products`, `variants` and `product_images`. A product has a unique `slug` for its URL (`pond-hoodie`), a `category_id`, and an `option_names` array that says which options its variants use, in display order (`["color", "size"]`). The variant holds the money:

```sql
-- a sketch to argue with, not the finished schema
variants (
  id          uuid primary key,
  product_id  uuid not null references products(id),
  sku         text not null unique,      -- "HOOD-BLK-M"
  options     jsonb not null,            -- {"color": "Black", "size": "M"}
  price       integer not null,          -- paise: 149900 = ₹1,499.00
  stock       integer not null check (stock >= 0)
)
```

Decide the details yourself. Can `price` be zero? What stops two variants of one product having identical options? (Hint: a unique constraint on `product_id` plus `options`. Postgres compares `jsonb` by content, so key order doesn't matter.) Pick one currency for the whole shop, such as `inr` or `usd`, and store it in config or on the product.

Check it: describe "Pond Hoodie, White, XL, ₹1,599, 0 in stock" as rows. It should take one variant row under an existing product, with nothing duplicated.

### Step 3: Write it as a Drizzle schema and migrate

Declare the tables in a `db/schema.ts` file with Drizzle's `pgTable`, then generate and apply a migration. Keep your connection string in `.env.local` as `DATABASE_URL`.

```bash
npx drizzle-kit generate   # writes a SQL migration from your schema
npx drizzle-kit migrate    # applies it to DATABASE_URL
```

Read the generated SQL file. If a `CHECK` or `UNIQUE` you meant to add isn't in it, it doesn't exist.

Check it: in `psql "$DATABASE_URL"`, run `\d variants`. Your constraints are listed under the columns.

### Step 4: Write realistic seed data

Create a `db/seed-data.json` file with about 30 products across four or five categories, each with a real-sounding name, a short description and its option values. Generate the variants in the seed script as every combination of the option values, rather than typing 200 by hand. Build each SKU from a product code plus the option values, so it's the same on every run.

Make the data awkward on purpose: a 60-character product name, a product with one variant, one where every variant is sold out, a few variants with 1 or 2 left, and prices that differ by size. Use photos you have the right to use, saved under `public/products/`.

```json
{ "slug": "pond-hoodie", "name": "Pond Hoodie", "category": "hoodies",
  "options": { "color": ["Black", "Moss", "White"], "size": ["S", "M", "L"] },
  "basePrice": 149900, "priceBySize": { "L": 159900 } }
```

Check it: before inserting, count what your generator produces. A 3 × 3 hoodie gives exactly 9.

### Step 5: Make the seed script safe to rerun

Write `db/seed.ts` and add `"db:seed": "tsx db/seed.ts"` to your package scripts. Inside one transaction, delete the catalog tables (children first: images and variants, then products, then categories), then insert everything. If any insert fails, you keep the old catalog rather than half a new one. Use fixed stock numbers, not random ones, so a bug you find today is still there tomorrow.

Once orders reference variants, a seed that deletes variants will fail on a foreign key or wipe order history. So the seed is for development only, and should refuse to run when `NODE_ENV` is `production`.

Check it: run `npm run db:seed` twice, then `select count(*) from variants;`. You get the same number both times.

### Step 6: Prove the constraints work

In `psql`, try to break your own rules: set a variant's stock to `-1`, reuse an existing SKU, and insert a second "Black / M" for the same hoodie. Each should fail with an error naming the constraint. Then run the five queries from step 1 by hand, especially "decrement only if there's enough". You'll reuse its shape in the webhook milestone.

Check it: all three bad writes fail, and all five queries return what you expect.

## Common mistakes

- **Price on the product.** Symptom: the large hoodie needs to cost ₹100 more, and you add a `price_override` column, then another, then special cases in the cart. Fix: price lives on the variant from the start. A product's "from ₹1,499" label is just `min(price)` over its variants.
- **Using `numeric` or `float` for money and doing maths in JavaScript.** Symptom: totals like `2997.0000000000005`, or a Stripe error that the amount must be an integer. Fix: integer minor units everywhere, and convert only for display with `Intl.NumberFormat`.
- **A seed that appends instead of replacing.** Symptom: after three runs every product appears three times. Fix: clear and insert inside one transaction.
- **Storing options as free text like `"Black / M"`.** Symptom: you can't filter by size without parsing strings. Fix: structured `jsonb` (or a separate option-values table) so you can query `options->>'size'` directly.

## Say it in the interview

"The variant owns price, SKU and stock, and the product is just a grouping with a name and photos, because a customer never buys 'a hoodie', they buy 'Black, M'. Money is stored in paise as integers, which is also what Stripe expects, so there's no float rounding anywhere. Stock has a `CHECK (stock >= 0)` constraint, so even a bug in my code can't oversell into negative numbers. I used `jsonb` for options so products can have different option types. The tradeoff is weaker typing than a separate option-values table."

## Stretch goals

- Add a `compare_at_price` column to variants for showing sale prices, and decide what the cart does if it's lower than the price.
- Add a `status` column to products (`draft`, `active`, `archived`) so items can be hidden without deleting them, and with them the order history that points at them.
