type SkillCardProps = {
  name: string;
  level: string;
};

function SkillCard({ name, level }: SkillCardProps) {
  return (
    <div className="skill-card">
      <h3>{name}</h3>
      <p>{level}</p>
    </div>
  );
}

export default SkillCard;