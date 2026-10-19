import { auth } from '@/lib/neon-auth'

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler()
