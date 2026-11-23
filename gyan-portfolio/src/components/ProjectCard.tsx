type ProjectCardProps= {
    projectTitle: String;
    projectDetails: String;
    technology:String;
};

function ProjectCard(){
    return(
        <div className="ProjectCard">
            <h2>{projectTitle}</h2>
            <p>{projectDetails}</p>
            <p>{technology}</p>
        </div>
    )
    
}
export default ProjectCard;
