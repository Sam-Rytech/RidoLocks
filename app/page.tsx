import LockForm from '../components/LockForm'
import LocksList from '../components/LocksList'

export default function Home() {
  return (
    <main className="flex flex-col items-center p-6 space-y-10">
      <LockForm />
      <LocksList />
    </main>
  )
}
