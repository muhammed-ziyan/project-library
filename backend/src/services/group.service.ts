import { prisma } from '../lib/prisma'
import { AddGroupMember } from '../lib/zodSchemas'

export interface GroupInfo {
  id: string
  teamLeaderId: string
  secondMemberName: string | null
  secondMemberEmail: string | null
  secondMemberPhoneNumber: string | null
  secondMemberSchool: string | null
  secondMemberClassNum: number | null
  createdAt: Date
  updatedAt: Date
}

export class GroupService {
  /**
   * Create a new group with team leader
   */
  static async createGroup(
    teamLeaderId: string,
    secondMember?: AddGroupMember
  ): Promise<GroupInfo> {
    const group = await prisma.group.create({
      data: {
        teamLeaderId,
        secondMemberName: secondMember?.name || null,
        secondMemberEmail: secondMember?.email || null,
        secondMemberPhoneNumber: secondMember?.phoneNumber || null,
        secondMemberSchool: secondMember?.school || null,
        secondMemberClassNum: secondMember?.classNum || null
      }
    })

    return group
  }

  /**
   * Add second member to existing group
   */
  static async addMemberToGroup(
    groupId: string,
    memberData: AddGroupMember
  ): Promise<GroupInfo> {
    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      throw new Error('Group not found')
    }

    // Check if second member already exists
    if (group.secondMemberName) {
      throw new Error('This group already has a second member')
    }

    // Update group with second member info
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        secondMemberName: memberData.name,
        secondMemberEmail: memberData.email || null,
        secondMemberPhoneNumber: memberData.phoneNumber || null,
        secondMemberSchool: memberData.school || null,
        secondMemberClassNum: memberData.classNum || null
      }
    })

    return updatedGroup
  }

  /**
   * Get group by ID
   */
  static async getGroupById(groupId: string): Promise<GroupInfo | null> {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    return group
  }

  /**
   * Get group by team leader user ID
   */
  static async getGroupByLeader(userId: string): Promise<GroupInfo[]> {
    const groups = await prisma.group.findMany({
      where: { teamLeaderId: userId }
    })

    return groups
  }

  /**
   * Get all enrollments for a group
   */
  static async getGroupEnrollments(groupId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { groupId },
      include: {
        Project: {
          select: {
            id: true,
            slug: true,
            title: true,
            shortDesc: true,
            level: true,
            guidance: true
          }
        },
        progress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return enrollments
  }

  /**
   * Check if a group has second member
   */
  static async hasSecondMember(groupId: string): Promise<boolean> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { secondMemberName: true }
    })

    return !!group?.secondMemberName
  }
}

