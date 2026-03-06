import db from '../db/index.js';
import { contacts } from '../db/schema.js';
import { eq, or } from 'drizzle-orm';

type IdentifyInput = {
  email?: string | null;
  phoneNumber?: string | null;
};

type ContactRow = typeof contacts.$inferSelect;

export const identifyContact = async ({ email, phoneNumber }: IdentifyInput) => {
  if (!email && !phoneNumber) {
    throw new Error('At least one of email or phoneNumber must be provided');
  }

  const matchConditions = [];
  if (email) matchConditions.push(eq(contacts.email, email));
  if (phoneNumber) matchConditions.push(eq(contacts.phoneNumber, phoneNumber));

  const directMatches = await db
    .select()
    .from(contacts)
    .where(or(...matchConditions));

  if (directMatches.length === 0) {
    const [newContact] = await db
      .insert(contacts)
      .values({
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkPrecedence: 'primary',
        linkedId: null
      })
      .returning();

    if (!newContact) {
      throw new Error('Could not create new contact');
    }

    return buildResponse([newContact], newContact);
  }

  const primaryIdSet = new Set<number>();

  for (const contact of directMatches) {
    if (contact.linkPrecedence === 'primary') {
      primaryIdSet.add(contact.id);
    } else if (contact.linkedId !== null) {
      primaryIdSet.add(contact.linkedId);
    }
  }

  const primaryContacts = await Promise.all(
    [...primaryIdSet].map((id) => db.select().from(contacts).where(eq(contacts.id, id)))
  );
  const flatPrimaries = primaryContacts.flat();

  const sortedPrimaries = flatPrimaries.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const truePrimary = sortedPrimaries[0];

  if (!truePrimary) {
    throw new Error('Could not find true primary');
  }

  const otherPrimaries = sortedPrimaries.slice(1);
  for (const older of otherPrimaries) {
    await db
      .update(contacts)
      .set({
        linkPrecedence: 'secondary',
        linkedId: truePrimary.id,
        updatedAt: new Date()
      })
      .where(eq(contacts.id, older.id));

    await db
      .update(contacts)
      .set({
        linkedId: truePrimary.id,
        updatedAt: new Date()
      })
      .where(eq(contacts.linkedId, older.id));
  }

  const allInCluster = await db
    .select()
    .from(contacts)
    .where(or(eq(contacts.id, truePrimary.id), eq(contacts.linkedId, truePrimary.id)));

  const emailExists = email ? allInCluster.some((c) => c.email === email) : true;
  const phoneExists = phoneNumber ? allInCluster.some((c) => c.phoneNumber === phoneNumber) : true;

  const hasNewInfo = !emailExists || !phoneExists;

  if (hasNewInfo) {
    await db.insert(contacts).values({
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      linkPrecedence: 'secondary',
      linkedId: truePrimary.id
    });
  }

  const finalCluster = await db
    .select()
    .from(contacts)
    .where(or(eq(contacts.id, truePrimary.id), eq(contacts.linkedId, truePrimary.id)));

  const refreshedPrimary = finalCluster.find((c) => c.id === truePrimary.id)!;

  return buildResponse(finalCluster, refreshedPrimary);
};

function buildResponse(cluster: ContactRow[], primary: ContactRow) {
  const secondaries = cluster.filter((c) => c.id !== primary.id);

  const emails: string[] = [];
  if (primary.email) emails.push(primary.email);
  for (const c of secondaries) {
    if (c.email && !emails.includes(c.email)) emails.push(c.email);
  }

  const phoneNumbers: string[] = [];
  if (primary.phoneNumber) phoneNumbers.push(primary.phoneNumber);
  for (const c of secondaries) {
    if (c.phoneNumber && !phoneNumbers.includes(c.phoneNumber)) phoneNumbers.push(c.phoneNumber);
  }

  return {
    contact: {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map((c) => c.id)
    }
  };
}
