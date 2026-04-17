import { Button } from "@/components/ui/button";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ApparelShopBarProps = {
  /** Show a compact “Back” control (product detail → shop). */
  showBack?: boolean;
};

export function ApparelShopBar({ showBack = false }: ApparelShopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b border-border bg-secondary/20">
      <div className="relative mx-auto max-w-6xl px-4 py-2.5 md:py-2">
        {showBack ? (
          <div className="absolute left-4 top-2.5 md:top-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground"
              onClick={() => navigate("/shop")}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 text-center md:flex-row md:flex-nowrap md:gap-2.5",
            showBack && "md:pl-[4.25rem]"
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary md:shrink-0 md:text-[11px] px-6 md:px-0">
            {apparelProductPageCopy.eyebrow}
          </p>

          {apparelProductPageCopy.shopProcessSteps.length > 0 ? (
            <>
              <span className="hidden md:inline text-muted-foreground/25 select-none" aria-hidden>
                |
              </span>
              <ol className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 text-[10px] leading-tight pl-0 list-none m-0 sm:text-[11px] md:flex-nowrap md:gap-x-1 md:text-[11px] md:leading-tight">
                {apparelProductPageCopy.shopProcessSteps.map((item, index) => (
                  <li key={item.step} className="flex items-center gap-1 sm:gap-1.5">
                    {index > 0 ? (
                      <span className="text-muted-foreground/30 select-none px-0.5 md:text-[10px]" aria-hidden>
                        ·
                      </span>
                    ) : null}
                    <span className="inline-flex h-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[9px] font-bold text-primary whitespace-nowrap sm:text-[10px] md:h-5 md:px-2 md:text-[10px]">
                      Step {item.step}
                    </span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
