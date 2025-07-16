// Simple test version to debug issues
import { Layout } from '@/components/layout/Layout';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Cohen3 - Risk Assessment Platform
          </h1>
          <p className="text-muted-foreground">
            Professional safety training platform
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your games and performance</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Games</h2>
            <p className="text-muted-foreground">Create and manage risk assessment games</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p className="text-muted-foreground">Track performance and results</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;