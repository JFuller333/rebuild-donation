import { Button } from "@/components/ui/button";
import { apparelProductPageCopy } from "@/config/apparel-product-page";
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
      <div className="relative mx-auto max-w-6xl px-4 py-4 md:py-5">
        {showBack ? (
          <div className="absolute left-4 top-4 md:top-5 z-10">
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

        <div className="flex flex-col items-center text-center gap-3 md:gap-4">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary px-8 sm:px-12">
            {apparelProductPageCopy.eyebrow}
          </p>
          {apparelProductPageCopy.shopProcessSteps.length > 0 ? (
            <ol className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-2 text-sm sm:text-base md:text-lg leading-snug pl-0 list-none m-0 max-w-4xl">
              {apparelProductPageCopy.shopProcessSteps.map((item, index) => (
                <li key={item.step} className="flex items-center gap-2 sm:gap-2.5">
                  {index > 0 ? (
                    <span className="text-muted-foreground/35 select-none text-lg sm:text-xl px-0.5" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span className="inline-flex min-h-7 sm:min-h-8 items-center justify-center rounded-full bg-primary/15 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                    Step {item.step}
                  </span>
                  <span className="text-muted-foreground font-medium">{item.label}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </div>
  );
}
