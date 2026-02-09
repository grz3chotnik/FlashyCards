import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Gets the current authenticated user from Clerk and ensures they exist in the database.
 * Creates a new user record if this is their first time.
 *
 * @returns User object from database, or null if not authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find user in database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist, create them
  if (!user) {
    const clerkUser = await currentUser();

    if (!clerkUser?.emailAddresses[0]) {
      return null;
    }

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
      },
    });
  }

  return user;
}
