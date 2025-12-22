'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/lib/user-auth'
import { userMessagesAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, AlertCircle, Inbox, Megaphone, Bell, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  type: string
  title: string
  content: string
  createdAt: string
  isRead: boolean
  readAt: string | null
}

export default function MessagesPage() {
  const router = useRouter()
  const { token, isAuthenticated, isLoading: authLoading } = useUserAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchMessages()
  }, [isAuthenticated, token, authLoading, router, currentPage])

  const fetchMessages = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const data = await userMessagesAPI.list(token, {
        page: currentPage,
        pageSize: 20
      })
      setMessages(data.messages)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    if (!token) return

    try {
      await userMessagesAPI.markRead(token, messageId)
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
      ))
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Megaphone className="h-5 w-5" />
      case 'DIRECT':
        return <Mail className="h-5 w-5" />
      case 'SYSTEM':
        return <Bell className="h-5 w-5" />
      default:
        return <Mail className="h-5 w-5" />
    }
  }

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'DIRECT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'SYSTEM':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Messages</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/me')}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 px-4 pb-4 md:px-8 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pagination?.total || 0} total message{pagination?.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/me">← Back to Dashboard</Link>
          </Button>
        </div>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Your Inbox</CardTitle>
            <CardDescription>
              Announcements, direct messages, and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`border-2 ${!message.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''}`}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getMessageIcon(message.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {message.title}
                                </h3>
                                <Badge className={`${getMessageBadgeColor(message.type)} border-0`}>
                                  {message.type}
                                </Badge>
                                {!message.isRead && (
                                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-0">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{new Date(message.createdAt).toLocaleString()}</span>
                                {message.isRead && message.readAt && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Read {new Date(message.readAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!message.isRead && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

