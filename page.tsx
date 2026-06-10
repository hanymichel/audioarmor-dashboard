import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

function createClient(cookieStore: ReadonlyRequestCookies) {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
	if (!url || !key) throw new Error('Supabase URL or ANON key not configured')
	return createSupabaseClient(url, key)
}

export default async function Page() {
	const cookieStore = await cookies()
	const supabase = createClient(cookieStore)

	const { data: todos } = await supabase.from('todos').select()

	return (
		<ul>
			{todos?.map((todo) => (
				<li key={todo.id}>{todo.name}</li>
			))}
		</ul>
	)
}