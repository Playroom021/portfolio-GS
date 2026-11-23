import SkillCard from './components/SkillCard.jsx';
import ProjectCard from './components/ProjectCard.jsx'
function App() {
  return (
    <div>
      <h1>My Technical Skills</h1>

      <SkillCard name="Java" level="Advanced" />
      <SkillCard name="React" level="Beginner" />
      <SkillCard name="Spring Boot" level="Intermediate" />

        <h1>My Projects</h1>
        <ProjectCard projectTitle ="CattleEye2.0" projectDetails="Ai powered Cattle Breed Identification System " technology ="python , react, etc " />
    </div>
  );
}

export default App;