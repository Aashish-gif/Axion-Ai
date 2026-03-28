import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Play } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-cream flex flex-col overflow-x-hidden">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b-[3px] border-dark-border shadow-[0_4px_0_#111827] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-accent-red text-white w-10 h-10 rounded-xl flex items-center justify-center border-[2.5px] border-dark-border shadow-[2px_2px_0_#111827]">
            <Play size={20} fill="currentColor" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tight text-dark-border">
            Axionix AI
          </span>
        </Link>
        <div className="hidden md:flex gap-8 font-bold text-dark-border">
          <a href="#features" className="hover:text-accent-red hover:underline decoration-2 underline-offset-4 transition-all">Features</a>
          <a href="#pricing" className="hover:text-accent-red hover:underline decoration-2 underline-offset-4 transition-all">Pricing</a>
          <a href="#blog" className="hover:text-accent-red hover:underline decoration-2 underline-offset-4 transition-all">Blog</a>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" className="py-2.5 px-5">Get Started Free</Button>
        </Link>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
          {/* Floating Emojis */}
          <div className="absolute top-[20%] left-[15%] text-4xl animate-float" style={{ animationDelay: '0s' }}>🪙</div>
          <div className="absolute top-[15%] right-[20%] text-5xl animate-float" style={{ animationDelay: '1s' }}>📊</div>
          <div className="absolute bottom-[25%] left-[20%] text-5xl animate-float" style={{ animationDelay: '2s' }}>🎬</div>
          <div className="absolute top-[40%] right-[10%] text-4xl animate-float" style={{ animationDelay: '3s' }}>💬</div>
          <div className="absolute bottom-[30%] right-[25%] text-5xl animate-float" style={{ animationDelay: '4s' }}>🔥</div>
          <div className="absolute top-[50%] left-[10%] text-4xl animate-float" style={{ animationDelay: '1.5s' }}>⚡</div>

          <Badge variant="red" className="mb-8">🚀 AI-Powered YouTube Analytics</Badge>

          <h1 className="font-heading font-black text-5xl md:text-[64px] leading-[1.1] text-dark-border max-w-4xl mx-auto mb-6">
            Turn Your <span className="inline-block text-accent-red bg-[#FFF0F0] border-[2.5px] border-dark-border rounded-xl shadow-[3px_4px_0_#111827] px-3 pb-1 md:pb-2 rotate-[-2deg]">Comments</span> into Your Next Viral Video.
          </h1>

          <p className="text-xl md:text-2xl font-medium text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop guessing what your audience wants. We analyze thousands of comments to uncover your next trending topic in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/dashboard">
              <Button variant="primary" className="flex items-center gap-2 text-lg">
                <Play size={20} fill="currentColor" /> Connect YouTube Channel
              </Button>
            </Link>
            <Button variant="secondary" className="text-lg">View Demo →</Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 z-10">
            {[
              { text: "2.4M+", label: "comments analyzed", emoji: "📊" },
              { text: "87%", label: "accuracy", emoji: "🎯" },
              { text: "30", label: "seconds to results", emoji: "⚡" }
            ].map((stat, i) => (
              <Card key={i} className="py-3 px-6 flex items-center gap-3 bg-white">
                <span className="text-2xl">{stat.emoji}</span>
                <div className="text-left leading-tight">
                  <div className="font-heading font-black text-lg">{stat.text}</div>
                  <div className="text-sm font-bold text-gray-500">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <h2 className="font-heading font-black text-4xl md:text-5xl text-center mb-16">
            Everything You Need to Grow 🚀
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card bg="mint" hoverLift className="p-8 text-center flex flex-col items-center">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="font-heading font-bold text-2xl mb-4">Sentiment Analysis</h3>
              <p className="font-medium text-gray-700">Instantly know how your viewers feel. We categorise comments into positive, neutral, and negative vibes.</p>
            </Card>
            <Card bg="yellow" hoverLift className="p-8 text-center flex flex-col items-center">
              <div className="text-6xl mb-6">💡</div>
              <h3 className="font-heading font-bold text-2xl mb-4">Idea Generator</h3>
              <p className="font-medium text-gray-700">Never run out of content ideas. Our AI finds the most requested topics hidden in your comments section.</p>
            </Card>
            <Card bg="blue" hoverLift className="p-8 text-center flex flex-col items-center">
              <div className="text-6xl mb-6">📄</div>
              <h3 className="font-heading font-bold text-2xl mb-4">PDF Reports</h3>
              <p className="font-medium text-gray-700">Download beautiful, comprehensive reports for your sponsors or team with a single click.</p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-white border-y-[3px] border-dark-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-black text-4xl md:text-5xl text-center mb-16">
              Three Steps to Viral Growth ⚡
            </h2>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[3px] bg-dark-border -z-10 border-dashed"></div>
              {[
                { num: "01", title: "Sync Channel", desc: "Connect in one click. We securely fetch your latest videos.", bg: "mint" as const },
                { num: "02", title: "AI Magic", desc: "Our engine scans thousands of comments in seconds.", bg: "yellow" as const },
                { num: "03", title: "Grow", desc: "Get actionable insights and your next viral video idea.", bg: "lavender" as const },
              ].map((step, i) => (
                <Card key={i} bg={step.bg} className="p-8 relative">
                  <div className="text-6xl font-heading font-black text-accent-red/20 absolute top-4 right-6">{step.num}</div>
                  <h3 className="font-heading font-bold text-2xl mb-3 relative z-10">{step.title}</h3>
                  <p className="font-medium text-gray-800 relative z-10">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 bg-white border-y-[3px] border-dark-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-black text-4xl md:text-5xl text-center mb-16">
              Frequently Asked Questions 🤔
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How does Axion AI analyze my YouTube comments?",
                  a: "Our AI uses advanced natural language processing to analyze thousands of comments, identifying sentiment patterns, common questions, and content requests that can inform your next video."
                },
                {
                  q: "Is my YouTube data secure?",
                  a: "Absolutely! We use YouTube's official OAuth 2.0 API with read-only permissions. Your data is encrypted and we never share it with third parties."
                },
                {
                  q: "How accurate is the sentiment analysis?",
                  a: "Our AI achieves 87% accuracy in sentiment analysis, trained on millions of YouTube comments across various niches and languages."
                },
                {
                  q: "Can I use Axion AI for multiple channels?",
                  a: "Yes! Our Agency plan supports up to 10 channels, while the Pro plan supports 5 channels. Free plan is limited to 1 channel."
                },
                {
                  q: "What languages does Axion AI support?",
                  a: "We support 23+ Indian languages including Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, and more, plus English."
                },
                {
                  q: "How quickly do I get results?",
                  a: "Most reports are generated within 30 seconds. For channels with extensive comment history, it may take up to 2 minutes."
                },
                {
                  q: "Can I export my analytics reports?",
                  a: "Yes! Pro and Agency plans allow you to download comprehensive PDF reports perfect for sharing with sponsors or your team."
                },
                {
                  q: "What if I need help getting started?",
                  a: "We offer 24/7 email support, video tutorials, and a Discord community where you can connect with other creators."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border-[2.5px] border-dark-border shadow-[2px_2px_0_#111827]">
                  <h3 className="font-heading font-bold text-xl mb-3 text-dark-border">
                    {faq.q}
                  </h3>
                  <p className="font-medium text-gray-700 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white pt-16 pb-8 px-6 mt-20 rounded-t-[32px] border-t-[3px] border-x-[3px] border-dark-border shadow-[0_-4px_0_rgba(17,24,39,0.1)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-accent-red text-white w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white">
                <Play size={16} fill="currentColor" />
              </div>
              <span className="font-heading font-black text-xl tracking-tight">Axionix AI</span>
            </Link>
            <p className="text-gray-400 font-medium mb-4">Turn Your Comments into Your Next Viral Video.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">𝕏</div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">YT</div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">IG</div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Product</h4>
            <ul className="space-y-2 text-gray-400 font-medium text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Features</li>
              <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-white cursor-pointer transition-colors">Case Studies</li>
              <li className="hover:text-white cursor-pointer transition-colors">Changelog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Company</h4>
            <ul className="space-y-2 text-gray-400 font-medium text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">About</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Legal</h4>
            <ul className="space-y-2 text-gray-400 font-medium text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>© 2024 Axionix AI. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Made by Aashish Tejwani</p>
        </div>
      </footer>
    </div>
  );
}
