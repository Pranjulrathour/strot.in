import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  Percent,
  Building2,
  Handshake,
  Megaphone,
  ShieldCheck,
  Lock,
  Menu,
  X,
} from "lucide-react";

// STROT Logo SVG Component
const StrotLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 10 A40 40 0 1 1 50 90" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M50 25 A25 25 0 1 1 50 75" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5"/>
    <rect x="48" y="10" width="8" height="80" fill="currentColor" rx="4"/>
  </svg>
);

// Geometric Corner Decoration
const GeoCorner = ({ dark = false }: { dark?: boolean }) => (
  <div className={`absolute -top-4 -right-4 w-28 h-28 opacity-40 pointer-events-none ${dark ? 'text-white/20' : 'text-strot-black/20'}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M50 10 A40 40 0 1 1 50 90" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M50 22 A28 28 0 1 1 50 78" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.55"/>
      <rect x="46" y="10" width="8" height="80" fill="currentColor" rx="4" opacity="0.3"/>
    </svg>
  </div>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-strot-offwhite text-strot-black antialiased font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 flex justify-between items-center shadow-sm">
          <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3">
            <StrotLogo className="w-8 h-8 text-strot-black" />
            <span className="tracking-wider">STROT</span>
          </Link>
          
          <div className="hidden lg:flex gap-8 items-center">
            <a href="#modules" className="text-sm font-medium text-strot-black/70 hover:text-strot-black transition-colors">Modules</a>
            <a href="#donor" className="text-sm font-medium text-strot-black/70 hover:text-strot-black transition-colors">Donor</a>
            <a href="#business" className="text-sm font-medium text-strot-black/70 hover:text-strot-black transition-colors">Business</a>
            <a href="#community-head" className="text-sm font-medium text-strot-black/70 hover:text-strot-black transition-colors">Community Head</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-5 py-2.5 bg-strot-black text-white rounded-full text-sm font-medium hover:bg-strot-black/90 transition-all">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col gap-3">
              <a href="#modules" className="text-sm font-medium p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Modules</a>
              <a href="#donor" className="text-sm font-medium p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Donor</a>
              <a href="#business" className="text-sm font-medium p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Business</a>
              <a href="#community-head" className="text-sm font-medium p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Community Head</a>
              <Link href="/login" className="text-sm font-medium p-2 hover:bg-slate-100 rounded-lg">Login</Link>
              <Link href="/register" className="text-sm font-medium p-3 bg-strot-black text-white rounded-lg text-center mt-2">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 md:pt-40 pb-16 md:pb-20 px-6 overflow-hidden bg-strot-offwhite">
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-strot-black/5 text-strot-black text-xs font-semibold uppercase tracking-wider mb-8 border border-strot-black/10">
            <span className="w-2 h-2 rounded-full bg-strot-black"></span>
            System-Driven Transformation
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-strot-black">
            Breaking the Cycle of Generational Poverty
          </h1>

          <p className="text-lg md:text-xl text-strot-black/60 leading-relaxed mb-4 max-w-2xl mx-auto">
            Not just food. Not just jobs. A system for long-term transformation.
          </p>

          <p className="text-base font-semibold text-strot-black/80 tracking-wide mb-10">
            Survive → Earn → Evolve
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="px-8 py-4 h-auto bg-strot-black text-white rounded-full text-base font-medium hover:bg-strot-black/90 transition-all">
                Join the Step Forward
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules" className="px-8 py-4 bg-transparent border-2 border-strot-black/20 text-strot-black rounded-full text-base font-medium hover:border-strot-black/40 transition-all text-center">
              Partner With STROT
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full mt-10 md:mt-14 relative z-10">
          <div className="relative w-full h-[50vh] md:h-[65vh] max-h-[700px] min-h-[400px] bg-strot-black rounded-3xl overflow-hidden mx-auto max-w-7xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <StrotLogo className="w-40 h-40 md:w-56 md:h-56 text-white/10" />
            </div>
            <div className="absolute bottom-8 left-8 right-8 text-white/80">
              <p className="text-sm md:text-base font-medium">Connecting communities through verified impact</p>
            </div>
          </div>
        </div>
      </header>

      {/* Modules Section */}
      <section id="modules" className="py-20 md:py-28 px-6 bg-white relative overflow-hidden">
        <GeoCorner />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-strot-black/40 uppercase tracking-widest mb-4">The Three Modules</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">BAL. BUDDHI. VIDYA.</h2>
            <p className="text-lg text-strot-black/60 leading-relaxed">
              A simple structure: support survival, enable earnings, and build long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* BAL Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-bal-orange">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <StrotLogo className="w-48 h-48 text-white" />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  BAL
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-strot-black">BAL</div>
                  <div className="text-base text-strot-black/60">Basic Necessities</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* BUDDHI Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-buddhi-green">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <StrotLogo className="w-48 h-48 text-white" />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  BUDDHI
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-strot-black">BUDDHI</div>
                  <div className="text-base text-strot-black/60">Employment Engine</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* VIDYA Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-vidya-blue">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <StrotLogo className="w-48 h-48 text-white" />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  VIDYA
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-strot-black">VIDYA</div>
                  <div className="text-base text-strot-black/60">Education & Upskilling</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 bg-strot-offwhite rounded-3xl border border-strot-black/10 shadow-sm px-6 py-10 md:px-12">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-strot-black">500+</div>
                <div className="mt-2 text-sm md:text-base text-strot-black/50 font-medium">Donations</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-strot-black">120+</div>
                <div className="mt-2 text-sm md:text-base text-strot-black/50 font-medium">Jobs Matched</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-strot-black">45</div>
                <div className="mt-2 text-sm md:text-base text-strot-black/50 font-medium">Workshops</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Showcase */}
      <section id="donor" className="py-20 md:py-28 px-6 bg-strot-offwhite relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white rounded-3xl border border-slate-200/60 shadow-sm px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <GeoCorner />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-strot-black/40 uppercase tracking-widest mb-4">Donor Dashboard</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">Track every donation — end to end</h2>
                <p className="text-lg text-strot-black/60 leading-relaxed mb-8">
                  A single view to list items, monitor pickup and delivery status, and keep an auditable history of impact.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-slate-200/60">
                    <div className="text-sm font-semibold">Status tracking</div>
                    <div className="text-sm text-strot-black/60 mt-1">Pending, in progress, delivered.</div>
                  </div>
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-slate-200/60">
                    <div className="text-sm font-semibold">Recent donations</div>
                    <div className="text-sm text-strot-black/60 mt-1">Clear history with proof-of-delivery.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-strot-black text-white rounded-full text-sm font-medium hover:bg-strot-black/90">
                      Start Donating <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-strot-offwhite rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-bal-orange/20 to-bal-orange/5 flex items-center justify-center">
                  <Heart className="w-20 h-20 text-bal-orange/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Showcase */}
      <section id="business" className="py-20 md:py-28 px-6 bg-strot-offwhite relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white rounded-3xl border border-slate-200/60 shadow-sm px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <GeoCorner />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="bg-strot-offwhite rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden lg:order-1">
                <div className="aspect-[4/3] bg-gradient-to-br from-buddhi-green/20 to-buddhi-green/5 flex items-center justify-center">
                  <Briefcase className="w-20 h-20 text-buddhi-green/40" />
                </div>
              </div>
              <div className="lg:order-2">
                <p className="text-sm font-semibold text-strot-black/40 uppercase tracking-widest mb-4">Business Portal</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">Hire faster with verified matches</h2>
                <p className="text-lg text-strot-black/60 leading-relaxed mb-8">
                  Post jobs, review worker matches, and track openings from one dashboard — with a clear hiring process guided by Community Heads.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-strot-black/10">
                    <div className="text-sm font-semibold">Jobs & positions</div>
                    <div className="text-sm text-strot-black/60 mt-1">Total jobs, open roles, filled positions.</div>
                  </div>
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-strot-black/10">
                    <div className="text-sm font-semibold">Worker matches</div>
                    <div className="text-sm text-strot-black/60 mt-1">Review profiles and confirm hires.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-strot-black text-white rounded-full text-sm font-medium hover:bg-strot-black/90">
                      Post a Job <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Head Showcase */}
      <section id="community-head" className="py-20 md:py-28 px-6 bg-strot-offwhite relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white rounded-3xl border border-slate-200/60 shadow-sm px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <GeoCorner />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-strot-black/40 uppercase tracking-widest mb-4">Community Head Dashboard</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">Operate the system on the ground</h2>
                <p className="text-lg text-strot-black/60 leading-relaxed mb-8">
                  Manage donations, allocate jobs, track available workers, and schedule workshops — with clear actions and accountability.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-slate-200/60">
                    <div className="text-sm font-semibold">Allocation controls</div>
                    <div className="text-sm text-strot-black/60 mt-1">Add workers and allocate jobs.</div>
                  </div>
                  <div className="p-5 bg-strot-offwhite rounded-2xl border border-slate-200/60">
                    <div className="text-sm font-semibold">Operational visibility</div>
                    <div className="text-sm text-strot-black/60 mt-1">Pending donations, open jobs, workshops.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-strot-black text-white rounded-full text-sm font-medium hover:bg-strot-black/90">
                      Become a Community Head <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-strot-offwhite rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-vidya-blue/20 to-vidya-blue/5 flex items-center justify-center">
                  <Users className="w-20 h-20 text-vidya-blue/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 md:py-28 px-6 bg-white relative overflow-hidden">
        <GeoCorner />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">Ethical. Sustainable. Scalable.</h2>
            <p className="text-lg text-strot-black/60 leading-relaxed">
              Revenue supports operations and scale while keeping incentives aligned with outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-strot-offwhite rounded-2xl border border-strot-black/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-strot-black/5 rounded-xl flex items-center justify-center mb-6">
                <Percent className="w-6 h-6 text-strot-black/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Employment commissions</h3>
              <p className="text-strot-black/60 text-sm leading-relaxed">
                A small commission on successful placements through BUDDHI.
              </p>
            </div>

            <div className="p-8 bg-strot-offwhite rounded-2xl border border-strot-black/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-strot-black/5 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-strot-black/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business subscriptions</h3>
              <p className="text-strot-black/60 text-sm leading-relaxed">
                Paid access for businesses to verified talent pools and workflow tools.
              </p>
            </div>

            <div className="p-8 bg-strot-offwhite rounded-2xl border border-strot-black/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-strot-black/5 rounded-xl flex items-center justify-center mb-6">
                <Handshake className="w-6 h-6 text-strot-black/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Brand partnerships</h3>
              <p className="text-strot-black/60 text-sm leading-relaxed">
                Partnerships aligned with the mission and community needs.
              </p>
            </div>

            <div className="p-8 bg-strot-offwhite rounded-2xl border border-strot-black/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-strot-black/5 rounded-xl flex items-center justify-center mb-6">
                <Megaphone className="w-6 h-6 text-strot-black/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ads</h3>
              <p className="text-strot-black/60 text-sm leading-relaxed">
                Limited, relevant promotions with quality and safety controls.
              </p>
            </div>

            <div className="p-8 bg-strot-offwhite rounded-2xl border border-strot-black/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 lg:col-span-2">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-strot-black/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-strot-black/70" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">CSR (non-profit only)</h3>
                  <p className="text-strot-black/60 text-sm leading-relaxed mb-4">
                    CSR funds support VIDYA programs with transparent tracking. Allocation remains strictly non-profit.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-strot-black/70 border border-slate-200/60">
                    <Lock className="w-3 h-3" />
                    Non-profit allocation only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-6 bg-strot-black text-white relative overflow-hidden">
        <GeoCorner dark />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build the Step Forward With Us
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Join us in building infrastructure that transforms lives — as a partner, investor, or supporter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button className="px-10 py-4 h-auto bg-white text-strot-black rounded-full text-base font-semibold hover:bg-white/90 transition-all">
                Become a Partner
              </Button>
            </Link>
            <a href="#modules" className="px-10 py-4 bg-transparent border-2 border-white/30 text-white rounded-full text-base font-medium hover:border-white/50 transition-all text-center">
              Support the Mission
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-20 px-6 bg-strot-offwhite">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm px-8 py-12 md:px-16 md:py-16 text-center">
            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-snug text-strot-black">
              "STROT brings clarity and accountability to impact — it feels like infrastructure, not a campaign."
            </p>
            <p className="mt-6 text-base md:text-lg text-strot-black/50 font-medium">— A partner</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-strot-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <StrotLogo className="w-7 h-7 text-white" />
              <span className="text-white font-bold tracking-wider">STROT</span>
              <span className="text-white/30 text-sm ml-2">© 2025</span>
            </div>
            
            <p className="text-white/40 text-sm">A Step Forward.</p>
            
            <div className="flex gap-6">
              <Link href="/login" className="text-white/40 hover:text-white transition-colors text-sm">Login</Link>
              <Link href="/register" className="text-white/40 hover:text-white transition-colors text-sm">Register</Link>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
