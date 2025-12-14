import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  MapPin,
  Eye,
  Quote,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">STROT</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-28 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Welcome to
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mt-2">
            <span className="text-primary">STROT</span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground font-medium">
            Your Community Upliftment Platform
          </p>

          <p className="mt-6 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connecting donors, businesses, and communities through verified donations, employment matching, and skill-building workshops. Every action is transparent, every impact is real.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Start Donating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                I'm a Partner
              </Button>
            </Link>
          </div>

          {/* Community Avatars */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">D</div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 border-2 border-background flex items-center justify-center text-xs font-medium text-blue-600">B</div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-xs font-medium text-emerald-600">CH</div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 border-2 border-background flex items-center justify-center text-xs font-medium text-orange-600">W</div>
              <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">+</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-semibold text-foreground">donors, businesses, and community heads</span> making a difference
            </p>
          </div>
        </div>
      </section>

      {/* Impact Gallery - "Every Action Creates Joy" */}
      <section id="impact" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Our Impact</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Every Action Creates <span className="text-primary">Joy</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              See how donations reach communities, workers find jobs, and skills transform lives.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-2xl bg-card border flex items-center justify-center">
              <div className="text-center p-4">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Donations Delivered</p>
              </div>
            </div>
            <div className="aspect-square rounded-2xl bg-card border flex items-center justify-center">
              <div className="text-center p-4">
                <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Workers Placed</p>
              </div>
            </div>
            <div className="aspect-square rounded-2xl bg-card border flex items-center justify-center">
              <div className="text-center p-4">
                <GraduationCap className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Skills Taught</p>
              </div>
            </div>
            <div className="aspect-square rounded-2xl bg-card border flex items-center justify-center">
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Communities Served</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers That Matter */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">By the Numbers</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Numbers That <span className="text-primary">Matter</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Real metrics, real impact. Every number represents a life touched.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-primary">500+</div>
              <p className="mt-2 text-sm text-muted-foreground">Donations Delivered</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">120+</div>
              <p className="mt-2 text-sm text-muted-foreground">Workers Placed</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-emerald-600">45</div>
              <p className="mt-2 text-sm text-muted-foreground">Workshops Held</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-orange-600">12</div>
              <p className="mt-2 text-sm text-muted-foreground">Communities Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple Steps to Make a <span className="text-primary">Difference</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              No complicated processes. Just three steps to create real impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Share Your Resources</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                List items you want to donate—food, clothes, essentials. Add photos and details. It takes less than 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-5">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Locally</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A verified Community Head in your area claims the donation and coordinates pickup or delivery to those in need.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Your Impact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive proof photos when your donation is delivered. See exactly where your contribution went and who it helped.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Voices / Testimonials */}
      <section id="community" className="py-20 px-6 bg-foreground text-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-background/60 uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Voices from Our <span className="text-primary">Community</span>
            </h2>
            <p className="mt-3 text-background/70 max-w-xl mx-auto">
              Real people, real stories. Hear from donors, businesses, and community heads.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-background/5 border border-background/10 p-6">
              <Quote className="h-6 w-6 text-primary mb-4" />
              <p className="text-sm text-background/80 leading-relaxed mb-6">
                "I finally know my donations are reaching real people. The proof photos give me confidence that my contribution matters."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">R</div>
                <div>
                  <p className="text-sm font-medium">Rahul M.</p>
                  <p className="text-xs text-background/60">Donor, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-background/5 border border-background/10 p-6">
              <Quote className="h-6 w-6 text-blue-400 mb-4" />
              <p className="text-sm text-background/80 leading-relaxed mb-6">
                "Hiring through STROT is faster and more reliable. The workers are pre-verified and the process is completely transparent."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">P</div>
                <div>
                  <p className="text-sm font-medium">Priya S.</p>
                  <p className="text-xs text-background/60">Business Owner, Delhi</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-background/5 border border-background/10 p-6">
              <Quote className="h-6 w-6 text-emerald-400 mb-4" />
              <p className="text-sm text-background/80 leading-relaxed mb-6">
                "As a Community Head, I can finally coordinate help efficiently. The platform keeps everything organized and accountable."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-medium text-emerald-400">A</div>
                <div>
                  <p className="text-sm font-medium">Amit K.</p>
                  <p className="text-xs text-background/60">Community Head, Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Join the Movement</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Change Lives<br />
            <span className="text-primary">One Action at a Time?</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Whether you're a donor, a business, or a community leader—there's a place for you on STROT. Start making a difference today.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Join the Community <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">STROT</span>
              <span className="text-sm text-muted-foreground">— Bal · Buddhi · Vidya</span>
            </div>
            <div className="flex gap-8">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© 2025 STROT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
