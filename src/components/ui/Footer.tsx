export default function Footer() {
  return (
    <footer className="bg-zinc-200 dark:bg-zinc-800 py-4">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} Cortes Marketplace
      </div>
    </footer>
  )
}
