import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Users,
  Sparkles,
  Calendar,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSender() {
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [subjectLine, setSubjectLine] = useState("");
  const [customIntro, setCustomIntro] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.Subscriber.list()
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.Idea.list('-created_date')
  });

  const createNewsletterMutation = useMutation({
    mutationFn: (data) => base44.entities.Newsletter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    }
  });

  const validatedIdeas = ideas.filter(i => 
    i.status === 'validated' || i.status === 'featured'
  ).slice(0, 10);

  const activeSubscribers = subscribers.filter(s => s.status === 'active');

  const toggleIdeaSelection = (ideaId) => {
    setSelectedIdeas(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const generateEmailContent = async () => {
    if (selectedIdeas.length === 0) {
      toast.error("Please select at least one idea");
      return;
    }

    setGenerating(true);
    try {
      const selectedIdeaObjects = ideas.filter(i => selectedIdeas.includes(i.id));
      
      const prompt = `Generate a professional, engaging newsletter email for "MicroSaaS Space" featuring these validated SaaS ideas:

${selectedIdeaObjects.map((idea, idx) => `
${idx + 1}. ${idea.title}
   Category: ${idea.category}
   Description: ${idea.description}
   Score: ${idea.validation_scores?.total_score || 'N/A'}/100
   Market Size: ${idea.market_data?.market_size || 'TBD'}
`).join('\n')}

Create:
1. A compelling subject line
2. A warm, personalized introduction
3. Featured ideas section with:
   - Brief overview of each idea
   - Key metrics and validation scores
   - Market opportunity highlights
   - Call-to-action for each idea
4. Closing with community engagement prompt

Keep the tone professional yet conversational, emphasizing the value and validation behind each idea.`;

      const content = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject_line: { type: "string" },
            intro: { type: "string" },
            featured_section: { type: "string" },
            closing: { type: "string" }
          }
        }
      });

      setSubjectLine(content.subject_line);
      setCustomIntro(content.intro);
      
      toast.success("Email content generated!");
    } catch (error) {
      toast.error("Failed to generate content: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const sendNewsletter = async () => {
    if (!subjectLine) {
      toast.error("Please add a subject line");
      return;
    }

    if (selectedIdeas.length === 0) {
      toast.error("Please select at least one idea");
      return;
    }

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Create newsletter record
      const newsletter = await createNewsletterMutation.mutateAsync({
        issue_number: Date.now(),
        send_date: new Date().toISOString(),
        status: 'sending',
        subject_line: subjectLine,
        featured_ideas: selectedIdeas,
        content_sections: {
          intro: customIntro,
          featured_section: "Generated content"
        }
      });

      // Send emails to all active subscribers
      for (const subscriber of activeSubscribers) {
        try {
          const selectedIdeaObjects = ideas.filter(i => selectedIdeas.includes(i.id));
          
          const emailBody = `
Hi ${subscriber.full_name || subscriber.email.split('@')[0]},

${customIntro}

📊 This Week's Validated Ideas:

${selectedIdeaObjects.map((idea, idx) => `
${idx + 1}. ${idea.title}
   ${idea.description}
   
   ✓ Category: ${idea.category}
   ✓ Validation Score: ${idea.validation_scores?.total_score || 'N/A'}/100
   ✓ Market Size: ${idea.market_data?.market_size || 'TBD'}
   ✓ Competition: ${idea.market_data?.competition_level || 'N/A'}
   
   ${idea.market_data?.estimated_mrr ? `💰 Est. MRR: ${idea.market_data.estimated_mrr}` : ''}
   ${idea.market_data?.time_to_market ? `⏱️ Time to Market: ${idea.market_data.time_to_market}` : ''}
`).join('\n---\n')}

Want to dive deeper into any of these ideas? Reply to this email and let us know!

Best regards,
The MicroSaaS Space Team

---
Unsubscribe: [Link]
          `.trim();

          await base44.integrations.Core.SendEmail({
            to: subscriber.email,
            subject: subjectLine,
            body: emailBody,
            from_name: "MicroSaaS Space"
          });

          successCount++;
          
          // Update subscriber engagement
          await base44.entities.Subscriber.update(subscriber.id, {
            ...subscriber,
            total_opens: (subscriber.total_opens || 0) + 1
          });
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failCount++;
        }
      }

      // Update newsletter record
      await base44.entities.Newsletter.update(newsletter.id, {
        ...newsletter,
        status: 'sent',
        metrics: {
          total_sent: successCount + failCount,
          total_delivered: successCount,
          total_bounced: failCount
        }
      });

      toast.success(`Newsletter sent successfully! ${successCount} delivered, ${failCount} failed`);
      
      // Reset form
      setSelectedIdeas([]);
      setSubjectLine("");
      setCustomIntro("");
    } catch (error) {
      toast.error("Failed to send newsletter: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Newsletter Sender
          </h1>
          <p className="text-gray-600">
            Create and send your weekly newsletter to all subscribers
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {activeSubscribers.length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Validated Ideas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {validatedIdeas.length}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ideas Selected</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedIdeas.length}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Idea Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Ideas to Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {validatedIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedIdeas.includes(idea.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => toggleIdeaSelection(idea.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIdeas.includes(idea.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-100 text-blue-700">
                            {idea.category}
                          </Badge>
                          {idea.validation_scores?.total_score && (
                            <Badge className="bg-green-100 text-green-700">
                              Score: {idea.validation_scores.total_score}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Composer */}
          <Card>
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <Input
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="e.g., This Week's Top 3 Validated SaaS Ideas"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introduction
                </label>
                <Textarea
                  value={customIntro}
                  onChange={(e) => setCustomIntro(e.target.value)}
                  placeholder="Write your newsletter introduction..."
                  className="w-full h-32"
                />
              </div>

              <Button
                onClick={generateEmailContent}
                disabled={generating || selectedIdeas.length === 0}
                variant="outline"
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Email Content with AI
                  </>
                )}
              </Button>

              <div className="border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Preview
                  </h4>
                  <p className="text-sm text-blue-700">
                    📧 To: {activeSubscribers.length} active subscribers<br />
                    📋 Subject: {subjectLine || "[Subject line needed]"}<br />
                    💡 Ideas: {selectedIdeas.length} selected
                  </p>
                </div>

                <Button
                  onClick={sendNewsletter}
                  disabled={sending || !subjectLine || selectedIdeas.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending to {activeSubscribers.length} subscribers...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Newsletter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}