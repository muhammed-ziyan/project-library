import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Project Library
        </h1>
        <p className="text-xl text-muted-foreground">
          Discover, enroll in, and complete structured AI/ML learning projects with guided workflows
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/browse">Browse Projects</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filtering</CardTitle>
            <CardDescription>
              Filter by class, subject, difficulty, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find the perfect projects for your learning level with our comprehensive filtering system.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Guided Learning</CardTitle>
            <CardDescription>
              Step-by-step project flows with checklists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Follow structured workflows with progress tracking and resource recommendations.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Submissions</CardTitle>
            <CardDescription>
              Track outcomes and showcase your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Submit and track your project outcomes with flexible submission options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}