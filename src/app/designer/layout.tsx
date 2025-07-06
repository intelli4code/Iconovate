import { DesignerNav } from "@/components/designer-nav"

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DesignerNav />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}
