import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...')

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Create admin user
    const password = 'admin123' // Change this in production!
    const passwordHash = await bcrypt.hash(password, 12)

    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Username: ${admin.username}`)
    console.log(`Password: ${password}`)
    console.log('⚠️  Please change the password in production!')
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()

