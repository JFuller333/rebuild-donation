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
      <div className="container mx-auto px-4 py-2 md:py-2.5 max-w-6xl">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 -ml-2 px-2 text-xs text-muted-foreground shrink-0"
                  onClick={() => navigate("/shop")}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Back
                </Button>
                <span className="text-muted-foreground/50 hidden sm:inline" aria-hidden>
                  |
                </span>
              </>
            ) : null}
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary truncate">
              {apparelProductPageCopy.eyebrow}
            </p>
          </div>
          {apparelProductPageCopy.shopProcessSteps.length > 0 ? (
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] leading-tight pl-0 list-none m-0 sm:justify-end">
              {apparelProductPageCopy.shopProcessSteps.map((item, index) => (
                <li key={item.step} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <span className="text-muted-foreground/40 select-none px-0.5" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span className="inline-flex min-h-5 items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold leading-none text-primary whitespace-nowrap">
                    Step {item.step}
                  </span>
                  <span className="text-muted-foreground">{item.label}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </div>
  );
}
