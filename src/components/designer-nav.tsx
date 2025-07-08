
import { LoadingLink } from "@/components/ui/loading-link"
import { Rocket } from "lucide-react"
import { DesignerUserNav } from "./designer-user-nav"

export function DesignerNav() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <LoadingLink href="/designer" className="flex items-center gap-2 font-semibold">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="">BrandBoost AI</span>
        </LoadingLink>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
             {/* Can add search here later if needed */}
          </div>
        <DesignerUserNav />
      </div>
    </header>
  )
}
