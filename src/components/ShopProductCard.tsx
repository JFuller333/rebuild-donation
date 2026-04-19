import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

type ShopProductCardProps = {
  id: string;
  title: string;
  categoryLabel: string;
  image: string;
  priceLabel: string;
  description: string;
  available: boolean;
};

export const ShopProductCard = ({
  id,
  title,
  categoryLabel,
  image,
  priceLabel,
  description,
  available,
}: ShopProductCardProps) => {
  const navigate = useNavigate();
  const snippet =
    description.length > 160 ? `${description.slice(0, 157).trim()}…` : description;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
      <div className="relative h-64 overflow-hidden flex-shrink-0 bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!available ? (
          <Badge className="absolute right-3 top-3 bg-background/90 text-foreground" variant="secondary">
            Unavailable
          </Badge>
        ) : null}
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{categoryLabel}</span>
        </div>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-balance">{title}</h3>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow">
        <p className="text-muted-foreground leading-relaxed text-sm">{snippet}</p>
        <p className="text-2xl font-bold text-primary">{priceLabel}</p>
      </CardContent>

      <CardFooter>
        <Button className="w-full" size="lg" disabled={!available} onClick={() => navigate(`/products/${id}`)}>
          {available ? "View product" : "Sold out"}
        </Button>
      </CardFooter>
    </Card>
  );
};
