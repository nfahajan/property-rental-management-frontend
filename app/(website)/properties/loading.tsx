import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-96 mb-4 bg-primary-foreground/20" />
          <Skeleton className="h-6 w-[600px] bg-primary-foreground/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-56 w-full" />
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
