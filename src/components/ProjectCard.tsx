import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
}

export const ProjectCard = ({ id, title, location, description, image, raised, goal }: ProjectCardProps) => {
  const navigate = useNavigate();
  const progress = (raised / goal) * 100;
  const remaining = goal - raised;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <h3 className="text-2xl font-bold leading-tight">{title}</h3>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-2xl font-bold text-primary">
              ${raised.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              of ${goal.toLocaleString()} goal
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            ${remaining.toLocaleString()} still needed
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate(`/products/${id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
