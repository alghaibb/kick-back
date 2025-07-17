import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Calendar, Clock, Smartphone } from "lucide-react";
import Link from "next/link";

export default function HeroMobile() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center gap-8 md:gap-12 px-4 py-16 md:py-24">
        <div className="space-y-4 md:space-y-6">
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary backdrop-blur-sm px-4 md:px-6 py-2 text-sm font-medium"
          >
            <Bell className="w-4 h-4 mr-2" />
            Never miss another event
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-clip-text">Stay</span>

            <div className="h-[56px] md:h-[88px] lg:h-[96px] flex justify-center items-center">
              <span className="text-primary font-bold">organized</span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-normal">
              <span className="bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                with Kick Back
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get intelligent reminders for every important moment in your life.
            Smart scheduling, perfect timing, never miss what matters most.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Smart Scheduling</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Perfect Timing</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Email & SMS</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full max-w-md">
          <div className="flex-1">
            <Button asChild size="lg" className="w-full">
              <Link href="/create-account">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="flex-1">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-border hover:bg-muted"
            >
              <Link href="/learn-more">See How It Works</Link>
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground/70">
          Join thousands of organized people worldwide • No credit card required
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
