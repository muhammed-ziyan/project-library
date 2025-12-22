import { prisma } from '../lib/prisma'

/**
 * Cleanup script to ensure each user has only one enrollment
 * Keeps the most recent enrollment for each user
 */
async function cleanupMultipleEnrollments() {
  console.log('Starting cleanup of multiple enrollments...')

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      enrollments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  let cleanedCount = 0

  for (const user of users) {
    if (user.enrollments.length > 1) {
      console.log(`User ${user.phoneNumber} has ${user.enrollments.length} enrollments`)
      
      // Keep the most recent enrollment (first in desc order)
      const keepEnrollment = user.enrollments[0]
      const toDelete = user.enrollments.slice(1)

      // Delete older enrollments
      for (const enrollment of toDelete) {
        const enrollmentId = enrollment.id
        const groupId = enrollment.groupId

        // Delete dependent rows first (FK constraints)
        await prisma.enrollmentProgress.deleteMany({ where: { enrollmentId } })
        await prisma.submission.deleteMany({ where: { enrollmentId } })
        await prisma.userActivity.deleteMany({ where: { enrollmentId } })

        // Delete enrollment
        await prisma.enrollment.delete({ where: { id: enrollmentId } })

        // Clean up group if no enrollments remain
        if (groupId) {
          const remaining = await prisma.enrollment.count({ where: { groupId } })
          if (remaining === 0) {
            await prisma.group.delete({ where: { id: groupId } })
          }
        }
        cleanedCount++
      }

      console.log(`  Kept enrollment: ${keepEnrollment.id} (${keepEnrollment.createdAt})`)
      console.log(`  Deleted ${toDelete.length} older enrollment(s)`)
    }
  }

  console.log(`\nCleanup complete! Removed ${cleanedCount} duplicate enrollment(s).`)
}

cleanupMultipleEnrollments()
  .catch((error) => {
    console.error('Error during cleanup:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

