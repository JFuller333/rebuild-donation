const stats = [
  { value: "127", label: "Projects Completed" },
  { value: "$2.4M", label: "Community Investment" },
  { value: "1,850", label: "Families Helped" },
  { value: "23", label: "Neighborhoods Transformed" },
];

export const Stats = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
