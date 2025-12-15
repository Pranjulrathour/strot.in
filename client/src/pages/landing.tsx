import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Heart,
  Percent,
  Building2,
  Handshake,
  Megaphone,
  ShieldCheck,
  Lock,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const heroImage = "/hero.png";
const logoImage = "/logo.png";
const balImage = "/bal.png";
const buddhiImage = "/buddhi.png";
const vidyaImage = "/vidya.png";
const communityHeadDashboardImage = "/dashboard-community-head.png";
const businessDashboardImage = "/dashboard-business.png";
const userDashboardImage = "/dashboard-user.png";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-black/50">
          <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3">
            <img src={logoImage} alt="STROT" className="w-8 h-8" />
            <span className="tracking-wider bg-gradient-to-r from-white to-white/80 bg-clip-text">STROT</span>
          </Link>
          
          <div className="hidden lg:flex gap-8 items-center">
            <a href="#modules" className="text-sm font-medium text-white/60 hover:text-bal-orange transition-colors">Modules</a>
            <a href="#donor" className="text-sm font-medium text-white/60 hover:text-bal-orange transition-colors">Donor</a>
            <a href="#business" className="text-sm font-medium text-white/60 hover:text-buddhi-green transition-colors">Business</a>
            <a href="#community-head" className="text-sm font-medium text-white/60 hover:text-vidya-blue transition-colors">Community Head</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-5 py-2.5 bg-bal-orange text-white rounded-full text-sm font-semibold hover:bg-bal-orange/90 transition-all shadow-lg shadow-bal-orange/25">
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
          <div className="lg:hidden mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col gap-3">
              <a href="#modules" className="text-sm font-medium p-3 hover:bg-white/5 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Modules</a>
              <a href="#donor" className="text-sm font-medium p-3 hover:bg-bal-orange/10 hover:text-bal-orange rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Donor</a>
              <a href="#business" className="text-sm font-medium p-3 hover:bg-buddhi-green/10 hover:text-buddhi-green rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Business</a>
              <a href="#community-head" className="text-sm font-medium p-3 hover:bg-vidya-blue/10 hover:text-vidya-blue rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>Community Head</a>
              <Link href="/login" className="text-sm font-medium p-3 hover:bg-white/5 rounded-xl transition-colors">Login</Link>
              <Link href="/register" className="text-sm font-medium p-3 bg-bal-orange text-white rounded-xl text-center mt-2 shadow-lg shadow-bal-orange/25">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 md:pt-40 pb-12 md:pb-16 px-6 overflow-hidden bg-[#0a0a0a]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-bal-orange/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-bal-orange" />
            System-Driven Transformation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Breaking the Cycle of
            <br />
            Generational Poverty
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-white/70 text-base md:text-lg font-medium">
            <span>Survive</span>
            <span className="text-white/30">→</span>
            <span className="px-4 py-1.5 rounded-full bg-bal-orange/10 border border-bal-orange/30 text-bal-orange text-sm font-bold">BAL</span>
            <span className="px-4 py-1.5 rounded-full bg-buddhi-green/10 border border-buddhi-green/30 text-buddhi-green text-sm font-bold">BUDDHI</span>
            <span className="px-4 py-1.5 rounded-full bg-vidya-blue/10 border border-vidya-blue/30 text-vidya-blue text-sm font-bold">VIDYA</span>
            <span className="text-white/30">→</span>
            <span>Evolve</span>
          </div>

          <p className="mt-6 text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Not just food. Not just jobs.
            <br className="hidden sm:block" />
            A system for long-term transformation.
          </p>

          <div className="mt-6 md:mt-8 w-full flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-t from-bal-orange/20 via-transparent to-transparent blur-2xl opacity-50 pointer-events-none" />
              <img
                src={heroImage}
                alt="STROT community"
                className="relative z-10 block w-full max-w-5xl h-auto drop-shadow-2xl -translate-y-6 md:-translate-y-40"
                loading="eager"
              />
            </div>
          </div>

          <div className="mt-2 md:mt-0 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="px-8 py-4 h-auto bg-bal-orange text-white rounded-full text-base font-semibold hover:bg-bal-orange/90 transition-all shadow-xl shadow-bal-orange/30">
                Join the Step Forward
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules" className="px-8 py-4 bg-white/5 border border-white/15 text-white rounded-full text-base font-medium hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm">
              Partner With STROT
            </a>
          </div>
        </div>
      </header>

      {/* Modules Section */}
      <section id="modules" className="py-20 md:py-28 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">The Three Modules</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
              <span className="text-bal-orange">BAL</span>. <span className="text-buddhi-green">BUDDHI</span>. <span className="text-vidya-blue">VIDYA</span>.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              A simple structure: support survival, enable earnings, and build long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* BAL Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[480px] bg-black border border-bal-orange/20 hover:border-bal-orange/40 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center bg-bal-orange/5">
                  <img
                    src={balImage}
                    alt="BAL"
                    className="w-full h-full object-contain p-8"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="text-bal-orange text-xs font-bold uppercase tracking-widest mb-2">Basic Necessities</div>
                  <div className="text-2xl font-bold text-white">BAL</div>
                  <p className="text-white/60 text-sm mt-2">Food, essentials & emergency support for immediate survival needs.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-bal-orange/20 text-bal-orange flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </span>
                  <span className="text-white/70 text-sm font-medium">Donations</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-bal-orange group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* BUDDHI Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[480px] bg-black border border-buddhi-green/20 hover:border-buddhi-green/40 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center bg-buddhi-green/5">
                  <img
                    src={buddhiImage}
                    alt="BUDDHI"
                    className="w-full h-full object-contain p-8"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="text-buddhi-green text-xs font-bold uppercase tracking-widest mb-2">Employment Engine</div>
                  <div className="text-2xl font-bold text-white">BUDDHI</div>
                  <p className="text-white/60 text-sm mt-2">Job matching & placement connecting workers with local businesses.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-buddhi-green/20 text-buddhi-green flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <span className="text-white/70 text-sm font-medium">Employment</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-buddhi-green group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* VIDYA Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[480px] bg-black border border-vidya-blue/20 hover:border-vidya-blue/40 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center bg-vidya-blue/5">
                  <img
                    src={vidyaImage}
                    alt="VIDYA"
                    className="w-full h-full object-contain p-8"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="text-vidya-blue text-xs font-bold uppercase tracking-widest mb-2">Education & Upskilling</div>
                  <div className="text-2xl font-bold text-white">VIDYA</div>
                  <p className="text-white/60 text-sm mt-2">Skill workshops & training for sustainable long-term growth.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-vidya-blue/20 text-vidya-blue flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </span>
                  <span className="text-white/70 text-sm font-medium">Workshops</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-vidya-blue group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 bg-white/[0.02] rounded-2xl border border-white/10 px-6 py-10 md:px-12">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-bal-orange">500+</div>
                <div className="mt-2 text-sm md:text-base text-white/50 font-medium">Donations</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-buddhi-green">120+</div>
                <div className="mt-2 text-sm md:text-base text-white/50 font-medium">Jobs Matched</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-vidya-blue">45</div>
                <div className="mt-2 text-sm md:text-base text-white/50 font-medium">Workshops</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Showcase */}
      <section id="donor" className="py-20 md:py-28 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-bal-orange/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black/50 rounded-3xl border border-bal-orange/20 px-6 py-10 md:px-12 md:py-14 overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bal-orange/10 border border-bal-orange/20 text-bal-orange text-xs font-semibold uppercase tracking-wider mb-6">
                  <Heart className="w-3.5 h-3.5" />
                  Donor Dashboard
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Track every donation — end to end</h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  A single view to list items, monitor pickup and delivery status, and keep an auditable history of impact.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black/60 rounded-2xl border border-bal-orange/10 hover:border-bal-orange/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Status tracking</div>
                    <div className="text-sm text-white/60 mt-1">Pending, in progress, delivered.</div>
                  </div>
                  <div className="p-5 bg-black/60 rounded-2xl border border-bal-orange/10 hover:border-bal-orange/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Recent donations</div>
                    <div className="text-sm text-white/60 mt-1">Clear history with proof-of-delivery.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-bal-orange text-white rounded-full text-sm font-semibold hover:bg-bal-orange/90 shadow-lg shadow-bal-orange/25">
                      Start Donating <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src={userDashboardImage}
                  alt="User dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Showcase */}
      <section id="business" className="py-20 md:py-28 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-buddhi-green/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black/50 rounded-3xl border border-buddhi-green/20 px-6 py-10 md:px-12 md:py-14 overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl lg:order-1">
                <img
                  src={businessDashboardImage}
                  alt="Business dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-buddhi-green/10 border border-buddhi-green/20 text-buddhi-green text-xs font-semibold uppercase tracking-wider mb-6">
                  <Briefcase className="w-3.5 h-3.5" />
                  Business Portal
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Hire faster with verified matches</h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  Post jobs, review worker matches, and track openings from one dashboard — with a clear hiring process guided by Community Heads.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black/60 rounded-2xl border border-buddhi-green/10 hover:border-buddhi-green/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Jobs & positions</div>
                    <div className="text-sm text-white/60 mt-1">Total jobs, open roles, filled positions.</div>
                  </div>
                  <div className="p-5 bg-black/60 rounded-2xl border border-buddhi-green/10 hover:border-buddhi-green/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Worker matches</div>
                    <div className="text-sm text-white/60 mt-1">Review profiles and confirm hires.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-buddhi-green text-white rounded-full text-sm font-semibold hover:bg-buddhi-green/90 shadow-lg shadow-buddhi-green/25">
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
      <section id="community-head" className="py-20 md:py-28 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-vidya-blue/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black/50 rounded-3xl border border-vidya-blue/20 px-6 py-10 md:px-12 md:py-14 overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vidya-blue/10 border border-vidya-blue/20 text-vidya-blue text-xs font-semibold uppercase tracking-wider mb-6">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Community Head Dashboard
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Operate the system on the ground</h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  Manage donations, allocate jobs, track available workers, and schedule workshops — with clear actions and accountability.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black/60 rounded-2xl border border-vidya-blue/10 hover:border-vidya-blue/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Allocation controls</div>
                    <div className="text-sm text-white/60 mt-1">Add workers and allocate jobs.</div>
                  </div>
                  <div className="p-5 bg-black/60 rounded-2xl border border-vidya-blue/10 hover:border-vidya-blue/30 transition-colors">
                    <div className="text-sm font-semibold text-white">Operational visibility</div>
                    <div className="text-sm text-white/60 mt-1">Pending donations, open jobs, workshops.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-vidya-blue text-white rounded-full text-sm font-semibold hover:bg-vidya-blue/90 shadow-lg shadow-vidya-blue/25">
                      Become a Community Head <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src={communityHeadDashboardImage}
                  alt="Community Head dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 md:py-28 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Revenue Model</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Ethical. Sustainable. Scalable.</h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Revenue supports operations and scale while keeping incentives aligned with outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-8 bg-black/40 rounded-2xl border border-white/10 hover:border-buddhi-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-buddhi-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-buddhi-green/20 transition-colors">
                <Percent className="w-6 h-6 text-buddhi-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Employment commissions</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                A small commission on successful placements through BUDDHI.
              </p>
            </div>

            <div className="group p-8 bg-black/40 rounded-2xl border border-white/10 hover:border-buddhi-green/30 transition-all duration-300">
              <div className="w-12 h-12 bg-buddhi-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-buddhi-green/20 transition-colors">
                <Building2 className="w-6 h-6 text-buddhi-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Business subscriptions</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Paid access for businesses to verified talent pools and workflow tools.
              </p>
            </div>

            <div className="group p-8 bg-black/40 rounded-2xl border border-white/10 hover:border-bal-orange/30 transition-all duration-300">
              <div className="w-12 h-12 bg-bal-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-bal-orange/20 transition-colors">
                <Handshake className="w-6 h-6 text-bal-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Brand partnerships</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Partnerships aligned with the mission and community needs.
              </p>
            </div>

            <div className="group p-8 bg-black/40 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                <Megaphone className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Ads</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Limited, relevant promotions with quality and safety controls.
              </p>
            </div>

            <div className="group p-8 bg-black/40 rounded-2xl border border-white/10 hover:border-vidya-blue/30 transition-all duration-300 lg:col-span-2">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-vidya-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-vidya-blue/20 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-vidya-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-white">CSR (non-profit only)</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    CSR funds support VIDYA programs with transparent tracking. Allocation remains strictly non-profit.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-vidya-blue/10 rounded-full text-xs font-medium text-vidya-blue border border-vidya-blue/20">
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
      <section className="py-24 md:py-32 px-6 bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bal-orange/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bal-orange to-buddhi-green">
                Step Forward
              </span>{" "}
              With Us
            </h2>
            <p className="text-lg text-white/50 leading-relaxed">
              Join us in building infrastructure that transforms lives — as a partner, investor, or supporter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="px-10 py-4 h-auto bg-bal-orange text-white rounded-full text-base font-semibold hover:bg-bal-orange/90 transition-all shadow-xl shadow-bal-orange/30">
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules" className="px-10 py-4 bg-white/5 border border-white/15 text-white rounded-full text-base font-medium hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm">
              Support the Mission
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-black/50 rounded-3xl border border-white/10 px-8 py-12 md:px-16 md:py-16 text-center overflow-hidden">
            <div className="absolute top-4 left-8 text-bal-orange/20 text-8xl font-serif">"</div>
            <p className="relative z-10 text-xl md:text-2xl lg:text-3xl font-medium tracking-tight leading-relaxed text-white/90">
              STROT brings clarity and accountability to impact — it feels like infrastructure, not a campaign.
            </p>
            <p className="mt-8 text-sm md:text-base text-white/50 font-medium">— A partner</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="STROT" className="w-7 h-7" />
              <span className="text-white font-bold tracking-wider">STROT</span>
              <span className="text-white/30 text-sm ml-2">© 2025</span>
            </div>
            
            <p className="text-white/40 text-sm italic">A Step Forward.</p>
            
            <div className="flex gap-6">
              <Link href="/login" className="text-white/40 hover:text-bal-orange transition-colors text-sm">Login</Link>
              <Link href="/register" className="text-white/40 hover:text-bal-orange transition-colors text-sm">Register</Link>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
