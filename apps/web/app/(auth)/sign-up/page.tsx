// This route exists only to keep old links working. Redirect to the new page.
import { redirect } from 'next/navigation'

export default function SignUpPage() {
  redirect('/signup')
}