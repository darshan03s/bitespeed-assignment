import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const linkPrecedenceEnum = pgEnum('link_precedence', ['primary', 'secondary']);

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  linkedId: integer('linked_id'),
  linkPrecedence: linkPrecedenceEnum('link_precedence').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at')
});
