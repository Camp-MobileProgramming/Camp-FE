import { rest } from 'msw'

const mockUsers = [
  { id: 1, name: '정민', avatar: '🔵', online: true, status: '도서관 옆에 있어요' },
  { id: 2, name: '정환', avatar: '🔵', online: true, status: '스터디 중' },
  { id: 3, name: '동녕', avatar: '🔵', online: true, status: '카페에서 쉬는 중' },
  { id: 4, name: '다윤', avatar: '🔵', online: true, status: '수업 중' },
  { id: 5, name: '지은', avatar: '🔵', online: false, status: '과제하는 중' },
  { id: 6, name: '민수', avatar: '🔵', online: true, status: '점심 먹는 중' }
]

const mockChats = [
  {
    id: 1,
    participants: [
      { id: 1, name: '정민', avatar: '🔵' },
      { id: 2, name: '정환', avatar: '🔵' }
    ],
    type: '1:1',
    lastMessage: '도서관 옆에 있어요',
    lastMessageTime: '방금 전',
    unreadCount: 2,
    latestTimestamp: Date.now()
  },
  {
    id: 2,
    participants: [
      { id: 3, name: '스터디 그룹', avatar: '👥' }
    ],
    type: 'group',
    lastMessage: '정환: 내일 몇 시에 만날까요?',
    lastMessageTime: '5분 전',
    unreadCount: 5,
    latestTimestamp: Date.now() - 300000
  },
  {
    id: 3,
    participants: [
      { id: 4, name: '동녕', avatar: '🔵' }
    ],
    type: '1:1',
    lastMessage: '일짜여',
    lastMessageTime: '1시간 전',
    unreadCount: 0,
    latestTimestamp: Date.now() - 3600000
  },
  {
    id: 4,
    participants: [
      { id: 5, name: '과제 스터디', avatar: '👥' }
    ],
    type: 'group',
    lastMessage: '다윤: 자료 공유했습니다',
    lastMessageTime: '2시간 전',
    unreadCount: 1,
    latestTimestamp: Date.now() - 7200000
  }
]

const mockFriends = [
  { id: 1, name: '정민', avatar: '🔵', status: '도서관 옆에 있어요', online: true },
  { id: 2, name: '정환', avatar: '🔵', status: '스터디 중', online: true },
  { id: 3, name: '동녕', avatar: '🔵', status: '카페에서 쉬는 중', online: true },
  { id: 4, name: '다윤', avatar: '🔵', status: '수업 중', online: true },
  { id: 5, name: '지은', avatar: '🔵', status: '과제하는 중', online: false },
  { id: 6, name: '민수', avatar: '🔵', status: '점심 먹는 중', online: true }
]

const mockFriendRequests = [
  { id: 10, name: '현우', avatar: '🟣', status: '칼리 스터디 하셨을까요?', online: true },
  { id: 11, name: '서연', avatar: '🟣', status: '안녕하세요', online: false },
  { id: 12, name: '준호', avatar: '🟣', status: '칼리과 학생입니다', online: true }
]

const mockCurrentUser = {
  id: 0,
  name: '나',
  avatar: '🟦',
  email: 'user@university.ac.kr',
  status: '캠퍼스에서 만나요',
  friends: mockFriends.length,
  friendRequests: mockFriendRequests.length,
  onlineFriends: mockFriends.filter(f => f.online).length
}

export const handlers = [
  // Login endpoint
  rest.post('/api/login', async (req, res, ctx) => {
    const body = await req.json().catch(() => ({}))
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-token-' + Date.now(),
        user: { id: 0, name: '사용자', email: body.email }
      })
    )
  }),

  // Get current user
  rest.get('/api/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCurrentUser))
  }),

  // Get friends list
  rest.get('/api/friends', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockFriends))
  }),

  // Get friend requests
  rest.get('/api/friend-requests', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockFriendRequests))
  }),

  // Get chats list
  rest.get('/api/chats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockChats.sort((a, b) => b.latestTimestamp - a.latestTimestamp))
    )
  }),

  // Post chat message
  rest.post('/api/chats/:chatId/messages', async (req, res, ctx) => {
    const body = await req.json().catch(() => ({}))
    return res(
      ctx.status(201),
      ctx.json({
        id: Date.now(),
        chatId: ctx.params.chatId,
        from: 0,
        message: body.message,
        timestamp: new Date().toISOString()
      })
    )
  })
]
