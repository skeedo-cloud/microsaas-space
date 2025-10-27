import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Lightbulb,
  Target,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const [metrics, setMetrics] = useState({
    subscriberGrowth: [],
    ideaSubmissions: [],
    newsletterPerformance: [],
    engagementTrends: []
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.Subscriber.list('-created_date')
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.Idea.list('-created_date')
  });

  const { data: newsletters = [] } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-send_date')
  });

  useEffect(() => {
    // Calculate metrics
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSubscribers = subscribers.filter(s => 
      new Date(s.created_date) >= last30Days
    );

    const recentIdeas = ideas.filter(i => 
      new Date(i.created_date) >= last30Days
    );

    const recentNewsletters = newsletters.filter(n => 
      n.send_date && new Date(n.send_date) >= last30Days
    );

    setMetrics({
      subscriberGrowth: recentSubscribers.length,
      ideaSubmissions: recentIdeas.length,
      newsletterPerformance: recentNewsletters,
      avgEngagement: subscribers.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / (subscribers.length || 1)
    });
  }, [subscribers, ideas, newsletters]);

  const kpis = [
    {
      title: "Total Subscribers",
      value: subscribers.length,
      change: `+${metrics.subscriberGrowth} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      title: "Active Ideas",
      value: ideas.filter(i => i.status !== 'archived' && i.status !== 'rejected').length,
      change: `${metrics.ideaSubmissions} new submissions`,
      icon: Lightbulb,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    },
    {
      title: "Newsletters Sent",
      value: newsletters.filter(n => n.status === 'sent').length,
      change: `${metrics.newsletterPerformance.length} this month`,
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up"
    },
    {
      title: "Avg Engagement",
      value: `${metrics.avgEngagement?.toFixed(1)}%`,
      change: "Across all subscribers",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "neutral"
    }
  ];

  const categoryBreakdown = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1;
    return acc;
  }, {});

  const statusBreakdown = ideas.reduce((acc, idea) => {
    acc[idea.status] = (acc[idea.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track performance metrics and growth insights
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${kpi.bgColor} p-3 rounded-xl`}>
                      <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    {kpi.trend === 'up' && (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    )}
                    {kpi.trend === 'down' && (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {kpi.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {kpi.change}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Ideas by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace('-', ' ')}
                        </span>
                        <Badge>{count} ideas</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(count / ideas.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Ideas by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const statusColors = {
                      submitted: 'bg-yellow-100 text-yellow-700',
                      'under-review': 'bg-blue-100 text-blue-700',
                      validated: 'bg-green-100 text-green-700',
                      featured: 'bg-purple-100 text-purple-700',
                      rejected: 'bg-red-100 text-red-700',
                      archived: 'bg-gray-100 text-gray-700'
                    };

                    return (
                      <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <Badge className={statusColors[status] || 'bg-gray-100 text-gray-700'}>
                          {status}
                        </Badge>
                        <span className="text-2xl font-bold text-gray-900">
                          {count}
                        </span>
                        <span className="text-sm text-gray-500">
                          {((count / ideas.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Performance */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Recent Newsletter Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsletters.slice(0, 5).map((newsletter) => (
                  <div key={newsletter.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Issue #{newsletter.issue_number}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {newsletter.subject_line}
                        </p>
                      </div>
                      <Badge className={
                        newsletter.status === 'sent' ? 'bg-green-100 text-green-700' :
                        newsletter.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {newsletter.status}
                      </Badge>
                    </div>
                    {newsletter.metrics && (
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Sent</p>
                          <p className="text-lg font-bold text-gray-900">
                            {newsletter.metrics.total_sent || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivered</p>
                          <p className="text-lg font-bold text-green-600">
                            {newsletter.metrics.total_delivered || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Opens</p>
                          <p className="text-lg font-bold text-blue-600">
                            {newsletter.metrics.total_opened || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rate</p>
                          <p className="text-lg font-bold text-purple-600">
                            {newsletter.metrics.open_rate?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}