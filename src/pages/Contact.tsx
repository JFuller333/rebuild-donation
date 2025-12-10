import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-primary">Contact Us</p>
          <h1 className="text-4xl font-bold">We&apos;d love to hear from you</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you have a question, want to get involved, or need support with a donation,
            the Rebuild Tuskegee team is ready to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <p>build@letsrebuildtuskegee.org</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Office Hours</p>
                <p>Monday - Friday · 9am - 5pm CST</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  window.location.href = "mailto:build@letsrebuildtuskegee.org";
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={4} placeholder="How can we help?" required />
                </div>
                <Button type="submit" className="w-full">
                  Contact Us
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;

