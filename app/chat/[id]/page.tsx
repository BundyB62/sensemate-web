import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from './ChatInterface'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: companion } = await supabase
    .from('companions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!companion) redirect('/dashboard')

  // Load the last 100 messages (descending to get newest, then reverse for display order)
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('companion_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  const messages = (rawMessages || []).reverse()

  return <ChatInterface companion={companion} initialMessages={messages || []} />
}
