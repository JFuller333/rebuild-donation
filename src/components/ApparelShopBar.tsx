import { Button } from "@/components/ui/button";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type ApparelShopBarProps = {
  /** Show a compact “Back” control (product detail → shop). */
  showBack?: boolean;
};

const stepLinkClass =
  "group rounded-lg outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary/20";

export function ApparelShopBar({ showBack = false }: ApparelShopBarProps) {
  const navigate = useNavigate();
  const steps = apparelProductPageCopy.shopProcessSteps;

  return (
    <div className="border-b border-border bg-secondary/20">
      <div className="relative mx-auto max-w-6xl px-4 py-4 md:py-5">
        {showBack ? (
          <div className="absolute left-4 top-4 z-10 md:top-5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => navigate("/shop")}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col items-center gap-4 text-center",
            showBack && "md:pl-[4.25rem] lg:pl-[4.5rem]"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
            {apparelProductPageCopy.eyebrow}
          </p>

          {steps.length > 0 ? (
            <>
              {/* Mobile: vertical timeline */}
              <ol className="w-full max-w-md list-none space-y-0 pl-0 text-left md:hidden">
                {steps.map((item, index) => (
                  <li key={item.step}>
                    <Link
                      to={item.to}
                      className={cn(
                        stepLinkClass,
                        "-m-1 flex gap-3 p-1 pb-7 last:pb-1",
                        "text-muted-foreground hover:text-foreground"
                      )}
                      aria-label={`Step ${item.step}: ${item.label}`}
                    >
                      <span className="flex w-10 shrink-0 flex-col items-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary shadow-md ring-2 ring-secondary/40 transition group-hover:border-primary group-hover:ring-primary/20">
                          <span className="sr-only">Step {item.step}</span>
                          <span aria-hidden>{item.step}</span>
                        </span>
                        {index < steps.length - 1 ? (
                          <span
                            className="my-1 min-h-[1.25rem] w-px flex-1 bg-gradient-to-b from-primary/45 to-primary/25"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 pt-1.5 text-sm font-medium leading-snug group-hover:text-foreground">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              {/* Desktop: horizontal timeline */}
              <ol className="hidden w-full max-w-5xl list-none flex-row items-start gap-0 pl-0 md:flex">
                {steps.map((item, index) => {
                  const last = index === steps.length - 1;
                  return (
                    <li key={item.step} className="flex min-w-0 flex-1 flex-col items-stretch">
                      <Link
                        to={item.to}
                        className={cn(
                          stepLinkClass,
                          "flex flex-col items-center gap-3 p-1 text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={`Step ${item.step}: ${item.label}`}
                      >
                        <span className="flex w-full items-center">
                          <span
                            className={cn(
                              "h-0.5 flex-1 rounded-full",
                              index === 0 ? "bg-transparent" : "bg-gradient-to-r from-primary/20 to-primary/35"
                            )}
                            aria-hidden
                          />
                          <span className="mx-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-base font-bold text-primary shadow-md ring-4 ring-secondary/30 transition group-hover:border-primary group-hover:bg-primary/15 group-hover:ring-primary/15">
                            <span className="sr-only">Step {item.step}</span>
                            <span aria-hidden>{item.step}</span>
                          </span>
                          <span
                            className={cn(
                              "h-0.5 flex-1 rounded-full",
                              last ? "bg-transparent" : "bg-gradient-to-r from-primary/35 to-primary/20"
                            )}
                            aria-hidden
                          />
                        </span>
                        <span className="max-w-[14rem] px-1 text-center text-sm font-medium leading-snug group-hover:text-foreground">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
