import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nbijhyapeyxzrsgxmauz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanReasoning() {
  // Get all assistant messages
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, created_at')
    .eq('role', 'assistant')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching messages:', error)
    return
  }

  console.log(`Found ${messages.length} assistant messages total`)

  // Find reasoning messages (long English text, meta-language, etc.)
  const reasoningIds = []
  for (const msg of messages) {
    const c = msg.content || ''
    const isReasoning =
      c.length > 200 ||
      /\b(the user|i need to|i should|let me|according to|possible response|considering|band level|emotion option|okay,?\s.*user)/i.test(c) ||
      /\b(check if|wait,|but that|might be|too forward|i think|that's two|so even|let me think)/i.test(c) ||
      /\b(i can'?t|i'?m sorry|not appropriate|i'?m an ai|als ai|ik ben een ai|kan helaas geen|kan hier niet op ingaan|against my|end our conversation|being rude|demanding)/i.test(c) ||
      /\b(How do you like|Any hobbies|I'm very curious|Keep sending|I love it)/i.test(c) ||
      /\b(chatbot|kan geen foto|kan geen afbeelding|simuleren|dat is alles wat ik kan doen|ik ben een programma|taalmodel|language model)/i.test(c) ||
      /\b(sorry.*kan.*niet|niet in staat|kan.*niet.*maken.*die)/i.test(c) ||
      /^(https?:)?\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)\s*$/i.test(c.trim()) ||
      /fal\.media|fal\.run/i.test(c) ||
      c === 'Hmm...' ||
      c === 'hmm...'

    if (isReasoning) {
      reasoningIds.push(msg.id)
      console.log(`  DELETE: [${msg.id}] ${c.substring(0, 80)}...`)
    }
  }

  if (reasoningIds.length === 0) {
    console.log('No reasoning messages found!')
    return
  }

  console.log(`\nDeleting ${reasoningIds.length} reasoning messages...`)

  // Delete in batches
  for (let i = 0; i < reasoningIds.length; i += 50) {
    const batch = reasoningIds.slice(i, i + 50)
    const { error: delError } = await supabase
      .from('messages')
      .delete()
      .in('id', batch)

    if (delError) {
      console.error('Delete error:', delError)
    } else {
      console.log(`  Deleted batch ${i / 50 + 1} (${batch.length} messages)`)
    }
  }

  console.log('Done! All reasoning messages cleaned.')
}

cleanReasoning()
