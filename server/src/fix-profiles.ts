import { prisma } from "./prisma/client";

async function fixProfiles() {
  try {
    // Find all users without profiles
    const usersWithoutProfiles = await prisma.user.findMany({
      where: {
        profile: null
      }
    });

    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);

    // Create profiles for users that don't have one
    for (const user of usersWithoutProfiles) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          name: user.email.split('@')[0], // Use email username as default name
          bio: ''
        }
      });
      console.log(`Created profile for user ${user.id} (${user.email})`);
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error fixing profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProfiles();
