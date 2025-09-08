import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Filter, Clock, Tags, Calendar, BarChart3 } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getUser();
  
  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Create, edit, and organize your tasks with ease'
    },
    {
      icon: Filter,
      title: 'Smart Filtering',
      description: 'Filter by priority, status, tags, and deadlines'
    },
    {
      icon: Clock,
      title: 'Priority Levels',
      description: 'Set high, medium, or low priority for your tasks'
    },
    {
      icon: Tags,
      title: 'Tag System',
      description: 'Organize tasks with custom tags and categories'
    },
    {
      icon: Calendar,
      title: 'Deadlines',
      description: 'Set due dates and never miss important tasks'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your productivity with visual statistics'
    }
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
            Welcome to
            <span className="block text-primary">{siteConfig.name}</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-3"
            >
              <a href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg rounded-full px-8 py-3"
            >
              <a href="/sign-in">
                Sign In
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Powerful features to help you manage your tasks efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 rounded-lg border bg-card">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to boost your productivity?
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Join thousands of users who have transformed their task management
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-3"
            >
              <a href="/sign-up">
                Start Managing Tasks Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
