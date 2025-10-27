import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function IdeaSubmission() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    submitter_email: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const createIdeaMutation = useMutation({
    mutationFn: (data) => base44.entities.Idea.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Create idea record
      const idea = await createIdeaMutation.mutateAsync({
        ...formData,
        status: "submitted"
      });

      // Send confirmation email if email provided
      if (formData.submitter_email) {
        await base44.integrations.Core.SendEmail({
          to: formData.submitter_email,
          subject: "Thanks for submitting your SaaS idea!",
          body: `Hi there,

Thank you for submitting your SaaS idea "${formData.title}" to MicroSaaS Space!

Our team of industry experts will review your idea and validate it against:
- Market fit and demand
- Novelty and uniqueness
- Technical feasibility
- Monetization potential

If your idea scores well, we'll feature it in an upcoming newsletter reaching 5,000+ founders and investors.

We'll notify you once the review is complete (typically within 3-5 business days).

Best regards,
The MicroSaaS Space Team`,
          from_name: "MicroSaaS Space"
        });
      }

      setSubmitted(true);
      setFormData({
        title: "",
        description: "",
        category: "",
        submitter_email: ""
      });

      toast.success("Idea submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit idea: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-green-200">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Idea Submitted Successfully!
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Thank you for sharing your SaaS idea with us. Our expert team will review and validate it within 3-5 business days.
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">
                  What happens next?
                </h3>
                <ul className="text-left text-blue-800 space-y-2">
                  <li>✓ Expert review and validation</li>
                  <li>✓ Market research and scoring</li>
                  <li>✓ Email notification when complete</li>
                  <li>✓ Potential feature in our newsletter</li>
                </ul>
              </div>

              <Button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Another Idea
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-3xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Submit Your SaaS Idea
          </h1>
          <p className="text-xl text-gray-600">
            Share your validated SaaS concept with our community of 5,000+ founders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle>Idea Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idea Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., AI-Powered Contract Review Tool"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your SaaS idea, the problem it solves, and the target market..."
                    className="w-full h-40"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Be specific about the problem, solution, and target customers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal-tech">Legal Tech</SelectItem>
                      <SelectItem value="sales-tools">Sales Tools</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="dev-tools">Developer Tools</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ai-ml">AI & ML</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={formData.submitter_email}
                    onChange={(e) => setFormData({...formData, submitter_email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll notify you when your idea is reviewed
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Validation Process
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Our team will validate your idea against market fit, novelty, feasibility, and monetization potential. High-scoring ideas get featured in our newsletter!
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Idea for Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}